# Arquitectura del Backend — NestJS API

Este documento describe la estructura completa del backend con NestJS para que Stitch genere el codigo. Incluye: estructura de carpetas, cada modulo con sus archivos, schemas, DTOs, controladores, servicios, guards, pipes, interceptors, middleware y configuracion.

---

## Infraestructura de Deploy

```
┌──────────────────────────────────────────────────────────────────┐
│                     Cloudflare Tunnel                            │
│                  angelonesto.com (dominio)                       │
└───────────┬───────────────────────────┬──────────────────────────┘
            │                           │
   api.angelonesto.com          angelonesto.com
            │                           │
┌───────────▼──────────┐   ┌────────────▼─────────────┐
│  VM (vmbr1 - LAN)   │   │  VM (vmbr1 - LAN)       │
│  Nginx Reverse Proxy │   │  Nginx Reverse Proxy     │
│  :80/:443 → :3001    │   │  :80/:443 → :3000        │
│                      │   │                           │
│  PM2: nestjs-api     │   │  PM2: nextjs-frontend     │
│  Puerto: 3001        │   │  Puerto: 3000              │
│  Node.js 20 LTS      │   │  Node.js 20 LTS           │
└───────────┬──────────┘   └───────────────────────────┘
            │
   ┌────────┼──────────────────┐
   │        │                  │
┌──▼────────▼──┐  ┌────────────▼───┐
│  MongoDB 7   │  │  Redis         │
│  VM 101      │  │  VM 103 / cont │
│  core1       │  │  Puerto: 6379  │
│ 10.10.30.101 │  │                │
│  :27017      │  │  Cache +       │
│              │  │  Rate Limit +  │
│  DB: portfolio│ │  Sessions      │
└──────────────┘  └────────────────┘
```

---

## Estructura de Carpetas del Proyecto

```
portfolio-api/
├── src/
│   ├── main.ts                          # Bootstrap de la app
│   ├── app.module.ts                    # Modulo raiz
│   │
│   ├── config/                          # Configuracion
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   ├── database.config.ts           # Conexion MongoDB
│   │   ├── redis.config.ts              # Conexion Redis
│   │   ├── mail.config.ts               # Configuracion SMTP
│   │   ├── storage.config.ts            # Cloudflare R2 / MinIO
│   │   ├── jwt.config.ts                # Claves JWT
│   │   └── throttle.config.ts           # Rate limiting
│   │
│   ├── common/                          # Utilidades compartidas
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── api-paginated.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── ownership.guard.ts
│   │   │   └── enrollment.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── cache.interceptor.ts
│   │   ├── pipes/
│   │   │   ├── parse-objectid.pipe.ts
│   │   │   └── slug-transform.pipe.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── mongo-exception.filter.ts
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts
│   │   │   └── cors.middleware.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   ├── interfaces/
│   │   │   ├── paginated-result.interface.ts
│   │   │   └── jwt-payload.interface.ts
│   │   └── utils/
│   │       ├── slug.util.ts
│   │       ├── reading-time.util.ts
│   │       └── sanitize.util.ts
│   │
│   ├── modules/
│   │   ├── auth/                        # Autenticacion
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── jwt-refresh.strategy.ts
│   │   │   │   ├── github.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       ├── login.dto.ts
│   │   │       ├── refresh-token.dto.ts
│   │   │       ├── forgot-password.dto.ts
│   │   │       ├── reset-password.dto.ts
│   │   │       └── update-profile.dto.ts
│   │   │
│   │   ├── users/                       # Usuarios
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── user.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       ├── update-user.dto.ts
│   │   │       └── user-query.dto.ts
│   │   │
│   │   ├── posts/                       # Blog
│   │   │   ├── posts.module.ts
│   │   │   ├── posts.controller.ts
│   │   │   ├── posts.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── post.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-post.dto.ts
│   │   │       ├── update-post.dto.ts
│   │   │       └── post-query.dto.ts
│   │   │
│   │   ├── categories/                  # Categorias
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── category.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-category.dto.ts
│   │   │       └── update-category.dto.ts
│   │   │
│   │   ├── courses/                     # Cursos
│   │   │   ├── courses.module.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   ├── schemas/
│   │   │   │   ├── course.schema.ts
│   │   │   │   ├── module.schema.ts
│   │   │   │   └── lesson.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-course.dto.ts
│   │   │       ├── update-course.dto.ts
│   │   │       ├── create-module.dto.ts
│   │   │       ├── create-lesson.dto.ts
│   │   │       ├── update-lesson.dto.ts
│   │   │       └── course-query.dto.ts
│   │   │
│   │   ├── enrollments/                 # Inscripciones
│   │   │   ├── enrollments.module.ts
│   │   │   ├── enrollments.controller.ts
│   │   │   ├── enrollments.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── enrollment.schema.ts
│   │   │   └── dto/
│   │   │       ├── enroll.dto.ts
│   │   │       ├── update-progress.dto.ts
│   │   │       └── create-review.dto.ts
│   │   │
│   │   ├── projects/                    # Portafolio
│   │   │   ├── projects.module.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── project.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-project.dto.ts
│   │   │       ├── update-project.dto.ts
│   │   │       └── project-query.dto.ts
│   │   │
│   │   ├── comments/                    # Comentarios
│   │   │   ├── comments.module.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── comment.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-comment.dto.ts
│   │   │       ├── update-comment.dto.ts
│   │   │       └── comment-query.dto.ts
│   │   │
│   │   ├── upload/                      # Subida de archivos
│   │   │   ├── upload.module.ts
│   │   │   ├── upload.controller.ts
│   │   │   ├── upload.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── media.schema.ts
│   │   │   └── dto/
│   │   │       └── media-query.dto.ts
│   │   │
│   │   ├── newsletter/                  # Newsletter
│   │   │   ├── newsletter.module.ts
│   │   │   ├── newsletter.controller.ts
│   │   │   ├── newsletter.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── newsletter.schema.ts
│   │   │   └── dto/
│   │   │       └── subscribe.dto.ts
│   │   │
│   │   ├── site-config/                 # Config del sitio
│   │   │   ├── site-config.module.ts
│   │   │   ├── site-config.controller.ts
│   │   │   ├── site-config.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── site-config.schema.ts
│   │   │   └── dto/
│   │   │       └── update-config.dto.ts
│   │   │
│   │   ├── analytics/                   # Metricas
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── schemas/
│   │   │       └── page-view.schema.ts
│   │   │
│   │   ├── mail/                        # Servicio de correo
│   │   │   ├── mail.module.ts
│   │   │   ├── mail.service.ts
│   │   │   └── templates/
│   │   │       ├── welcome.hbs
│   │   │       ├── reset-password.hbs
│   │   │       ├── verify-email.hbs
│   │   │       ├── new-post.hbs
│   │   │       ├── new-course.hbs
│   │   │       ├── enrollment-welcome.hbs
│   │   │       ├── course-completed.hbs
│   │   │       └── comment-notification.hbs
│   │   │
│   │   └── certificates/               # Certificados
│   │       ├── certificates.module.ts
│   │       ├── certificates.controller.ts
│   │       ├── certificates.service.ts
│   │       └── dto/
│   │           └── verify-certificate.dto.ts
│   │
│   └── seeds/                           # Datos iniciales
│       ├── seed.module.ts
│       ├── seed.service.ts
│       ├── data/
│       │   ├── admin-user.seed.ts
│       │   ├── categories.seed.ts
│       │   ├── projects.seed.ts        # Migracion desde projects.js
│       │   └── site-config.seed.ts
│       └── seed.command.ts
│
├── test/
│   ├── e2e/
│   │   ├── auth.e2e-spec.ts
│   │   ├── posts.e2e-spec.ts
│   │   ├── courses.e2e-spec.ts
│   │   ├── projects.e2e-spec.ts
│   │   └── comments.e2e-spec.ts
│   └── unit/
│       ├── auth.service.spec.ts
│       ├── posts.service.spec.ts
│       ├── courses.service.spec.ts
│       └── upload.service.spec.ts
│
├── .env                                 # Variables de entorno (NO en git)
├── .env.example                         # Plantilla de variables
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── package.json
├── Dockerfile
├── docker-compose.yml                   # Para desarrollo local
├── ecosystem.config.js                  # PM2 config para produccion
├── nginx.conf                           # Config de Nginx
└── README.md
```

