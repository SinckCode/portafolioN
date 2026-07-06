# Plan Maestro — Portfolio AO (angelonesto.com)

## Acceso SSH Directo a las VMs

```bash
# VM de aplicacion (frontend + backend + APIs)
ssh onesto@10.10.20.100

# VM de MongoDB (base de datos compartida entre proyectos)
ssh onesto@10.10.30.101
```

### Mapa de Infraestructura Proxmox

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Proxmox Hypervisor                               │
│                                                                         │
│  Red vmbr1 (10.10.20.0/24) — Apps                                      │
│  ┌─────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐ │
│  │ VM 100 (app-server)  │ │ VM 103           │ │ VM 104              │ │
│  │ 10.10.20.100         │ │ 10.10.20.103     │ │ 10.10.20.104        │ │
│  │ Portfolio + APIs     │ │ WhatsUpEarth     │ │ AstroCloud          │ │
│  │ 2 CPU / 2GB RAM      │ │ ERP, Clima       │ │                     │ │
│  │ Ubuntu 24.04         │ │ Sensores         │ │                     │ │
│  └─────────────────────┘ └──────────────────┘ └──────────────────────┘ │
│                                                                         │
│  Red vmbr2 (10.10.30.0/24) — Datos                                     │
│  ┌─────────────────────┐                                                │
│  │ VM 101 (mongo-server)│                                               │
│  │ 10.10.30.101         │                                               │
│  │ MongoDB 8.0          │                                               │
│  │ 3 CPU / 4GB RAM      │                                               │
│  │ Auth enabled          │                                               │
│  │ 17 databases          │                                               │
│  └─────────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### VM 101 — MongoDB Server (mongo-server)

| Recurso | Valor |
|---------|-------|
| **OS** | Ubuntu 24.04.4 LTS |
| **CPU** | 3 cores |
| **RAM** | 4 GB (634 MB usado, 3.2 GB disponible) |
| **Disco** | 30 GB (8.2 GB usado) |
| **MongoDB** | 8.0.12, auth enabled, escucha en 10.10.30.101:27017 + 127.0.0.1:27017 |
| **Docker** | 29.1.3 instalado |
| **Credenciales** | admin / onesto01 (authSource: admin) |

**Databases existentes:**

| Database | Tamano | Proyecto |
|----------|--------|----------|
| `esp32_sensors_db` | 24.4 MB | Sensores IoT |
| `erp_universidad` | 0.7 MB | ERP |
| `whatsup_earth` | 0.4 MB | WhatsUpEarth |
| `sample_*` (7 DBs) | ~231 MB | Datasets de prueba de MongoDB Atlas |
| **`portfolio`** | **No existe aun** | **Crear para este proyecto** |

**Conexion desde VM 100 al MongoDB:**
```
mongodb://admin:onesto01@10.10.30.101:27017/portfolio?authSource=admin
```

> **Nota:** MongoDB NO necesita Docker en VM 100 — ya corre nativo en VM 101 y acepta conexiones desde la red 10.10.20.x. Solo se necesita Docker en VM 100 para Redis y el stack de Grafana (Loki, Promtail, Grafana).

---

### VM 100 — App Server (ubuntu-server)

### Specs de la VM (ubuntu-server)

| Recurso | Actual | Recomendado para el proyecto |
|---------|--------|------------------------------|
| **OS** | Ubuntu 24.04.2 LTS | OK |
| **CPU** | 2 cores | **4 cores** (NestJS + Next.js SSR + Grafana stack) |
| **RAM** | 2 GB | **4-8 GB** (MongoDB + Redis + Loki + Grafana consumen ~2-3 GB) |
| **Disco** | 30 GB (8.6 GB usado, 22 GB libre) | OK, pero monitorear si se sube mucho media |
| **Swap** | 2 GB | OK |
| **IP** | 10.10.20.100/24 (eth0) | OK |

### Software instalado

| Software | Version | Estado |
|----------|---------|--------|
| Node.js | 18.19.1 | Actualizar a v20 LTS |
| NPM | 9.2.0 | Se actualiza con Node |
| PM2 | 6.0.8 | OK |
| Nginx | 1.24.0 | OK |
| Apache2 | 2.4.x | Activo en :8080, evaluar si se necesita |
| Git | 2.43.0 | OK |
| Docker | NO instalado | **Instalar** (requerido para MongoDB, Redis, Grafana stack) |
| Docker Compose | NO instalado | **Instalar** |

### Servicios corriendo

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| **Nginx** | :80 | Reverse proxy (redirige a HTTPS via Cloudflare) |
| **Apache2** | :8080 | Sirve el portfolio actual (build React en /var/www/portafolioN) |
| **mi-api (PM2)** | :3000 | API principal del portfolio (Express basico, CommonJS) |
| **deploy-api (PM2)** | :5000 | API de deploy unificada (despliega a multiples VMs/proyectos) |
| **cloudflared** | — | Tunnel `mi-tunel` → angelonesto.com (frontend via Apache :8080) |
| **cloudflared-api** | — | Tunnel → api.angelonesto.com (:3000) + deploy.angelonesto.com (:5000) |

### Deploy API (deploy.angelonesto.com)

