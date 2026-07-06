import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Corre ANTES que AuthGuard('google'/'github'): si el provider no tiene
// credenciales en .env responde 503 con instrucciones claras en lugar de
// un error interno de passport por estrategia desconocida.
@Injectable()
export class OAuthEnabledGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provider: 'google' | 'github' = request.path.includes('github')
      ? 'github'
      : 'google';

    const clientId = this.configService.get<string>(`oauth.${provider}.clientId`);
    const clientSecret = this.configService.get<string>(`oauth.${provider}.clientSecret`);

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        `El login con ${provider === 'google' ? 'Google' : 'GitHub'} no está configurado. ` +
          `Agrega ${provider.toUpperCase()}_CLIENT_ID y ${provider.toUpperCase()}_CLIENT_SECRET al .env del API (ver OAUTH.md).`,
      );
    }

    return true;
  }
}