---

## Archivo de Bootstrap

### main.ts

```typescript
// Entrada principal de la aplicacion NestJS
// Configura:
// - Prefijo global /api
// - ValidationPipe global (whitelist, forbidNonWhitelisted, transform)
// - CORS (origins: angelonesto.com, localhost:3000)
// - Helmet para headers de seguridad
// - Compresion gzip
// - Cookie parser
// - Swagger (solo en desarrollo)
// - Puerto: process.env.PORT || 3001
// - Logger: Winston con transporte a archivo + consola

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.enableCors({
    origin: [
      'https://angelonesto.com',
      'https://www.angelonesto.com',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

---

## Modulo Raiz

### app.module.ts

```typescript
// Importa todos los modulos del sistema
// Configura:
// - ConfigModule (variables de entorno, validacion con Joi)
// - MongooseModule (conexion a MongoDB VM 101)
// - ThrottlerModule (rate limiting global)
// - CacheModule (Redis)
// - ScheduleModule (tareas programadas: limpieza tokens, analytics)
// - ServeStaticModule (archivos subidos, solo desarrollo)

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema, // Joi
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGODB_URI'),
        // mongodb://admin:onesto01@10.10.30.101:27017/portfolio
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 1 minuto
      limit: 100,   // 100 requests por minuto
    }]),
    CacheModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: 300, // 5 minutos default
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    // Modulos de negocio
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    CoursesModule,
    EnrollmentsModule,
    ProjectsModule,
    CommentsModule,
    UploadModule,
    NewsletterModule,
    SiteConfigModule,
    AnalyticsModule,
    MailModule,
    CertificatesModule,
    SeedModule,
  ],
})
export class AppModule {}
```

---

## Variables de Entorno

### .env.example

```bash
# Servidor
NODE_ENV=production
PORT=3001
API_URL=https://api.angelonesto.com
FRONTEND_URL=https://angelonesto.com

# MongoDB (VM 101 - core1 - red vmbr2)
MONGODB_URI=mongodb://admin:onesto01@10.10.30.101:27017/portfolio

# Redis
REDIS_HOST=10.10.20.XXX
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=clave-secreta-access-cambiar-en-produccion
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=clave-secreta-refresh-cambiar-en-produccion
JWT_REFRESH_EXPIRATION=7d

# Email (VM 102 - servidor de correo propio)
SMTP_HOST=10.10.20.102
SMTP_PORT=587
SMTP_USER=noreply@angelonesto.com
SMTP_PASSWORD=clave-del-smtp
SMTP_FROM="Angel Onesto <noreply@angelonesto.com>"

# Almacenamiento (Cloudflare R2)
STORAGE_TYPE=r2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=portfolio-media
R2_PUBLIC_URL=https://media.angelonesto.com

# OAuth (opcional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=https://api.angelonesto.com/api/auth/github/callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://api.angelonesto.com/api/auth/google/callback

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
THROTTLE_LOGIN_LIMIT=5
THROTTLE_REGISTER_LIMIT=3
```

---

## Modulos Detallados

---

### Modulo 1: Auth

**Archivos:** `src/modules/auth/`

**Responsabilidad:** Registro, login, logout, refresh tokens, recuperacion de contrasena, OAuth, perfil del usuario actual.

#### auth.controller.ts

```
POST   /api/auth/register          → Publico
  Body: { name, email, password }
  Response: { user, accessToken, refreshToken }
  Logica:
    1. Validar DTO (email formato, password min 8 chars)
    2. Verificar email no existe
    3. Hash password con bcrypt (salt rounds 12)
    4. Crear usuario con role "subscriber"
    5. Generar tokens
    6. Enviar email de verificacion
    7. Retornar usuario (sin passwordHash) + tokens
    8. Refresh token en httpOnly cookie

POST   /api/auth/login             → Publico
  Body: { email, password }
  Response: { user, accessToken }
  Cookies: refreshToken (httpOnly, secure, sameSite: strict, path: /api/auth, maxAge: 7d)
  Logica:
    1. Buscar usuario por email
    2. Comparar password con bcrypt
    3. Si falla: 401 "Email o contrasena incorrectos" (no revelar cual)
    4. Generar access token (15min) + refresh token (7d)
    5. Guardar refresh token hasheado en user.refreshTokens[]
    6. Set refresh token en httpOnly cookie
    7. Retornar user + accessToken

POST   /api/auth/refresh           → Cookie requerida
  Cookies: refreshToken
  Response: { accessToken }
  Logica:
    1. Extraer refreshToken de cookie
    2. Verificar firma JWT
    3. Buscar usuario, verificar token en refreshTokens[]
    4. Rotar: invalidar token viejo, generar nuevo refresh + access
    5. Set nueva cookie
    6. Retornar accessToken

POST   /api/auth/logout            → Autenticado
  Cookies: refreshToken
  Logica:
    1. Extraer refreshToken de cookie
    2. Remover de user.refreshTokens[]
    3. Limpiar cookie
    4. 200 OK

POST   /api/auth/forgot-password   → Publico
  Body: { email }
  Logica:
    1. Buscar usuario por email
    2. Si no existe: retornar 200 igual (no revelar si existe)
    3. Generar token aleatorio (crypto.randomBytes, 32 hex)
    4. Guardar hash del token + expiracion (1 hora) en usuario
    5. Enviar email con link: FRONTEND_URL/reset-password?token=xxx
    6. Rate limit: 3 solicitudes por email por hora

POST   /api/auth/reset-password    → Publico
  Body: { token, newPassword }
  Logica:
    1. Hashear token recibido
    2. Buscar usuario con ese hash y expiracion > now
    3. Si no existe: 400 "Token invalido o expirado"
    4. Hash nueva contrasena
    5. Limpiar resetToken y expiracion
    6. Invalidar todos los refreshTokens (cerrar todas las sesiones)
    7. 200 OK

POST   /api/auth/verify-email      → Publico
  Body: { token }
  Logica:
    1. Buscar usuario con verificationToken
    2. Marcar isVerified = true
    3. Limpiar verificationToken

