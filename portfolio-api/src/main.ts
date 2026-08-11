// dotenv PRIMERO: auth.module decide en tiempo de import qué estrategias
// OAuth registrar según el .env
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const isProd = process.env.NODE_ENV === 'production';

  // Detrás de Cloudflare: confía en el proxy para IP real / HTTPS
  app.set('trust proxy', 1);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  // Cabeceras de seguridad explícitas (el default no fijaba HSTS/CORP tras el proxy)
  app.use(
    helmet({
      contentSecurityPolicy: false, // el frontend maneja su CSP; evita romper /uploads
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // sirve /uploads a angelonesto.com
      hsts: { maxAge: 31536000, includeSubDomains: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  const corsOrigins = configService.get<string>('cors.origins', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigins.split(',').map((o: string) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  app.setGlobalPrefix('api', { exclude: ['health'] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filters (NestJS applies in reverse order — last registered runs first)
  // MongoExceptionFilter registered first so HttpExceptionFilter runs first for HTTP exceptions
  app.useGlobalFilters(new MongoExceptionFilter(), new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Swagger solo fuera de producción: no exponer la superficie del API en público
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Portfolio API')
      .setDescription('API for angelonesto.com portfolio, blog, and courses')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('port', 3001);
  await app.listen(port);
  console.log(`Portfolio API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