La VM tiene una **API de deploy unificada** que gestiona deploys de multiples proyectos via SSH:

| Proyecto | Destino | Descripcion |
|----------|---------|-------------|
| `portafolio` | Local (VM 100) | git pull → npm build → copia a /var/www/portafolioN |
| `mi-api` | Local (VM 100) | git pull → npm install → pm2 restart |
| `astrocloud` | VM 104 | AstroCloud (astrocloud.dev) |
| `erp-frontend` | VM 103 | ERP Frontend (erp.angelonesto.com) |
| `erp-backend` | VM 103 | ERP Backend (apierp.angelonesto.com) |
| `clima` | VM 103 | App Clima (clima.angelonesto.com) |
| `whatsupearth` | VM 103 | WhatsUp Earth (whatsupearth.angelonesto.com) — Docker |
| `sensores` | VM 103 | Sensores API (sensores.angelonesto.com) |

### Estructura en la VM

```
/home/onesto/
├── portafolioN/          ← Repo actual del portfolio (React CRA)
├── mi-api/               ← API actual (Express basico, CommonJS)
│   └── src/
│       ├── app.js
│       ├── routes/
│       └── controllers/
├── deploy-api/           ← API de deploy unificada
│   └── server.js
└── .cloudflared/
    ├── api-tunnel.yml    ← Config: api.angelonesto.com → :3000, deploy.angelonesto.com → :5000
    └── credentials.json

/var/www/
├── portafolioN/          ← Build estatico del portfolio (servido por Apache :8080)
├── html/                 ← Default Nginx
└── letsencrypt/          ← Certbot
```

### Cloudflare Tunnel Config

```yaml
# Tunnel actual (api-tunnel.yml)
ingress:
  - hostname: api.angelonesto.com    → http://localhost:3000  (mi-api)
  - hostname: deploy.angelonesto.com → http://localhost:5000  (deploy-api)
  - service: http_status:404

# Tunnel principal (mi-tunel)
# angelonesto.com → Apache :8080 → /var/www/portafolioN
```

### Deploy API como CI/CD (deploy.angelonesto.com)

La VM 100 ya tiene una **API de deploy unificada** que funciona como CI/CD para todos los proyectos. Cuando se agregue el portfolio NestJS + Next.js, se debe agregar como nuevo proyecto en `deploy-api/server.js`:

```javascript
// Agregar a projects en deploy-api/server.js:
'portfolio-api': {
  description: 'Portfolio NestJS API (api.angelonesto.com)',
  local: true,
  commands: [
    'cd /home/onesto/portfolio-api',
    'git pull origin main',
    'npm install',
    'npm run build',
    'pm2 restart portfolio-api'
  ]
},
'portfolio-frontend': {
  description: 'Portfolio Next.js (angelonesto.com)',
  local: true,
  commands: [
    'cd /home/onesto/portfolio-frontend',
    'git pull origin main',
    'npm install',
    'npm run build',
    'pm2 restart portfolio-frontend'
  ]
}
```

Esto permite deployar con un simple POST:
```bash
curl -X POST https://deploy.angelonesto.com/deploy/portfolio-api \
  -H "Authorization: Bearer $DEPLOY_TOKEN"
```

Y se puede integrar con GitHub Actions para CI/CD automatizado (trigger en push a main → llama a la deploy API).

### Docker Local vs Produccion

| Entorno | Docker para... | MongoDB |
|---------|---------------|---------|
| **Desarrollo local** (Windows) | MongoDB + Redis + todo el stack completo | Docker local |
| **Produccion** (VM 100) | Redis + Loki + Promtail + Grafana (observabilidad) | **VM 101 nativa** (10.10.30.101:27017) |

> En produccion, NestJS y Next.js corren con PM2 (no Docker), igual que los demas proyectos. Docker en VM 100 es solo para servicios auxiliares (Redis, Grafana stack).

### Acciones necesarias en la VM antes de empezar

1. **Instalar Docker + Docker Compose en VM 100** (solo para Redis y stack Grafana, NO para la app)
2. **Actualizar Node.js** a v20 LTS
3. **Aumentar recursos VM 100**: minimo 4 CPU / 4 GB RAM (idealmente 8 GB si corre Grafana stack)
4. **Crear DB `portfolio`** en MongoDB VM 101: `mongosh -u admin -p onesto01 --authenticationDatabase admin --eval 'use portfolio'`
5. **Reemplazar mi-api** por el nuevo NestJS backend (puede reutilizar :3000 o usar :3001)
6. **Actualizar Cloudflare Tunnel** si se cambia el puerto de la API
7. **Agregar proyectos** portfolio-api y portfolio-frontend a la deploy API
8. **Evaluar Apache**: actualmente sirve el frontend en :8080 — reemplazar por Next.js standalone con PM2 en un puerto dedicado, y apuntar Cloudflare Tunnel ahi

---

## Estado Actual

### Lo que ya existe (Frontend React SPA)
- 13 componentes JSX: Hero, About, Projects (17 proyectos), Contact, Canvas3D, FilterPanel, ProjectModal, Blog/Services preview, Header, FloatingMenu, DotNavigation
- Three.js con modelo portafolio.glb rotando en background
- Animaciones con Framer Motion + GSAP + react-awesome-reveal
- Formulario de contacto con EmailJS
- CSS puro (no Tailwind), responsive
- Deploy en angelonesto.com via Cloudflare Tunnel