GET    /api/auth/me                → Autenticado (JWT)
  Response: { user } (sin passwordHash, sin refreshTokens)

PATCH  /api/auth/me                → Autenticado (JWT)
  Body: { name?, bio?, avatar?, socialLinks? }
  Logica:
    1. Validar campos permitidos (no puede cambiar email, role, password por aqui)
    2. Actualizar y retornar usuario

GET    /api/auth/github             → Publico (redirige a GitHub OAuth)
GET    /api/auth/github/callback    → GitHub callback
GET    /api/auth/google             → Publico (redirige a Google OAuth)
GET    /api/auth/google/callback    → Google callback
```

#### auth.service.ts

```
Metodos:
  register(dto: RegisterDto): Promise<AuthResponse>
  login(dto: LoginDto): Promise<AuthResponse>
  refreshTokens(refreshToken: string): Promise<TokenPair>
  logout(userId: string, refreshToken: string): Promise<void>
  forgotPassword(email: string): Promise<void>
  resetPassword(token: string, newPassword: string): Promise<void>
  verifyEmail(token: string): Promise<void>
  getProfile(userId: string): Promise<User>
  updateProfile(userId: string, dto: UpdateProfileDto): Promise<User>
  validateOAuthUser(profile: OAuthProfile): Promise<AuthResponse>

Metodos privados:
  generateTokens(user: User): TokenPair
  hashToken(token: string): string
  generateRandomToken(): string
```

#### Strategies

```
jwt.strategy.ts
  - Extrae token del header Authorization: Bearer xxx
  - Valida firma con JWT_ACCESS_SECRET
  - Inyecta payload { userId, email, role } en request.user

jwt-refresh.strategy.ts
  - Extrae token de cookie "refreshToken"
  - Valida con JWT_REFRESH_SECRET

github.strategy.ts
  - OAuth 2.0 con GitHub
  - Obtiene profile (name, email, avatar)
  - Crea o vincula usuario

google.strategy.ts
  - OAuth 2.0 con Google
  - Obtiene profile (name, email, avatar)
  - Crea o vincula usuario
```

#### DTOs

```
register.dto.ts
  name: string          @IsString @MinLength(2) @MaxLength(100)
  email: string         @IsEmail
  password: string      @IsString @MinLength(8) @MaxLength(128)
                        @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  subscribeNewsletter?: boolean  @IsOptional @IsBoolean (default true)

login.dto.ts
  email: string         @IsEmail
  password: string      @IsString

forgot-password.dto.ts
  email: string         @IsEmail

reset-password.dto.ts
  token: string         @IsString @IsNotEmpty
  newPassword: string   @IsString @MinLength(8) @MaxLength(128)

update-profile.dto.ts
  name?: string         @IsOptional @IsString @MinLength(2)
  bio?: string          @IsOptional @IsString @MaxLength(500)
  avatar?: string       @IsOptional @IsUrl
  socialLinks?: {       @IsOptional @ValidateNested
    github?: string     @IsOptional @IsUrl
    linkedin?: string   @IsOptional @IsUrl
    twitter?: string    @IsOptional @IsUrl
  }
```

---

### Modulo 2: Users

**Archivos:** `src/modules/users/`

**Responsabilidad:** CRUD de usuarios para admin, gestion de roles.

#### users.controller.ts

```
GET    /api/users                  → Admin
  Query: { page, limit, search?, role?, isVerified? }
  Response: { data: User[], meta: { total, page, lastPage } }
  Logica:
    1. Construir query con filtros opcionales
    2. Busqueda por name o email (regex case-insensitive)
    3. Paginar con skip/limit
    4. Ordenar por createdAt desc
    5. Excluir passwordHash y refreshTokens de respuesta

GET    /api/users/stats            → Admin
  Response: { total, newThisMonth, byRole: { admin, editor, subscriber } }

GET    /api/users/:id              → Admin
  Response: { user, enrollments[], commentsCount }

PATCH  /api/users/:id/role         → Admin
  Body: { role: "admin" | "editor" | "subscriber" }
  Logica:
    1. Validar que no se cambie el rol del propio admin
    2. Actualizar rol
    3. Si baja de rol: invalidar refreshTokens (forzar re-login)

PATCH  /api/users/:id/status       → Admin
  Body: { isActive: boolean }
  Logica:
    1. Desactivar/activar usuario
    2. Si desactiva: invalidar todos los refreshTokens

DELETE /api/users/:id              → Admin
  Logica:
    1. No permitir eliminar el propio admin
    2. Eliminar: enrollments, comments, newsletter subscription
    3. Eliminar usuario
    4. Soft delete alternativo: marcar isDeleted = true
```

#### user.schema.ts (Mongoose)

```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, default: null })
  avatar: string;

  @Prop({ type: String, enum: ['admin', 'editor', 'subscriber'], default: 'subscriber' })
  role: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];

  @Prop({ type: String, default: null, maxlength: 500 })
  bio: string;

  @Prop({ type: Object, default: {} })
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };

  // OAuth
  @Prop({ type: String, default: null })
  githubId: string;

  @Prop({ type: String, default: null })
  googleId: string;

  // Password reset
  @Prop({ type: String, default: null })
  resetPasswordToken: string;

  @Prop({ type: Date, default: null })
  resetPasswordExpires: Date;

  // Email verification
  @Prop({ type: String, default: null })
  verificationToken: string;
}
```

---

### Modulo 3: Posts (Blog)

**Archivos:** `src/modules/posts/`

**Responsabilidad:** CRUD de posts del blog, busqueda, likes, vistas.

#### posts.controller.ts

```
GET    /api/posts                  → Publico
  Query: {
    page?: number (default 1),
    limit?: number (default 9, max 50),
    category?: string (slug de categoria),
    tag?: string,
    search?: string,
    sort?: "recent" | "popular" | "views" (default "recent"),
    status?: "published" (forzado para publico)
  }
  Response: { data: Post[], meta: { total, page, lastPage, perPage } }
  Logica:
    1. Solo posts con status "published" y publishedAt <= now
    2. Si category: join con Category por slug
    3. Si tag: filtrar donde tags contiene el valor
    4. Si search: text index en title + excerpt + content + tags
    5. Populate author (name, avatar), category (name, slug, color)
    6. Excluir content del listing (solo excerpt)
    7. Sort: recent=publishedAt desc, popular=likes desc, views=views desc
    8. Paginar

GET    /api/posts/search           → Publico
  Query: { q: string, limit?: number (default 10) }
  Response: Post[] (titulo, slug, excerpt, coverImage)
  Logica:
    1. MongoDB text search ($text: { $search: q })
    2. Solo published
    3. Retorna campos minimos para autocompletado

GET    /api/posts/category/:slug   → Publico
  Alias de GET /api/posts?category=:slug

GET    /api/posts/tag/:tag         → Publico
  Alias de GET /api/posts?tag=:tag

GET    /api/posts/:slug            → Publico
  Response: Post completo con content
  Logica:
    1. Buscar por slug, status published
    2. Incrementar views atomicamente (+1)
    3. Populate author completo + category
    4. Populate relatedPosts (3 posts de misma categoria, excluyendo actual)
    5. Registrar pageView en analytics

