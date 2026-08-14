import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '@/modules/users/users.service';
import { MailService } from '@/modules/mail/mail.service';

// Mock bcrypt to avoid native module issues
jest.mock('bcrypt', () => ({
  hash: jest.fn((pw: string) => Promise.resolve(`hashed-${pw}`)),
  compare: jest.fn((pw: string, hash: string) => Promise.resolve(hash === `hashed-${pw}`)),
}));

// Mock uuid
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const mockUser = {
  _id: 'user-id-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'subscriber',
  passwordHash: 'hashed-correct-password',
  refreshToken: null,
  provider: 'local',
  toJSON: () => ({
    _id: 'user-id-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'subscriber',
  }),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Record<string, jest.Mock>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setRefreshToken: jest.fn(),
      setVerificationToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('mock-token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const map: Record<string, string> = {
                'jwt.secret': 'test-secret',
                'jwt.refreshSecret': 'test-refresh-secret',
                'jwt.expiration': '15m',
                'jwt.refreshExpiration': '7d',
              };
              return map[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: MailService,
          useValue: { sendVerifyEmail: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user with correct credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const result = await service.validateUser('test@example.com', 'correct-password');
      expect(result).toBeTruthy();
      expect(result!.email).toBe('test@example.com');
    });

    it('should return null with wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const result = await service.validateUser('test@example.com', 'wrong-password');
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('no@exist.com', 'any');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens on valid login', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const result = await service.login({
        email: 'test@example.com',
        password: 'correct-password',
      });
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
      expect(usersService.setRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });
      expect(result.accessToken).toBeDefined();
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@example.com', password: 'pass', name: 'User' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      const result = await service.logout('user-id-1');
      expect(usersService.setRefreshToken).toHaveBeenCalledWith('user-id-1', null);
      expect(result.message).toContain('Logged out');
    });
  });
});