### Lo que falta construir
- Backend completo (NestJS)
- Migracion frontend a Next.js 15
- 20+ vistas nuevas (blog, cursos, admin, auth, etc.)
- Correccion del design system (colores de Stitch no coinciden)
- Seguridad completa (basado en proyecto WhatsUpEarth)
- CI/CD pipeline
- Observabilidad (Grafana + Loki + Promtail)
- Deploy en VM con Docker + Terraform + Ansible

### Recursos reutilizables del proyecto WhatsUpEarth
- CI/CD: GitHub Actions (build Docker → push DockerHub → deploy SSH)
- Docker Compose: multi-service (frontend + backend + DB + observabilidad)
- Terraform: provisionar VM en Proxmox
- Ansible: roles docker, cloudflared, app
- Observabilidad: Pino → Promtail → Loki → Grafana
- Seguridad: rate limiting, helmet, JWT auth, errorHandler, OWASP ZAP scans
- Logging: Pino estructurado JSON con redaccion de datos sensibles

---

## Correccion de Colores — Design System Unificado

Los mockups de Stitch usan un sistema Material Design 3 con colores que NO coinciden con el design system original. Debemos unificar.

### Problema
| Token Stitch | Valor Stitch | Token Original | Valor Original | Accion |
|---|---|---|---|---|
| `background` | `#0e1416` | `--bg-base` | `#000000` | **Usar #000000** (negro puro, mas contraste) |
| `surface` | `#0e1416` | `--bg-surface` | `#0f1115` | **Usar #0f1115** |
| `surface-container` | `#1b2023` | `--bg-surface-2` | `#1a1c22` | **Usar #1a1c22** |
| `primary` | `#4cd6fb` | `--primary` | `#00b4d8` | **Usar #00b4d8** (mas saturado, mejor identidad) |
| `primary-container` | `#00b4d8` | — | — | Este SI es correcto, mantener para containers |
| `on-surface` | `#dee3e6` | `--text-primary` | `#ffffff` | **Usar #ffffff** para titulos, `#dee3e6` para body |
| `on-surface-variant` | `#bcc9ce` | `--text-secondary` | `#aaaaaa` | **Usar #aaaaaa** (mas neutro, menos azulado) |
| `outline-variant` | `#3d494d` | `--border` | `#2a2d35` | **Usar #2a2d35** (mas oscuro, menos visible) |
| `tertiary` | `#ffb77d` | — | — | Eliminar, no hay terciario en el design system |
| Hardcoded `#0f1115` | en cards | — | — | Reemplazar por token `--bg-surface` |
| Hardcoded `#1a1c22` | en inputs | — | — | Reemplazar por token `--bg-surface-2` |

### Paleta Definitiva (fusionada)

```css
:root {
  /* Primarios */
  --primary: #00b4d8;
  --primary-hover: #0096b7;
  --primary-glow: rgba(0, 180, 216, 0.3);
  --primary-dim: #4cd6fb;          /* texto primary sobre fondos oscuros, uso sutil */
  --primary-container: #00b4d8;    /* fondo de botones/badges primarios */
  --on-primary: #000000;           /* texto sobre primary-container */

  /* Fondos */
  --bg-base: #000000;              /* body */
  --bg-surface: #0f1115;           /* cards, modales */
  --bg-surface-2: #1a1c22;         /* inputs, sidebar, filtros */
  --bg-surface-3: #242830;         /* hover items, bordes hover */

  /* Texto */
  --text-primary: #ffffff;         /* titulos, nombres */
  --text-body: #dee3e6;            /* texto de cuerpo */
  --text-secondary: #aaaaaa;       /* descripciones, meta */
  --text-muted: #666666;           /* placeholders, disabled */

  /* Bordes */
  --border: #2a2d35;               /* bordes de cards, inputs, separadores */
  --border-hover: #3d494d;         /* bordes en hover */

  /* Estados */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* Glassmorphism */
  --glass-bg: rgba(15, 17, 21, 0.5);
  --glass-border: rgba(255, 255, 255, 0.08);
}
```

### Eliminar del design system
- Todos los tokens Material Design 3 de Stitch (`inverse-surface`, `on-secondary-fixed-variant`, `tertiary-container`, etc.) — no aportan y agregan complejidad innecesaria
- Los border-radius de Stitch (`0.125rem`, `0.25rem`) son demasiado pequenos — usar los originales (`8px`, `12px`, `20px`)

---

## Fases de Implementacion

---

### FASE 0: Preparacion del Proyecto (Semana 1)

**Objetivo:** Migrar de React CRA a Next.js 15 y establecer la base