POST   /api/posts                  → Admin/Editor
  Body: CreatePostDto
  Logica:
    1. Generar slug desde titulo (slugify, verificar unicidad)
    2. Calcular readingTime desde content
    3. Si status="published": set publishedAt = now
    4. Si status="draft": publishedAt = null
    5. author = usuario actual
    6. Incrementar postCount en categoria

PATCH  /api/posts/:id              → Admin/Editor
  Body: UpdatePostDto (partial de CreatePostDto)
  Logica:
    1. Si cambia titulo: regenerar slug (verificar unicidad)
    2. Si cambia content: recalcular readingTime
    3. Si cambia de draft a published: set publishedAt = now
    4. Si cambia categoria: decrementar vieja, incrementar nueva
    5. Invalidar cache de este post

DELETE /api/posts/:id              → Admin
  Logica:
    1. Decrementar postCount en categoria
    2. Eliminar comentarios asociados
    3. Eliminar post
    4. Invalidar caches relacionados

POST   /api/posts/:id/like        → Autenticado
  Logica:
    1. Verificar que el usuario no haya dado like (almacenar en coleccion separada o array)
    2. Toggle: si ya dio like, quitar; si no, agregar
    3. Actualizar contador likes en post
    4. Response: { liked: boolean, totalLikes: number }
```

#### DTOs

```
create-post.dto.ts
  title: string           @IsString @MinLength(5) @MaxLength(200)
  content: string         @IsString @MinLength(50)
  excerpt: string         @IsString @MaxLength(160)
  coverImage: string      @IsUrl
  category: string        @IsMongoId
  tags: string[]          @IsArray @IsString({ each: true }) @MaxLength(30, { each: true })
  status: string          @IsEnum(['draft', 'published'])
  seo?: {                 @IsOptional @ValidateNested
    metaTitle?: string    @IsOptional @MaxLength(60)
    metaDescription?: string  @IsOptional @MaxLength(160)
    ogImage?: string      @IsOptional @IsUrl
  }
  publishedAt?: Date      @IsOptional @IsDateString (para programar)

post-query.dto.ts
  page?: number           @IsOptional @IsInt @Min(1) (default 1)
  limit?: number          @IsOptional @IsInt @Min(1) @Max(50) (default 9)
  category?: string       @IsOptional @IsString
  tag?: string            @IsOptional @IsString
  search?: string         @IsOptional @IsString @MaxLength(100)
  sort?: string           @IsOptional @IsEnum(['recent', 'popular', 'views'])
  status?: string         @IsOptional @IsEnum(['draft', 'published', 'archived'])
```

#### post.schema.ts

```typescript
@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, minlength: 5, maxlength: 200 })
  title: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, maxlength: 160 })
  excerpt: string;

  @Prop({ required: true })
  content: string;  // markdown

  @Prop({ required: true })
  coverImage: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: [String], index: true })
  tags: string[];

  @Prop({ type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true })
  status: string;

  @Prop({ type: Date, default: null, index: true })
  publishedAt: Date;

  @Prop({ type: Number, default: 0 })
  readingTime: number;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likedBy: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };

  @Prop({ type: [Types.ObjectId], ref: 'Post', default: [] })
  relatedPosts: Types.ObjectId[];
}

// Indices
PostSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1, status: 1 });
PostSchema.index({ tags: 1, status: 1 });
```

---

### Modulo 4: Categories

**Archivos:** `src/modules/categories/`

#### categories.controller.ts

```
GET    /api/categories             → Publico
  Response: Category[] (ordenadas por name)
  Cache: Redis 5 minutos

POST   /api/categories             → Admin/Editor
  Body: { name, description?, color, icon? }
  Logica:
    1. Generar slug desde name
    2. Verificar unicidad
    3. Invalidar cache

PATCH  /api/categories/:id         → Admin/Editor
  Body: { name?, description?, color?, icon? }
  Logica: actualizar, regenerar slug si cambia name, invalidar cache

DELETE /api/categories/:id         → Admin
  Logica:
    1. Verificar que no hay posts en esta categoria (o reasignar)
    2. Eliminar
    3. Invalidar cache
```

#### category.schema.ts

```typescript
@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, maxlength: 50 })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ maxlength: 200 })
  description: string;

  @Prop({ required: true, match: /^#[0-9A-Fa-f]{6}$/ })
  color: string;

  @Prop({ default: '' })
  icon: string;

  @Prop({ type: Number, default: 0 })
  postCount: number;
}
```

---

### Modulo 5: Courses

**Archivos:** `src/modules/courses/`

**Responsabilidad:** CRUD de cursos con modulos y lecciones, temario, contenido protegido.

#### courses.controller.ts

```
GET    /api/courses                → Publico
  Query: {
    page?, limit?,
    category?: string,
    level?: "beginner" | "intermediate" | "advanced",
    price?: "free" | "paid",
    sort?: "recent" | "popular" | "rating" (default "recent"),
    search?: string
  }
  Response: { data: Course[] (sin modulos.lessons.content/videoUrl), meta }
  Logica:
    1. Solo status "published" o "coming_soon"
    2. Filtros encadenados
    3. Excluir content y videoUrl de lecciones (solo titulos y duracion)
    4. Calcular totalDuration y totalLessons si no denormalizados
    5. Populate instructor (name, avatar), category

GET    /api/courses/:slug          → Publico
  Response: Course con modulos y lecciones (titulos, tipos, duracion, isFree)
  Logica:
    1. Buscar por slug
    2. Para cada leccion: incluir titulo, tipo, duracion, isFree, order
    3. NO incluir content ni videoUrl (excepto lecciones isFree=true)
    4. Si usuario autenticado e inscrito: incluir todo
    5. Registrar pageView

GET    /api/courses/:slug/lessons/:lessonSlug  → Inscrito o leccion gratuita
  Guards: EnrollmentGuard (verifica inscripcion o isFree)
  Response: Lesson completa (content, videoUrl, resources)
  Logica:
    1. Verificar inscripcion del usuario actual O leccion.isFree
    2. Si no inscrito y no gratuita: 403
    3. Retornar contenido completo de la leccion
    4. Incluir leccion anterior y siguiente para navegacion

POST   /api/courses                → Admin
  Body: CreateCourseDto
  Logica:
    1. Generar slug
    2. Crear curso con modulos y lecciones
    3. Calcular totalDuration y totalLessons
    4. Set instructor = usuario actual

PATCH  /api/courses/:id            → Admin
  Body: UpdateCourseDto (puede incluir modulos/lecciones completos)
  Logica:
    1. Actualizar campos basicos
    2. Si cambian modulos/lecciones: recalcular totalDuration, totalLessons
    3. Si cambia status a published: set publishedAt
    4. Invalidar cache

DELETE /api/courses/:id            → Admin
  Logica:
    1. Verificar no hay inscripciones activas (o advertir)
    2. Eliminar enrollments, comentarios, curso
    3. Invalidar caches
```

#### course.schema.ts

```typescript
@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, maxlength: 200 })
  excerpt: string;

  @Prop({ required: true })
  coverImage: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ type: [String], index: true })
  tags: string[];

  @Prop({ type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true })
  level: string;

  @Prop({ type: String, enum: ['es', 'en'], default: 'es' })
  language: string;

  @Prop({ type: String, enum: ['draft', 'published', 'coming_soon', 'archived'], default: 'draft', index: true })
  status: string;

  @Prop({ type: Object, required: true })
  price: {
    type: 'free' | 'paid';
    amount: number;
    currency: string;
  };

  @Prop({ type: [{
    _id: { type: Types.ObjectId, auto: true },
    title: String,
    order: Number,
    lessons: [{
      _id: { type: Types.ObjectId, auto: true },
      title: String,
      slug: String,
      type: { type: String, enum: ['video', 'text', 'quiz', 'exercise'] },
      content: String,
      videoUrl: String,
      duration: Number,
      isFree: { type: Boolean, default: false },
      resources: [{ name: String, url: String, type: String }],
      order: Number,
    }],
  }], default: [] })
  modules: any[];

  @Prop({ type: Number, default: 0 })
  totalDuration: number;

  @Prop({ type: Number, default: 0 })
  totalLessons: number;

  @Prop({ type: Number, default: 0 })
  enrollmentCount: number;

  @Prop({ type: Object, default: { average: 0, count: 0 } })
  rating: { average: number; count: number };

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: [String], default: [] })
  whatYouLearn: string[];

  @Prop({ type: Object, default: {} })
  seo: { metaTitle?: string; metaDescription?: string; ogImage?: string };

  @Prop({ type: Date, default: null })
  publishedAt: Date;
}

