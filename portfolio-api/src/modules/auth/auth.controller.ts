import { Controller, Post, Get, Patch, Body, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OAuthProfile } from './interfaces/oauth-profile.interface';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { OAuthEnabledGuard } from '@/common/guards/oauth-enabled.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // Qué providers OAuth están configurados (el frontend decide qué botones mostrar)
  @Public()
  @Get('providers')
  getProviders() {
    return this.authService.getEnabledProviders();
  }

  // --- Google ---
  @Public()
  @UseGuards(OAuthEnabledGuard, AuthGuard('google'))
  @Get('google')
  googleAuth() {
    // passport redirige a Google
  }

  @Public()
  @UseGuards(OAuthEnabledGuard, AuthGuard('google'))
  @Get('google/callback')
  async googleCallback(@CurrentUser() profile: OAuthProfile, @Res() res: Response) {
    return this.oauthRedirect(profile, res);
  }

  // --- GitHub ---
  @Public()
  @UseGuards(OAuthEnabledGuard, AuthGuard('github'))
  @Get('github')
  githubAuth() {
    // passport redirige a GitHub
  }

  @Public()
  @UseGuards(OAuthEnabledGuard, AuthGuard('github'))
  @Get('github/callback')
  async githubCallback(@CurrentUser() profile: OAuthProfile, @Res() res: Response) {
    return this.oauthRedirect(profile, res);
  }

  private async oauthRedirect(profile: OAuthProfile, res: Response) {
    const frontend = this.configService.get<string>('frontendUrl');
    try {
      const { accessToken, refreshToken } = await this.authService.oauthLogin(profile);
      return res.redirect(
        `${frontend}/auth/callback?access=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}`,
      );
    } catch (err) {
      return res.redirect(`${frontend}/login?error=oauth`);
    }
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  logout(@CurrentUser('_id') userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiBearerAuth()
  @Get('me')
  getProfile(@CurrentUser('_id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @ApiBearerAuth()
  @Patch('me')
  updateProfile(@CurrentUser('_id') userId: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }
}
