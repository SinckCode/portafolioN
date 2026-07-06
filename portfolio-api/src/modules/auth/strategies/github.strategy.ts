import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-github2';
import { OAuthProfile } from '../interfaces/oauth-profile.interface';

// Solo se registra en AuthModule si GITHUB_CLIENT_ID/SECRET existen en .env
@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.github.clientId'),
      clientSecret: configService.get<string>('oauth.github.clientSecret'),
      callbackURL: `${configService.get<string>('oauth.callbackBase')}/api/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): OAuthProfile {
    const username = profile.username || `github-${profile.id}`;
    return {
      provider: 'github',
      providerId: profile.id,
      // GitHub puede no exponer el email: fallback noreply estable
      email: profile.emails?.[0]?.value || `${username}@users.noreply.github.com`,
      name: profile.displayName || username,
      avatar: profile.photos?.[0]?.value || '',
    };
  }
}