CourseSchema.index({ title: 'text', excerpt: 'text', description: 'text', tags: 'text' });
CourseSchema.index({ status: 1, publishedAt: -1 });
CourseSchema.index({ level: 1, status: 1 });
```

---

### Modulo 6: Enrollments

**Archivos:** `src/modules/enrollments/`

**Responsabilidad:** Inscripciones, progreso, resenas, certificados.

#### enrollments.controller.ts

```
POST   /api/courses/:id/enroll        → Autenticado
  Logica:
    1. Verificar que no esta ya inscrito
    2. Crear enrollment con progreso vacio
    3. Incrementar enrollmentCount en curso (atomico)
    4. Enviar email de bienvenida al curso
    5. Response: { enrollment }

GET    /api/courses/:id/progress       → Inscrito
  Response: {
    overallProgress: number,
    completedLessons: number,
    totalLessons: number,
    modules: [{ moduleId, title, completed, lessons: [{ lessonId, completed }] }]
  }

PATCH  /api/courses/:courseId/progress/:lessonId  → Inscrito
  Body: { completed: boolean, lastPosition?: number }
  Logica:
    1. Buscar enrollment del usuario para este curso
    2. Actualizar o crear entrada en progress[] para esta leccion
    3. Recalcular overallProgress (completados / total * 100)
    4. Si overallProgress === 100 y no completedAt:
       a. Set completedAt = now
       b. Generar certificado (UUID unico)
       c. Enviar email con certificado
    5. Response: { overallProgress, lessonCompleted: boolean }

GET    /api/enrollments/my-courses     → Autenticado
  Response: Enrollment[] con populate de curso (titulo, imagen, totalLessons)
  Logica:
    1. Buscar enrollments del usuario actual
    2. Populate curso (solo campos para card)
    3. Ordenar: en progreso primero, completados despues

POST   /api/courses/:id/review        → Inscrito
  Body: { rating: number (1-5), comment: string }
  Logica:
    1. Verificar inscripcion
    2. Verificar que no ha dejado resena
    3. Crear comentario tipo "course" con rating
    4. Recalcular rating promedio del curso
    5. Response: { review }
```

#### enrollment.schema.ts

```typescript
@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  course: Types.ObjectId;

  @Prop({ type: [{
    lesson: { type: Types.ObjectId },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    lastPosition: { type: Number, default: 0 },
  }], default: [] })
  progress: any[];

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  overallProgress: number;

  @Prop({ type: Date, default: null })
  completedAt: Date;

  @Prop({ type: Object, default: { issued: false } })
  certificate: {
    issued: boolean;
    issuedAt?: Date;
    certificateId?: string;
  };

  @Prop({ type: Object, default: null })
  review: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
}

EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
```

---

### Modulo 7: Projects

**Archivos:** `src/modules/projects/`

#### projects.controller.ts

```
GET    /api/projects               → Publico
  Query: {
    page?, limit?,
    search?: string,
    type?: string,
    technology?: string (puede ser multiple, separado por coma),
    sort?: "recent" | "oldest" (default "recent"),
    featured?: boolean,
    hasDemo?: boolean
  }
  Response: { data: Project[] (sin details), meta }
  Logica:
    1. Solo status "published"
    2. Si technology: filtrar donde technologies contiene TODOS los seleccionados
    3. Si hasDemo: filtrar donde demo != null o demos.length > 0
    4. Si featured: filtrar donde featured = true
    5. Sort: por date o por order (si featured)
    6. Excluir details del listing

GET    /api/projects/:slug         → Publico
  Response: Project completo
  Logica: buscar por slug, registrar pageView

POST   /api/projects               → Admin
  Body: CreateProjectDto
  Logica: generar slug, crear proyecto

PATCH  /api/projects/:id           → Admin
  Body: UpdateProjectDto

DELETE /api/projects/:id           → Admin

PATCH  /api/projects/:id/order     → Admin
  Body: { order: number }
  Logica: actualizar campo order para reordenar en portafolio

PATCH  /api/projects/:id/featured  → Admin
  Body: { featured: boolean }
```

---

### Modulo 8: Comments

**Archivos:** `src/modules/comments/`

#### comments.controller.ts

```
GET    /api/comments               → Publico
  Query: {
    targetType: "post" | "course" | "lesson",
    targetId: string (MongoId),
    page?, limit?,
    sort?: "recent" | "likes" (default "recent")
  }
  Response: { data: Comment[] con respuestas anidadas, meta }
  Logica:
    1. Solo comentarios aprobados (isApproved=true) para publico
    2. Traer solo comentarios raiz (parentComment=null)
    3. Populate author (name, avatar)
    4. Para cada raiz: traer respuestas (parentComment = commentId)
    5. Paginar solo raices

GET    /api/comments/pending       → Admin/Editor
  Response: Comment[] pendientes de aprobacion (isApproved=false)

POST   /api/comments               → Autenticado
  Body: { content, targetType, targetId, parentComment? }
  Logica:
    1. Validar que el target existe
    2. Si parentComment: validar que existe y es del mismo target
    3. No anidar mas de 1 nivel (parentComment de respuesta debe ser null)
    4. Si autor es admin/editor: isApproved = true automatico
    5. Si subscriber: isApproved = false (requiere moderacion)
    6. Enviar notificacion al autor del target
    7. Si es respuesta: enviar notificacion al autor del comentario padre

PATCH  /api/comments/:id           → Propietario
  Body: { content }
  Logica: solo el autor puede editar, no se puede cambiar target ni parent

PATCH  /api/comments/:id/approve   → Admin/Editor
  Logica: set isApproved = true

PATCH  /api/comments/:id/reject    → Admin/Editor
  Logica: eliminar comentario o marcar como rechazado

DELETE /api/comments/:id           → Admin o Propietario
  Logica:
    1. Si tiene respuestas: marcar como "[Comentario eliminado]" en vez de borrar
    2. Si no tiene respuestas: eliminar completamente