| # | Tarea | Detalle |
|---|-------|---------|
| 0.1 | Inicializar Next.js 15 | `create-next-app` con App Router, TypeScript |
| 0.2 | Migrar componentes existentes | Convertir 13 componentes JSX a TSX, adaptar a App Router |
| 0.3 | Configurar Tailwind CSS | Reemplazar CSS puro por Tailwind con tokens custom del design system |
| 0.4 | Migrar Three.js | Integrar `@react-three/fiber` con Next.js (dynamic import, no SSR) |
| 0.5 | Configurar ESLint + Prettier | Reglas estrictas TypeScript |
| 0.6 | Implementar layout global | Nav + Footer como layout compartido |
| 0.7 | Configurar rutas | `/`, `/blog`, `/blog/[slug]`, `/cursos`, `/cursos/[slug]`, `/portafolio`, `/contacto`, `/login`, `/registro` |
| 0.8 | Aplicar design system corregido | Implementar paleta definitiva en `tailwind.config.ts` |

**Entregable:** Next.js 15 con la landing page funcionando identica a la actual + rutas base

---

### FASE 1: Backend NestJS — Foundation (Semanas 2-3)

**Objetivo:** API funcional con auth, proyectos, y estructura base

#### 1.1 Setup del proyecto
```
portfolio-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   ├── common/ (guards, interceptors, filters, middleware, pipes, decorators)
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── projects/
│       ├── categories/
│       └── upload/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── ecosystem.config.js (PM2)
└── nginx.conf
```

#### 1.2 Modulos de esta fase

| Modulo | Endpoints | Descripcion |
|--------|-----------|-------------|
| **Auth** | POST `/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`, GET/PATCH `/me` | JWT access+refresh, bcrypt, OAuth GitHub/Google |
| **Users** | CRUD + RBAC | Roles: admin, editor, subscriber |
| **Projects** | GET lista/detalle (publico), CRUD (admin) | Migracion de los 17 proyectos de `projects.js` |
| **Categories** | CRUD | Frontend, Backend, DevOps, IoT, Mobile |
| **Upload** | POST imagen/video/archivo, DELETE | Sharp para optimizar, Cloudflare R2 |

#### 1.3 Seguridad base (adaptada de WhatsUpEarth)
- **Helmet**: headers de seguridad (X-Powered-By, HSTS, X-Content-Type-Options, X-Frame-Options)
- **CORS**: whitelist de origenes (angelonesto.com, localhost:3000)
- **Rate Limiting**: auth 10 req/15min, API general 100 req/min (express-rate-limit o @nestjs/throttler)
- **ValidationPipe**: whitelist + forbidNonWhitelisted + transform
- **JWT**: access token 15min + refresh token 7d, rotacion de refresh tokens
- **Bcrypt**: hash de passwords (rounds: 12)
- **Error Handler**: normaliza errores, oculta stack traces en produccion
- **Input sanitization**: class-validator + class-transformer

**Entregable:** API en NestJS con auth completo, CRUD de proyectos, y seguridad base

---

### FASE 2: Blog System (Semana 4)

#### 2.1 Backend
| Modulo | Endpoints |
|--------|-----------|
| **Posts** | GET lista (paginado, filtros, busqueda), GET `:slug`, POST/PATCH/DELETE (admin/editor), POST `:id/like` |
| **Comments** | GET por target, POST (autenticado), PATCH/DELETE (propietario/admin), PATCH `:id/approve` |

#### 2.2 Frontend — Vistas

| Vista | Ruta | Estado |
|-------|------|--------|
| Blog Lista | `/blog` | Mockup Stitch existe, corregir colores |
| Blog Post | `/blog/[slug]` | **FALTA** — disenar: hero con imagen, contenido markdown, sidebar con TOC, comentarios, posts relacionados |
| Blog Categoria | `/blog/categoria/[slug]` | Reutiliza vista lista con filtro |

#### 2.3 Funcionalidad
- Markdown rendering (MDX o react-markdown)
- Syntax highlighting (Prism o Shiki)
- SEO: meta tags, JSON-LD Article, og:image
- Conteo de vistas y tiempo de lectura
- Paginacion con cursor

**Entregable:** Blog publico funcional con comentarios

---

### FASE 3: Courses System (Semanas 5-6)

#### 3.1 Backend
| Modulo | Endpoints |
|--------|-----------|
| **Courses** | GET lista/detalle, CRUD (admin), POST `:id/enroll`, PATCH progress, POST review |
| **Enrollments** | Inscripciones, progreso por leccion, certificados |
| **Certificates** | Generacion PDF, verificacion publica |

#### 3.2 Frontend — Vistas

| Vista | Ruta | Estado |
|-------|------|--------|
| Cursos Catalogo | `/cursos` | Mockup Stitch existe, corregir colores |
| Curso Detalle | `/cursos/[slug]` | **FALTA** — disenar: hero, syllabus, reviews, CTA inscripcion |
| Leccion Player | `/cursos/[slug]/[lessonSlug]` | **FALTA** — disenar: video player, sidebar de modulos, progreso, recursos |
| Mis Cursos | `/perfil/cursos` | **FALTA** — disenar: grid de cursos inscritos con barra de progreso |
| Certificado Publico | `/certificado/[id]` | **FALTA** — disenar: verificacion publica |

#### 3.3 Funcionalidad
- Video player con guardado de posicion
- Progreso por leccion y modulo
- Generacion de certificados PDF al completar
- Sistema de reviews/ratings (1-5 estrellas)
- Lecciones free como preview

