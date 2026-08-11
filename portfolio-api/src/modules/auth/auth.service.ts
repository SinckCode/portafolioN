import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '@/modules/users/users.service';
import { MailService } from '@/modules/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OAuthProfile } from './interfaces/oauth-profile.interface';
import { UserDocument } from '@/modules/users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;
    return user;
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
    });

    const verificationToken = uuidv4();
    await this.usersService.setVerificationToken(String(user._id), verificationToken);
    this.mailService
      .sendVerifyEmail(user.email, user.name, verificationToken)
      .catch((err) =>
        this.logger.error(`Failed to send verification email to ${user.email}`, err?.stack),
      );

    const tokens = await this.generateTokens(user);
    await this.usersService.setRefreshToken(String(user._id), tokens.refreshToken);

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.verifyEmail(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    return { message: 'Email verified successfully' };
  }

  // Providers OAuth con credenciales configuradas (para el frontend)
  getEnabledProviders() {
    return {
      google: Boolean(
        this.configService.get<string>('oauth.google.clientId') &&
          this.configService.get<string>('oauth.google.clientSecret'),
      ),
      github: Boolean(
        this.configService.get<string>('oauth.github.clientId') &&
          this.configService.get<string>('oauth.github.clientSecret'),
      ),
    };
  }

  // Find-or-create para login social. El email verificado llega del provider.
  async oauthLogin(profile: OAuthProfile) {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        // password aleatorio: estas cuentas entran solo por OAuth
        password: uuidv4(),
        name: profile.name,
      });
      await this.usersService.update(String(user._id), {
        provider: profile.provider,
        providerId: profile.providerId,
        isVerified: true,
        avatar: profile.avatar || '',
      } as any);
      this.logger.log(`OAuth user created via ${profile.provider}: ${profile.email}`);
    } else if (user.provider === 'local' || !user.providerId) {
      // Cuenta local existente: vincula el provider sin tocar su password
      await this.usersService.update(String(user._id), {
        provider: profile.provider,
        providerId: profile.providerId,
        isVerified: true,
        ...(user.avatar ? {} : { avatar: profile.avatar || '' }),
      } as any);
    }

    const fresh = await this.usersService.findById(String(user._id));
    const tokens = await this.generateTokens(fresh);
    await this.usersService.setRefreshToken(String(fresh._id), tokens.refreshToken);

    return { user: fresh.toJSON(), ...tokens };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.setRefreshToken(String(user._id), tokens.refreshToken);

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.usersService.setRefreshToken(String(user._id), tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Return success even if email not found for security
      return { message: 'If this email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await this.usersService.setResetPasswordToken(String(user._id), resetToken, expires);

    this.mailService
      .sendResetPassword(user.email, user.name, resetToken)
      .catch((err) =>
        this.logger.error(`Failed to send reset password email to ${user.email}`, err?.stack),
      );

    return { message: 'If this email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.updatePassword(String(user._id), resetPasswordDto.password);
    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(userId, updateProfileDto);
  }

  private async generateTokens(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiration', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiration', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