```

#### comment.schema.ts

```typescript
@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, minlength: 1, maxlength: 2000 })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: String, enum: ['post', 'course', 'lesson'], required: true, index: true })
  targetType: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  targetId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentComment: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: Boolean, default: false, index: true })
  isApproved: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  // Solo para resenas de cursos
  @Prop({ type: Number, min: 1, max: 5, default: null })
  rating: number;
}

CommentSchema.index({ targetType: 1, targetId: 1, isApproved: 1 });
CommentSchema.index({ parentComment: 1 });
```

---

### Modulo 9: Upload

**Archivos:** `src/modules/upload/`

**Responsabilidad:** Subida, optimizacion y gestion de archivos.

#### upload.controller.ts

```
POST   /api/upload/image           → Admin/Editor
  Multipart: file (max 10MB, tipos: jpg, png, webp, gif, svg)
  Response: { url, thumbnailUrl, width, height, size, id }
  Logica:
    1. Validar tipo MIME y tamano
    2. Generar nombre unico (uuid + extension)
    3. Optimizar con Sharp:
       a. Convertir a WebP (calidad 85)
       b. Generar thumbnail (300px ancho)
       c. Generar version mediana (800px ancho)
    4. Subir 3 versiones a Cloudflare R2
    5. Guardar metadata en coleccion Media
    6. Retornar URLs publicas

POST   /api/upload/video           → Admin
  Multipart: file (max 500MB, tipos: mp4, webm, mov)
  Response: { url, size, duration, id }
  Logica:
    1. Validar tipo y tamano
    2. Generar nombre unico
    3. Subir a R2 (o stream directo)
    4. Guardar metadata

POST   /api/upload/file            → Admin
  Multipart: file (max 50MB, tipos: pdf, zip, rar, doc, docx, pptx)
  Response: { url, name, size, type, id }

GET    /api/upload/media           → Admin/Editor
  Query: { page?, limit?, type?: "image" | "video" | "document", search? }
  Response: { data: Media[], meta }
  Logica: listar archivos subidos con paginacion

GET    /api/upload/media/:id       → Admin/Editor
  Response: Media con info de uso (en que posts/cursos/proyectos se usa)

DELETE /api/upload/:id             → Admin
  Logica:
    1. Eliminar de R2 (original + thumbnails)
    2. Eliminar registro de Media
    3. NO eliminar si esta en uso (retornar warning con lista de usos)
```

#### media.schema.ts

```typescript
@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: String, default: null })
  thumbnailUrl: string;

  @Prop({ type: String, default: null })
  mediumUrl: string;

  @Prop({ type: String, enum: ['image', 'video', 'document'], required: true, index: true })
  type: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;  // bytes

  @Prop({ type: Number, default: null })
  width: number;

  @Prop({ type: Number, default: null })
  height: number;

  @Prop({ type: Number, default: null })
  duration: number;  // segundos, solo video

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;
}
```

---

### Modulo 10: Newsletter

**Archivos:** `src/modules/newsletter/`

#### newsletter.controller.ts

```
POST   /api/newsletter/subscribe     → Publico
  Body: { email, name? }
  Rate limit: 3/hora por IP
  Logica:
    1. Verificar email no duplicado
    2. Si ya existe e isActive=true: retornar "Ya estas suscrito"
    3. Si ya existe e isActive=false: reactivar
    4. Crear suscripcion
    5. Enviar email de bienvenida
    6. Response: { message: "Suscripcion exitosa" }

POST   /api/newsletter/unsubscribe   → Publico
  Body: { email } o Query: { token } (link en emails)
  Logica:
    1. Buscar por email
    2. Set isActive=false, unsubscribedAt=now
    3. Response: { message: "Suscripcion cancelada" }

GET    /api/newsletter/subscribers   → Admin
  Query: { page?, limit?, search?, isActive? }
  Response: { data: Subscriber[], meta, stats: { active, inactive, total } }

POST   /api/newsletter/send          → Admin
  Body: { subject, content, type: "new_post" | "new_course" | "custom" }
  Logica:
    1. Obtener todos los suscriptores activos
    2. Enviar en batches (50 por batch, delay entre batches)
    3. Registrar envio
    4. Response: { sent: number, failed: number }
```

---

### Modulo 11: Site Config

**Archivos:** `src/modules/site-config/`

#### site-config.controller.ts

```
GET    /api/config/:key            → Publico
  Keys validas: "hero", "about", "contact", "seo", "social", "appearance"
  Response: { key, data }
  Cache: Redis 5 minutos

PATCH  /api/config/:key            → Admin
  Body: { data: object } (estructura depende del key)
  Logica:
    1. Validar key es valido
    2. Upsert: crear si no existe, actualizar si existe
    3. Set updatedBy = usuario actual
    4. Invalidar cache de este key
    5. Response: { key, data }
```

**Schemas de data por key:**

```
key="hero":
  data: {
    name: string,
    subtitle: string,
    tagline: string,
    ctaText: string
  }

key="about":
  data: {
    avatar: string (url),
    bio: string (markdown),
    specializations: [{
      title: string,
      icon: string,
      technologies: string[]
    }]
  }

key="contact":
  data: {
    email: string,
    whatsapp: string,
    github: string,
    linkedin: string,
    twitter?: string
  }

key="seo":
  data: {
    siteTitle: string,
    siteDescription: string,
    defaultOgImage: string,
    googleAnalyticsId: string,
    googleSearchConsoleVerification: string
  }

key="appearance":
  data: {
    primaryColor: string (hex),
    logo: string (url),
    favicon: string (url),
    model3dUrl: string (url .glb)
  }
```

---

### Modulo 12: Analytics

**Archivos:** `src/modules/analytics/`

#### analytics.controller.ts

```
GET    /api/analytics/dashboard    → Admin
  Query: { range: "7d" | "30d" | "90d" | "custom", from?, to? }
  Response: {
    traffic: { totalViews, uniqueVisitors, pageViews, chartData[] },
    blog: { totalPosts, totalViews, topPost, newComments },
    courses: { totalEnrollments, completed, topCourse, byLevel },
    users: { totalUsers, newThisPeriod, byRole, growthChart[] }
  }

GET    /api/analytics/posts/popular  → Admin
  Query: { range, limit? }
  Response: [{ post, views, likes }]

GET    /api/analytics/courses/popular → Admin
  Query: { range, limit? }
  Response: [{ course, enrollments, completionRate }]

GET    /api/analytics/users/growth   → Admin
  Query: { range }
  Response: [{ date, count, cumulative }]
```

#### analytics.service.ts — Tareas programadas

```
@Cron('0 */6 * * *')  // Cada 6 horas
async aggregatePageViews()
  Logica:
    1. Agregar page views por pagina y periodo
    2. Almacenar en coleccion analytics_daily

@Cron('0 2 * * *')  // Diario a las 2 AM
async cleanupOldPageViews()
  Logica:
    1. Eliminar page views individuales mayores a 90 dias
    2. Mantener solo agregados
```

#### page-view.schema.ts

```typescript
@Schema()
export class PageView {
  @Prop({ required: true })
  path: string;

  @Prop({ type: String, default: null })
  referrer: string;