**Entregable:** Sistema de cursos con inscripcion, progreso y certificados

---

### FASE 4: Panel Admin (Semana 7)

#### 4.1 Frontend — Vistas

| Vista | Ruta | Estado |
|-------|------|--------|
| Dashboard | `/admin` | Mockup Stitch parcial (solo estructura NestJS), **FALTA** dashboard con stats |
| Proyectos CRUD | `/admin/proyectos` | **FALTA** — tabla con acciones, form crear/editar |
| Posts CRUD | `/admin/posts` | **FALTA** — tabla, editor markdown WYSIWYG |
| Cursos CRUD | `/admin/cursos` | **FALTA** — tabla, form con modulos/lecciones drag-and-drop |
| Usuarios | `/admin/usuarios` | **FALTA** — tabla con roles, busqueda |
| Categorias | `/admin/categorias` | **FALTA** — CRUD simple |
| Comentarios | `/admin/comentarios` | **FALTA** — moderacion, aprobar/rechazar |
| Newsletter | `/admin/newsletter` | **FALTA** — lista suscriptores, enviar campana |
| Config Sitio | `/admin/configuracion` | **FALTA** — editar hero, about, contact, SEO |
| Media | `/admin/media` | **FALTA** — galeria de archivos subidos |

#### 4.2 Componentes Admin
- Sidebar navigation (basado en mockup Stitch del admin NestJS)
- Data tables con sort, filter, paginacion
- Forms con validacion
- Rich text editor (Tiptap o similar) para posts/cursos
- Drag-and-drop para reordenar modulos/lecciones
- Graficas (Recharts o Chart.js) para dashboard

**Entregable:** Panel admin completo con CRUD de todo el contenido

---

### FASE 5: Vistas de Autenticacion y Perfil (Semana 7, paralelo con Admin)

#### 5.1 Frontend — Vistas

| Vista | Ruta | Estado |
|-------|------|--------|
| Login | `/login` | Mockup Stitch existe, corregir colores |
| Registro | `/registro` | Mockup Stitch existe, corregir colores |
| Forgot Password | `/forgot-password` | **FALTA** |
| Reset Password | `/reset-password/[token]` | **FALTA** |
| Verificar Email | `/verify-email/[token]` | **FALTA** |
| Perfil Usuario | `/perfil` | **FALTA** — avatar, bio, links sociales, cursos inscritos |
| Editar Perfil | `/perfil/editar` | **FALTA** |

#### 5.2 Correcciones a mockups existentes (Login/Registro)
- Background: `#000000` en vez de `#0e1416`
- Primary en botones: `#00b4d8` en vez de `#4cd6fb`
- Inputs: fondo `#1a1c22`, borde `#2a2d35`
- Textos "System Authentication Gateway" y "EXECUTE_REGISTRATION": cambiar a espanol y tono menos cyberpunk — "Iniciar sesion" y "Crear cuenta"
- Quitar cyber-grid background del login, usar fondo negro liso o con Canvas3D sutil

**Entregable:** Flujo de auth completo (registro → verificacion → login → perfil)

---

### FASE 6: Vistas Faltantes del Sitio Publico (Semana 8)

| Vista | Ruta | Estado | Descripcion |
|-------|------|--------|-------------|
| Portafolio | `/portafolio` | Mockup Stitch existe, corregir colores | Grid filtrable de proyectos |
| Proyecto Detalle | `/portafolio/[slug]` | Mockup Stitch existe (modal), **CONVERTIR a pagina** | Video/galeria, descripcion, tech stack, links |
| Contacto | `/contacto` | Existe en landing, **FALTA como pagina standalone** | Form + info de contacto |
| Portafolio Modal | componente | Existe, mejorar | Mantener como alternativa al click en grid |
| Landing actualizada | `/` | Parcial | Integrar secciones de blog preview, cursos preview, newsletter |
| 404 | `*` | **FALTA** | Pagina de error custom |

**Entregable:** Todas las paginas publicas funcionales y conectadas al backend

---

### FASE 7: Observabilidad — Grafana + Logging (Semana 9)

**Basado en la implementacion exitosa de WhatsUpEarth (Fase 7)**

#### 7.1 Logging estructurado con Pino

```typescript
// src/lib/logger.ts (adaptado de WhatsUpEarth)
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'portfolio-api',
    env: process.env.NODE_ENV || 'development',
  },
  redact: [
    'password', 'passwordHash',
    'req.headers.authorization',
    'token', 'refreshToken',
  ],
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,
});
```

#### 7.2 Middleware HTTP Request Logging
- pino-http para Express/Fastify
- Correlation ID (requestId) en cada request
- Log de cada request: method, path, status, duration, user agent

#### 7.3 Stack de Observabilidad (Docker)
| Servicio | Imagen | Puerto | Funcion |
|----------|--------|--------|---------|
| **Loki** | `grafana/loki:3.0.0` | 3100 | Almacenamiento de logs |
| **Promtail** | `grafana/promtail:3.0.0` | — | Recolector de logs Docker → Loki |
| **Grafana** | `grafana/grafana:11.0.0` | 3001 | Dashboards y alertas |

