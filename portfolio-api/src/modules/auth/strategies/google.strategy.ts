import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-google-oauth20';
import { OAuthProfile } from '../interfaces/oauth-profile.interface';

// Solo se registra en AuthModule si GOOGLE_CLIENT_ID/SECRET existen en .env
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.google.clientId'),
      clientSecret: configService.get<string>('oauth.google.clientSecret'),
      callbackURL: `${configService.get<string>('oauth.callbackBase')}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): OAuthProfile {
    return {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails?.[0]?.value || '',
      name: profile.displayName || 'Usuario de Google',
      avatar: profile.photos?.[0]?.value || '',
    };
  }
}