  @Prop({ type: String, default: null })
  userAgent: string;

  @Prop({ type: String, required: true })
  ip: string;  // hasheado para privacidad

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  user: Types.ObjectId;

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp: Date;
}

PageViewSchema.index({ path: 1, timestamp: -1 });
PageViewSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // TTL 90 dias
```

---

### Modulo 13: Mail

**Archivos:** `src/modules/mail/`

**Responsabilidad:** Envio de emails transaccionales usando el servidor de correo propio (VM 102).

#### mail.service.ts

```
Metodos:
  sendWelcome(user: User): Promise<void>
  sendVerifyEmail(user: User, token: string): Promise<void>
  sendResetPassword(user: User, token: string): Promise<void>
  sendEnrollmentWelcome(user: User, course: Course): Promise<void>
  sendCourseCompleted(user: User, course: Course, certificateUrl: string): Promise<void>
  sendCommentNotification(to: User, comment: Comment, target: Post|Course): Promise<void>
  sendNewPostNotification(subscribers: Newsletter[], post: Post): Promise<void>
  sendNewCourseNotification(subscribers: Newsletter[], course: Course): Promise<void>

Configuracion:
  Transport: SMTP via Nodemailer
  Host: 10.10.20.102 (VM 102 mail-server)
  Port: 587 (STARTTLS)
  From: "Angel Onesto <noreply@angelonesto.com>"
  Templates: Handlebars (.hbs) precompilados
```

#### Templates de Email (Handlebars)

```
templates/
├── welcome.hbs
│   Variables: { name, verifyUrl, siteUrl }
│   Contenido: Bienvenida + boton verificar email
│
├── verify-email.hbs
│   Variables: { name, verifyUrl }
│   Contenido: Boton para verificar email
│
├── reset-password.hbs
│   Variables: { name, resetUrl, expiresIn }
│   Contenido: Boton para resetear contrasena
│
├── enrollment-welcome.hbs
│   Variables: { name, courseTitle, courseUrl, firstLessonUrl }
│   Contenido: Bienvenida al curso + boton empezar
│
├── course-completed.hbs
│   Variables: { name, courseTitle, certificateUrl, linkedInShareUrl }
│   Contenido: Felicitacion + boton ver certificado + compartir LinkedIn
│
├── comment-notification.hbs
│   Variables: { authorName, commentExcerpt, targetTitle, targetUrl }
│   Contenido: Nuevo comentario/respuesta en tu contenido
│
├── new-post.hbs
│   Variables: { postTitle, postExcerpt, postUrl, coverImage, unsubscribeUrl }
│   Contenido: Nuevo post en el blog
│
└── new-course.hbs
    Variables: { courseTitle, courseExcerpt, courseUrl, coverImage, unsubscribeUrl }
    Contenido: Nuevo curso disponible
```

---

### Modulo 14: Certificates

**Archivos:** `src/modules/certificates/`

#### certificates.controller.ts

```
GET    /api/certificates/:certificateId   → Publico
  Response: {
    studentName, courseTitle, courseDuration, courseLessons,
    instructorName, issuedAt, certificateId, isValid: boolean
  }
  Logica:
    1. Buscar enrollment con certificate.certificateId
    2. Populate user (name) y course (title, totalDuration, totalLessons)
    3. Si no existe: 404
    4. Retornar datos para renderizar certificado

GET    /api/certificates/:certificateId/pdf  → Publico
  Response: PDF generado con los datos del certificado
  Logica:
    1. Obtener datos del certificado
    2. Generar PDF con PDFKit o Puppeteer (HTML → PDF)
    3. Retornar como stream con Content-Type: application/pdf
```

---

## Elementos Transversales

---

### Guards

```
jwt-auth.guard.ts
  - Extiende AuthGuard('jwt') de @nestjs/passport
  - Verifica header Authorization: Bearer xxx
  - Inyecta request.user con { userId, email, role }
  - Respeta @Public() decorator para rutas publicas

roles.guard.ts
  - Lee metadatos @Roles('admin', 'editor') del handler
  - Compara con request.user.role
  - 403 si no tiene permiso

ownership.guard.ts
  - Para editar/eliminar recursos propios (comentarios, perfil)
  - Compara request.user.userId con el author/owner del recurso
  - Admin siempre bypasea

enrollment.guard.ts
  - Verifica que el usuario esta inscrito en el curso
  - O que la leccion es isFree=true
  - Usado en rutas de lecciones
```

### Interceptors

```
transform.interceptor.ts
  - Envuelve todas las respuestas en formato estandar:
    {
      success: true,
      data: ...,
      meta: { timestamp, path }
    }
  - Errores:
    {
      success: false,
      error: { code, message, details? },
      meta: { timestamp, path }
    }

logging.interceptor.ts
  - Logea: method, path, statusCode, duration (ms)
  - Formato: [POST /api/auth/login] 200 - 45ms
  - En produccion: escribe a archivo via Winston

cache.interceptor.ts
  - Para rutas GET publicas con alta frecuencia
  - Key: HTTP method + URL + query params
  - TTL: configurable por ruta via @CacheTTL(seconds)
  - Invalidacion: por tag (ej: invalidar todos los caches de "posts")
```

### Pipes

```
parse-objectid.pipe.ts
  - Valida que un string es un ObjectId valido de MongoDB
  - 400 Bad Request si no es valido
  - Usado en params: @Param('id', ParseObjectIdPipe)

slug-transform.pipe.ts
  - Transforma string a slug (lowercase, sin acentos, guiones)
  - Usado en: generacion automatica de slugs
```

### Filters

```
http-exception.filter.ts
  - Captura todas las excepciones HTTP
  - Formatea respuesta de error consistente
  - En desarrollo: incluye stack trace
  - En produccion: solo message generico
  - Logea errores 500 a archivo

mongo-exception.filter.ts
  - Captura errores de MongoDB (duplicate key, validation)
  - Traduce a errores HTTP amigables:
    - 11000 (duplicate key) → 409 Conflict "El email ya esta registrado"
    - ValidationError → 400 Bad Request con detalles
```

### Middleware

```
logger.middleware.ts
  - Logea cada request entrante: method, url, IP, user-agent
  - Registra page view en analytics (para rutas GET publicas)

cors.middleware.ts
  - Configurado en main.ts pero middleware adicional para
    headers personalizados si se necesitan
```

### Decorators

```
@CurrentUser()
  - Extrae request.user del JWT
  - Uso: @CurrentUser() user: JwtPayload

@Roles('admin', 'editor')
  - Define roles requeridos en metadatos del handler
  - Leido por RolesGuard

@Public()
  - Marca ruta como publica (bypasea JwtAuthGuard)
  - Usa SetMetadata('isPublic', true)

@ApiPaginated(PostResponseDto)
  - Decorator compuesto para Swagger
  - Documenta query params de paginacion + response tipo
```

### Utilidades

```
slug.util.ts
  - generateSlug(title: string): string
    Normaliza, remueve acentos, reemplaza espacios por guiones
    Remueve caracteres especiales, lowercase
  - ensureUniqueSlug(slug: string, model: Model): string
    Si slug existe: agrega -1, -2, etc.