#### 7.4 Configuraciones a copiar/adaptar de WhatsUpEarth
```
infra/
├── loki/
│   └── loki-config.yml
├── promtail/
│   └── promtail-config.yml
└── grafana/
    ├── provisioning/
    │   ├── datasources/loki.yml
    │   └── dashboards/dashboard.yml
    └── dashboards/
        └── portfolio-api.json    ← Dashboard custom para el portfolio
```

#### 7.5 Dashboard de Grafana
- **Panel 1:** Requests por minuto (time series)
- **Panel 2:** Errores por endpoint (table)
- **Panel 3:** Latencia P50/P95/P99 (gauge)
- **Panel 4:** Auth events: logins, registros, fallos (bar chart)
- **Panel 5:** Logs en vivo (log panel con filtros)
- **Panel 6:** Top 10 endpoints mas lentos

**Entregable:** Logging JSON estructurado + Grafana dashboard funcional

---

### FASE 8: Seguridad Completa — Auditar y Hardening (Semana 10)

**Basado en el reporte OWASP de WhatsUpEarth (PASS en 10/10 categorias)**

#### 8.1 Checklist OWASP Top 10

| # | Categoria | Implementacion Portfolio |
|---|-----------|-------------------------|
| A01 | Broken Access Control | Guards de ownership, roles (admin/editor/subscriber), JWT en todas las rutas protegidas |
| A02 | Cryptographic Failures | bcrypt (rounds 12), JWT firmado, HTTPS via Cloudflare, HSTS header |
| A03 | Injection | NestJS ValidationPipe + class-validator (whitelist), Mongoose schemas tipados, parametized queries |
| A04 | Insecure Design | Validacion con DTOs en todos los endpoints, schemas Zod/class-validator, separacion de capas |
| A05 | Security Misconfiguration | Helmet.js (X-Powered-By off, CSP, X-Frame-Options, X-Content-Type-Options), no stack traces en prod |
| A06 | Vulnerable Components | `npm audit` en CI, Dependabot, Snyk o similares |
| A07 | Auth Failures | Rate limit en login (10/15min), password policy (min 8, mayuscula, numero), refresh token rotation |
| A08 | Data Integrity | package-lock.json con checksums, SRI para scripts externos |
| A09 | Logging Failures | Pino JSON logs, correlation IDs, activity logging para ops criticas |
| A10 | SSRF | No proxy de URLs externas, validacion de URLs de upload |

#### 8.2 Headers de seguridad (Nginx + Helmet)
```nginx
# nginx.conf
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; img-src 'self' data: blob: media.angelonesto.com; connect-src 'self' api.angelonesto.com;" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

#### 8.3 Security Testing automatizado
- OWASP ZAP baseline scan (pasivo) en CI
- OWASP ZAP active scan (manual, pre-release)
- `npm audit` en pipeline
- Rate limiting verification
- JWT expiration/rotation tests

#### 8.4 Archivos a crear
```
security-tests/
├── zap-baseline.yaml           ← Config ZAP pasivo
├── zap-active.yaml             ← Config ZAP activo
├── run-security-tests.sh       ← Script runner
└── reports/                    ← Reportes generados
    ├── api-baseline-report.html
    └── frontend-baseline-report.html
```

**Entregable:** Reporte OWASP ZAP limpio + headers de seguridad + tests automatizados

---

### FASE 9: CI/CD Pipeline (Semana 10, paralelo con seguridad)

**Basado en el pipeline de WhatsUpEarth**

#### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  DOCKERHUB_USER: onesto
  BACKEND_IMAGE: onesto/portfolio-api
  FRONTEND_IMAGE: onesto/portfolio-frontend

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm audit --audit-level=high

  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build & Push Backend
        uses: docker/build-push-action@v6
        with:
          context: ./portfolio-api
          push: true
          tags: |
            ${{ env.BACKEND_IMAGE }}:latest
            ${{ env.BACKEND_IMAGE }}:${{ github.sha }}
      - name: Build & Push Frontend
        uses: docker/build-push-action@v6
        with:
          context: ./portfolio-frontend
          push: true
          tags: |
            ${{ env.FRONTEND_IMAGE }}:latest
            ${{ env.FRONTEND_IMAGE }}:${{ github.sha }}

  security-scan:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: OWASP ZAP Baseline
        uses: zaproxy/action-baseline@v0.13.0
        with:
          target: ${{ secrets.API_URL }}

  deploy:
    needs: [build-and-push, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.6.1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/onesto/portfolio
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f
```

#### 9.2 Docker Compose de Produccion

```yaml
# docker-compose.yml (produccion)
services:
  mongodb:
    image: mongo:7
    restart: unless-stopped
    volumes: [mongo_data:/data/db]
    healthcheck: ...

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes: [redis_data:/data]
    healthcheck: ...

  backend:
    image: onesto/portfolio-api:latest
    restart: unless-stopped
    environment: [NODE_ENV, MONGODB_URI, REDIS_HOST, JWT secrets, etc.]
    depends_on: [mongodb, redis]
    logging: { driver: json-file, options: { max-size: "10m", max-file: "3" } }
    labels: { logging: "promtail" }

  frontend:
    image: onesto/portfolio-frontend:latest
    restart: unless-stopped
    depends_on: [backend]

  loki: ...
  promtail: ...
  grafana: ...

volumes:
  mongo_data:
  redis_data:
  loki_data:
  grafana_data:
```