reading-time.util.ts
  - calculateReadingTime(content: string): number
    Cuenta palabras, divide por 200 (wpm promedio)
    Retorna minutos redondeados

sanitize.util.ts
  - sanitizeHtml(html: string): string
    Usa DOMPurify o sanitize-html
    Permite: p, h2-h6, a, img, code, pre, ul, ol, li, strong, em, blockquote, table
    Remueve: script, style, iframe, form, input, onclick, onerror
```

---

## Indices de MongoDB

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ githubId: 1 }, { sparse: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });

// Posts
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ status: 1, publishedAt: -1 });
db.posts.createIndex({ category: 1, status: 1 });
db.posts.createIndex({ tags: 1, status: 1 });
db.posts.createIndex({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

// Categories
db.categories.createIndex({ slug: 1 }, { unique: true });

// Courses
db.courses.createIndex({ slug: 1 }, { unique: true });
db.courses.createIndex({ status: 1, publishedAt: -1 });
db.courses.createIndex({ level: 1, status: 1 });
db.courses.createIndex({ 'price.type': 1, status: 1 });
db.courses.createIndex({ title: 'text', excerpt: 'text', tags: 'text' });

// Enrollments
db.enrollments.createIndex({ user: 1, course: 1 }, { unique: true });
db.enrollments.createIndex({ user: 1 });
db.enrollments.createIndex({ course: 1 });
db.enrollments.createIndex({ 'certificate.certificateId': 1 }, { sparse: true });

// Projects
db.projects.createIndex({ slug: 1 }, { unique: true });
db.projects.createIndex({ status: 1, date: -1 });
db.projects.createIndex({ featured: 1, order: 1 });
db.projects.createIndex({ technologies: 1, status: 1 });

// Comments
db.comments.createIndex({ targetType: 1, targetId: 1, isApproved: 1 });
db.comments.createIndex({ parentComment: 1 });
db.comments.createIndex({ author: 1 });
db.comments.createIndex({ isApproved: 1, createdAt: -1 });

// Media
db.media.createIndex({ type: 1, createdAt: -1 });
db.media.createIndex({ uploadedBy: 1 });

// Newsletter
db.newsletters.createIndex({ email: 1 }, { unique: true });
db.newsletters.createIndex({ isActive: 1 });

// PageViews
db.pageviews.createIndex({ path: 1, timestamp: -1 });
db.pageviews.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// SiteConfig
db.siteconfigs.createIndex({ key: 1 }, { unique: true });
```

---

## Configuracion de Deploy

### ecosystem.config.js (PM2)

```javascript
module.exports = {
  apps: [{
    name: 'portfolio-api',
    script: 'dist/main.js',
    instances: 2,              // 2 instancias (cluster mode)
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    max_memory_restart: '500M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
  }]
};
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name api.angelonesto.com;

    client_max_body_size 500M;  # Para uploads de video

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    # Cache para archivos estaticos servidos por el API
    location /api/upload/static/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Rate limiting para auth
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://127.0.0.1:3001;
    }

    location /api/auth/register {
        limit_req zone=register burst=3 nodelay;
        proxy_pass http://127.0.0.1:3001;
    }
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=register:10m rate=3r/m;
```

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/modules/mail/templates ./dist/modules/mail/templates

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### docker-compose.yml (Desarrollo Local)

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    env_file: .env
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: onesto01
      MONGO_INITDB_DATABASE: portfolio
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

---

## Dependencias (package.json)

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/mongoose": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/throttler": "^6.0.0",
    "@nestjs/cache-manager": "^3.0.0",
    "@nestjs/schedule": "^5.0.0",
    "@nestjs/swagger": "^8.0.0",
    "@nestjs/serve-static": "^5.0.0",

    "mongoose": "^8.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "passport-github2": "^0.1.0",
    "passport-google-oauth20": "^2.0.0",

    "bcryptjs": "^2.4.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "cookie-parser": "^1.4.0",
    "helmet": "^8.0.0",
    "compression": "^1.7.0",

    "cache-manager": "^6.0.0",
    "cache-manager-redis-store": "^4.0.0",

    "@nestjs-modules/mailer": "^2.0.0",
    "nodemailer": "^6.9.0",
    "handlebars": "^4.7.0",

    "sharp": "^0.33.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "multer": "^1.4.0",

    "slugify": "^1.6.0",
    "sanitize-html": "^2.11.0",
    "uuid": "^10.0.0",
    "pdfkit": "^0.15.0",
    "qrcode": "^1.5.0",

    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/node": "^22.0.0",
    "@types/express": "^5.0.0",
    "@types/multer": "^1.4.0",
    "@types/passport-jwt": "^4.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/cookie-parser": "^1.4.0",
    "@types/sanitize-html": "^2.11.0",
    "typescript": "^5.6.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.2.0",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.0"
  }
}
```

---

## Seeds (Datos Iniciales)

### seed.command.ts

```
Ejecutar: npm run seed
Logica:
  1. Crear usuario admin:
     email: soyangeldavid1@gmail.com
     password: (definida en .env ADMIN_PASSWORD)
     role: admin
     name: Angel David Onesto Frias

  2. Crear categorias iniciales:
     - Frontend (#3b82f6, azul)
     - Backend (#22c55e, verde)
     - DevOps (#f59e0b, amarillo)
     - IoT (#ef4444, rojo)
     - Mobile (#8b5cf6, morado)
     - General (#6b7280, gris)

  3. Migrar proyectos desde projects.js:
     - Leer projects.js actual
     - Transformar cada proyecto al nuevo schema
     - Generar slugs
     - Insertar en MongoDB
     - Copiar imagenes/videos a storage

  4. Crear site config inicial:
     - hero: datos del HeroSection actual
     - about: datos del AboutSection actual
     - contact: datos del ContactSection actual
     - seo: valores por defecto
     - appearance: { primaryColor: "#00b4d8" }
```

---

## Resumen de Modulos

| # | Modulo | Archivos | Endpoints | Responsabilidad |
|---|--------|----------|-----------|-----------------|
| 1 | Auth | 10 | 10 | Login, registro, JWT, OAuth, password reset |
| 2 | Users | 5 | 5 | CRUD usuarios, roles, estadisticas |
| 3 | Posts | 5 | 9 | CRUD blog, busqueda, likes, vistas |
| 4 | Categories | 5 | 4 | CRUD categorias con cache |
| 5 | Courses | 6 | 7 | CRUD cursos, modulos, lecciones |
| 6 | Enrollments | 5 | 5 | Inscripciones, progreso, resenas |
| 7 | Projects | 5 | 7 | CRUD portafolio, orden, destacados |
| 8 | Comments | 5 | 7 | CRUD comentarios, moderacion, anidamiento |
| 9 | Upload | 4 | 5 | Archivos, optimizacion imagenes, R2 |
| 10 | Newsletter | 4 | 4 | Suscripciones, envio masivo |
| 11 | Site Config | 4 | 2 | Configuracion dinamica del sitio |
| 12 | Analytics | 3 | 4 | Metricas, page views, dashboards |
| 13 | Mail | 10 | 0 (interno) | Templates y envio de emails |
| 14 | Certificates | 3 | 2 | Generacion y verificacion de certificados |
| **Total** | | **~80** | **~71** | |