#### 9.3 Infraestructura como Codigo

```
infra/
├── terraform/
│   ├── main.tf              ← VM en Proxmox (adaptar de WhatsUpEarth)
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
├── ansible/
│   ├── playbook.yml
│   ├── inventory/hosts.yml
│   ├── group_vars/all.yml
│   └── roles/
│       ├── docker/tasks/main.yml
│       ├── cloudflared/tasks/main.yml
│       └── app/tasks/main.yml
├── loki/loki-config.yml
├── promtail/promtail-config.yml
└── grafana/
    ├── provisioning/
    │   ├── datasources/loki.yml
    │   └── dashboards/dashboard.yml
    └── dashboards/portfolio-api.json
```

**Entregable:** Pipeline CI/CD automatizado + IaC para reproducir el entorno

---

### FASE 10: Pulido Final y SEO (Semana 11)

| Tarea | Detalle |
|-------|---------|
| SEO | next-sitemap, JSON-LD (Person, Article, Course, BreadcrumbList), meta tags, og:image |
| Performance | Lighthouse audit, image optimization (next/image), lazy loading, code splitting |
| Accesibilidad | ARIA labels, keyboard navigation, color contrast, focus indicators |
| PWA | manifest.json, service worker, offline page |
| Analytics | Page views tracking en MongoDB, dashboard admin |
| Email templates | Handlebars: welcome, reset-password, verify-email, new-post, course-completed |
| Pagina 404 | Custom 404 con animacion |
| Pagina de mantenimiento | Para deploys |
| README.md | Documentacion del proyecto |

**Entregable:** Sitio listo para produccion con SEO, performance y accesibilidad optimizados

---

## Inventario de Vistas — Completo

### Sitio Publico (13 vistas)

| # | Vista | Ruta | Mockup Stitch | Correccion |
|---|-------|------|:---:|---|
| 1 | Landing (Hero + About + Portfolio preview + Blog preview + Cursos preview + Newsletter + Contacto) | `/` | Parcial | Unificar colores, agregar secciones faltantes |
| 2 | Blog Lista | `/blog` | Si | Corregir paleta de colores |
| 3 | Blog Post | `/blog/[slug]` | No | Disenar desde cero |
| 4 | Cursos Catalogo | `/cursos` | Si | Corregir paleta de colores |
| 5 | Curso Detalle | `/cursos/[slug]` | No | Disenar desde cero |
| 6 | Leccion Player | `/cursos/[slug]/[lesson]` | No | Disenar desde cero |
| 7 | Portafolio | `/portafolio` | Si | Corregir paleta de colores |
| 8 | Proyecto Detalle | `/portafolio/[slug]` | Si (modal) | Convertir a pagina completa |
| 9 | Contacto | `/contacto` | No (esta en landing) | Extraer como pagina standalone |
| 10 | Login | `/login` | Si | Corregir colores + traducir textos |
| 11 | Registro | `/registro` | Si | Corregir colores + traducir textos |
| 12 | Forgot/Reset Password | `/forgot-password` | No | Disenar desde cero |
| 13 | 404 | `*` | No | Disenar desde cero |

### Area de Usuario (4 vistas)

| # | Vista | Ruta | Mockup |
|---|-------|------|:---:|
| 14 | Perfil | `/perfil` | No |
| 15 | Editar Perfil | `/perfil/editar` | No |
| 16 | Mis Cursos | `/perfil/cursos` | No |
| 17 | Certificado Publico | `/certificado/[id]` | No |

### Panel Admin (10 vistas)

| # | Vista | Ruta | Mockup |
|---|-------|------|:---:|
| 18 | Dashboard | `/admin` | Parcial |
| 19 | Proyectos CRUD | `/admin/proyectos` | No |
| 20 | Posts CRUD | `/admin/posts` | No |
| 21 | Cursos CRUD | `/admin/cursos` | No |
| 22 | Usuarios | `/admin/usuarios` | No |
| 23 | Categorias | `/admin/categorias` | No |
| 24 | Comentarios | `/admin/comentarios` | No |
| 25 | Newsletter | `/admin/newsletter` | No |
| 26 | Config Sitio | `/admin/configuracion` | No |
| 27 | Media Manager | `/admin/media` | No |

**Total: 27 vistas** (6 con mockup Stitch que necesitan correccion, 21 por disenar)

---

## Estructura Final del Repositorio

```
mi-portfolio-3d/
├── portfolio-frontend/          ← Next.js 15 (React 19)
│   ├── src/
│   │   ├── app/                 ← App Router
│   │   ├── components/          ← Componentes reutilizables
│   │   ├── lib/                 ← Utils, hooks, API client
│   │   └── styles/              ← Tailwind + globals
│   ├── public/
│   │   └── portafolio.glb
│   ├── Dockerfile
│   ├── next.config.ts
│   └── tailwind.config.ts
│
├── portfolio-api/               ← NestJS
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   ├── common/
│   │   ├── modules/ (14 modulos)
│   │   └── seeds/
│   ├── test/
│   ├── Dockerfile
│   └── ecosystem.config.js
│
├── infra/                       ← IaC
│   ├── terraform/
│   ├── ansible/
│   ├── loki/
│   ├── promtail/
│   └── grafana/
│
├── security-tests/              ← OWASP ZAP
│
├── .github/workflows/ci-cd.yml
├── docker-compose.yml
├── docker-compose.dev.yml
│
├── PLAN_MAESTRO.md              ← Este archivo
├── DESIGN.md
├── VIEWS.md
├── BACKEND_VIEWS.md
└── FUNCTIONALITY_PLAN.md
```

---

## Infraestructura de Deploy (Arquitectura Real)

```
                         Internet
                            │
                   Cloudflare Tunnel (SSL + DDoS)
                            │
          ┌─────────────────┼─────────────────────┐
          │                 │                      │
   angelonesto.com  api.angelonesto.com  deploy.angelonesto.com
          │                 │                      │
 ┌────────┴─────────────────┴──────────────────────┴──────────────────┐
 │                    Proxmox Hypervisor                               │
 │                                                                     │
 │  ┌───────────────────────────────────────────────────────────────┐  │
 │  │  VM 100 — ubuntu-server (10.10.20.100)                        │  │
 │  │                                                               │  │
 │  │  ┌── PM2 (apps Node.js) ──────────────────────────────────┐  │  │
 │  │  │                                                        │  │  │
 │  │  │  portfolio-frontend (Next.js)  :3002  ← angelonesto.com│  │  │
 │  │  │  portfolio-api (NestJS)        :3001  ← api.angelonesto│  │  │
 │  │  │  deploy-api (Express)          :5000  ← deploy.angel.. │  │  │
 │  │  │                                                        │  │  │
 │  │  └────────────────────────────────────────────────────────┘  │  │
 │  │                                                               │  │
 │  │  ┌── Docker Compose (servicios auxiliares) ───────────────┐  │  │
 │  │  │                                                        │  │  │
 │  │  │  ┌───────┐  ┌──────┐  ┌──────────┐  ┌──────────────┐ │  │  │
 │  │  │  │ Redis │  │ Loki │  │ Promtail │  │   Grafana    │ │  │  │
 │  │  │  │ :6379 │  │:3100 │  │          │  │    :3003     │ │  │  │
 │  │  │  └───────┘  └──────┘  └──────────┘  └──────────────┘ │  │  │
 │  │  └────────────────────────────────────────────────────────┘  │  │
 │  │                                                               │  │
 │  │  Nginx (:80) + cloudflared (2 tunnels)                       │  │
 │  └───────────────────────────────────────────────────────────────┘  │
 │                          │                                          │
 │                          │ mongodb://10.10.30.101:27017             │
 │                          │                                          │
 │  ┌───────────────────────▼───────────────────────────────────────┐  │
 │  │  VM 101 — mongo-server (10.10.30.101)                         │  │
 │  │  MongoDB 8.0.12 (nativo, auth enabled)                        │  │
 │  │  3 CPU / 4 GB RAM                                             │  │
 │  │  DB: portfolio, whatsup_earth, erp_universidad, sensors...    │  │
 │  └───────────────────────────────────────────────────────────────┘  │
 │                                                                     │
 │  ┌── Otras VMs (gestionadas por deploy-api) ─────────────────────┐ │
 │  │  VM 103 (10.10.20.103): WhatsUpEarth, ERP, Clima, Sensores   │ │
 │  │  VM 104 (10.10.20.104): AstroCloud                            │ │
 │  └───────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────┘
```

### Flujo de CI/CD (con la Deploy API existente)

```
Developer pushes to main
         │
   GitHub Actions
         │
    ┌─────┴──────┐
    │ npm test   │
    │ npm lint   │
    │ npm audit  │
    └─────┬──────┘
          │ (si pasa)
          ▼
  POST deploy.angelonesto.com/deploy/portfolio-api
  POST deploy.angelonesto.com/deploy/portfolio-frontend
          │
    Deploy API (VM 100)
          │
    git pull → npm install → npm build → pm2 restart
```

> **No se necesita Docker Hub ni build de imagenes.** La deploy API ya resuelve el CI/CD haciendo git pull + build + pm2 restart directamente en la VM, igual que todos los demas proyectos.

---

## Prioridades y Dependencias

```
FASE 0 (Next.js migration)
    │
    ├── FASE 1 (Backend foundation) ─── obligatorio antes de todo lo demas
    │       │
    │       ├── FASE 2 (Blog)
    │       │
    │       ├── FASE 3 (Cursos)
    │       │
    │       ├── FASE 5 (Auth/Perfil)
    │       │
    │       └── FASE 6 (Vistas publicas)
    │               │
    │               └── FASE 4 (Admin) ← requiere que las APIs esten listas
    │
    ├── FASE 7 (Observabilidad) ← puede iniciar despues de Fase 1
    │
    ├── FASE 8 (Seguridad) ← despues de que haya codigo que auditar
    │
    ├── FASE 9 (CI/CD) ← despues de Docker + tests
    │
    └── FASE 10 (Pulido) ← ultimo
```
