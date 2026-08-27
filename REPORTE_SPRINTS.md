# Reporte de Trabajo: Plan Integral mi-portfolio-3d

**Fecha:** 13-14 agosto 2026
**Proyecto:** angelonesto.com (monorepo mi-portfolio-3d)
**Commits:** 14 commits, 260 archivos modificados, +654 / -14,243 lineas

---

## Sprint 1: Seguridad e Higiene

### 1.1 Secrets y fallbacks inseguros eliminados
- **`portfolio-api/src/config/configuration.ts`** — Eliminados fallbacks hardcodeados para `MONGODB_URI`, `JWT_SECRET` y `JWT_REFRESH_SECRET`. Creada funcion `requiredEnv()` que lanza error si falta la variable.
- **`portfolio-api/src/modules/auth/strategies/jwt.strategy.ts`** — Cambiado `configService.get('jwt.secret', 'change-me-super-secret')` a `configService.getOrThrow('jwt.secret')`.
- **`portfolio-api/src/seeds/seed.ts`** — Password de admin ahora viene de `process.env.SEED_ADMIN_PASSWORD` (antes hardcodeado como `'ChangeMe123!'`).
- **`portfolio-api/.env.example`** — Agregada variable `SEED_ADMIN_PASSWORD`.

### 1.2 Path traversal corregido
- **`portfolio-api/src/modules/upload/upload.service.ts`** — Metodo `deleteFile()` ahora rechaza filenames con `/`, `\`, o `..` antes de `path.basename()`. Funciona en Linux y Windows.

### 1.3 Puerto API consistente
- **`portfolio-api/ecosystem.config.js`** — Corregido `PORT: 3001` a `PORT: 4000` (consistente con Dockerfile y `infra/ecosystem.config.js`).

### 1.4 Archivos removidos del tracking
- `*.tsbuildinfo` agregado a `.gitignore`.
- `stitch_ao_full_stack_portfolio.zip` y directorio eliminados de git.

### 1.5 Transform interceptor
- **`portfolio-api/src/common/interceptors/transform.interceptor.ts`** — Detecta si la respuesta ya tiene envelope `data` (paginacion) y evita doble wrapping.

**Commits:**
- `bfc0788` security: eliminar fallbacks inseguros, fix path traversal y password hardcodeado
- `4d8b023` chore: gitignore tsbuildinfo/stitch, fix puerto API, fix transform interceptor

---

## Sprint 2: Estabilidad y Calidad

### 2.1 Graceful shutdown
- **`portfolio-api/src/main.ts`** — Agregado `app.enableShutdownHooks()` para cierre limpio de conexiones.

### 2.2 Validacion de env vars al arranque
- **`portfolio-api/src/config/env.validation.ts`** (nuevo) — Clase `EnvironmentVariables` con `class-validator` que valida `MONGODB_URI` (requerido), `JWT_SECRET` (min 16 chars), `JWT_REFRESH_SECRET` (requerido).
- **`portfolio-api/src/app.module.ts`** — Integrado `validate` en `ConfigModule.forRoot()`.

### 2.3 Docker hardening
- **`portfolio-api/Dockerfile`** — Multi-stage build con deps de produccion, usuario no-root, `HEALTHCHECK`, `ENV NODE_ENV=production`.
- **`portfolio-api/.dockerignore`** (nuevo) — Excluye `node_modules`, `.env*`, `test`, `uploads`, etc.

### 2.4 Tests iniciales
- **`portfolio-api/src/modules/upload/upload.service.spec.ts`** (nuevo) — Tests de path traversal: rechaza `../`, `/`, `\`, y `..\\` en filenames.
- **`portfolio-api/src/modules/auth/auth.service.spec.ts`** (nuevo) — Tests de login exitoso, credenciales invalidas, registro de usuario, refresh token.
- **`portfolio-api/src/common/interceptors/transform.interceptor.spec.ts`** (nuevo) — Tests de envelope detection (evita doble wrapping).
- **`portfolio-api/test/jest-e2e.json`** (nuevo) — Configuracion E2E.

### 2.5 Rate limiting diferenciado
- **`portfolio-api/src/modules/auth/auth.controller.ts`** — Decorador `@Throttle({ default: { limit: 5, ttl: 60000 } })` en controlador de auth (5 req/min vs 100/min global).
- **`portfolio-api/src/app.module.ts`** — Named throttlers configurados.

**Commits:**
- `04adfff` feat: graceful shutdown + validacion de env vars al arranque
- `162edbb` chore: Dockerfile hardening + .dockerignore
- `4778d8e` test: suite inicial — upload (path traversal), auth (login/register), interceptor
- `da4e0bc` security: rate limiting diferenciado en auth endpoints

---

## Sprint 3: Completar Frontend

### 3.1 Esquema de proyecto enriquecido
- **`portfolio-api/src/modules/projects/schemas/project.schema.ts`** — Agregados campos `videos`, `credentials`, `api`, `demos` al schema de Mongoose para que el seed completo funcione.
- **`portfolio-api/src/seeds/seed.ts`** — Datos de los 17 proyectos ahora incluyen todos los campos (videos, credenciales, API endpoints, demos).

### 3.2 Paginas de proyecto API-first
- **`portfolio-frontend/src/app/portafolio/[slug]/page.tsx`** — Fetch primario desde `API_URL/projects/{slug}` con `revalidate: 3600` (ISR). Fallback a datos estaticos si la API no responde.

### 3.3 Sitemap dinamico
- **`portfolio-frontend/src/app/sitemap.ts`** — Cambiado de prerender estatico a `force-dynamic`. Fetchea proyectos, posts y cursos desde la API con fallback estatico para proyectos]

### 3.4 Paleta de colores alineada a DESIGN.md
- **`portfolio-frontend/src/app/globals.scss`** — 140 lineas cambiadas:
  - Primary: `#48cae4` / `#4cd6fb` → `#00b4d8`
  - Background/surface: `#030405` / `#0e1416` → `#000000`
  - 13 ocurrencias de `rgba(76, 214, 251, ...)` → `rgba(0, 180, 216, ...)`

**Commits:**
- `96bfdc7` feat: enrich project schema with video, credentials, api fields + complete seed data
- `74f2f36` feat: API-first project pages, dynamic sitemap, align color palette to DESIGN.md

---

## Sprint 4: Pulido y Lanzamiento

### 4.1 SEO: JSON-LD + Twitter Cards + Manifest
- **`portfolio-frontend/src/app/portafolio/[slug]/page.tsx`** — JSON-LD `CreativeWork` structured data inyectado via `<script type="application/ld+json">`. Twitter Cards en `generateMetadata`.
- **`portfolio-frontend/src/app/cursos/[slug]/page.tsx`** — Twitter Cards agregadas.
- **`portfolio-frontend/src/app/layout.tsx`** — `manifest: '/manifest.json'`, Twitter Card defaults globales.

### 4.2 Eliminacion de app legacy CRA
- **Eliminados 210+ archivos** del directorio `src/` (componentes React, CSS, assets de 17 proyectos incluyendo videos pesados).
- **Eliminados** `public/` (favicon, index.html, manifest.json, portafolio.glb de 79MB).
- **`.gitignore`** — Reescrito: eliminadas entradas CRA, agregados `/src`, `/build`, `/public`.
- **`package.json` (raiz)** — Reemplazado react-scripts con shortcuts de monorepo (`dev:api`, `dev:frontend`, `build:api`, `build:frontend`).

### 4.3 Documentacion
- **`README.md`** — Reescrito completamente con arquitectura real, tech stack, quick start, y features.
- **`PLAN_MAESTRO.md`** — Credenciales sanitizadas (passwords → `ver .env`, connection strings → `<USER>:<PASSWORD>`).
- **Eliminados** documentos pesados obsoletos: `VIEWS.md` (140KB), `BACKEND_VIEWS.md` (69KB), `FUNCTIONALITY_PLAN.md` (47KB).

### 4.4 CI/CD fix
- **`infra/deploy-api/server.js`** — Dos cambios criticos:
  1. `shell: '/bin/bash'` en `exec()` para que `source ~/.nvm/nvm.sh` funcione.
  2. Local deploys ahora prefijan `${NVM_SOURCE}` (antes solo los remotos lo hacian).
- Eliminadas entradas legacy (`portafolio` CRA y `mi-api` Express) del deploy server.

**Commits:**
- `3edb01b` seo: JSON-LD structured data, Twitter Cards, manifest link
- `7e7a48e` chore: remove legacy CRA app, clean gitignore, monorepo package.json
- `244aaa1` docs: sanitize credentials from PLAN_MAESTRO, rewrite README for monorepo
- `189ef19` fix: path traversal check works on Linux (reject backslashes explicitly)
- `ec37fa0` fix: sitemap as dynamic route to avoid prerender failure during build
- `e9867a0` fix: source nvm in local deploys so CI/CD uses Node 22

---

## Trabajo en Servidor (VM 100 — 10.10.20.100)

### Node.js upgrade
- Instalado **nvm** y **Node 22.23.2** (antes: system Node v20.20.2).
- Reinstalado `pm2` global bajo Node 22, configurado `pm2 startup` con path correcto.
- Los 3 procesos PM2 funcionando: `portfolio-api` (:4000), `portfolio-frontend` (:3001), `deploy-api` (:5000).

### Deploy manual
- `git pull`, `npm ci`, `npm run build` para API y frontend.
- `pm2 startOrReload` para ambos servicios.

### Deploy-api actualizado
- Copiado `server.js` corregido a `/home/onesto/deploy-api/server.js`.
- Reiniciado via `pm2 restart deploy-api`.

---

## Bugs corregidos durante el proceso

| Bug | Causa raiz | Fix |
|-----|-----------|-----|
| TypeScript error en sitemap.ts | Faltaba tipo en fallback estatico | Anotacion explicita `SlugItem[]` |
| Path traversal falla en Linux CI | `path.basename('..\\..\\etc\\passwd')` no separa backslashes en Linux | Check explicito de caracteres `/`, `\`, `..` |
| Sitemap crash en `next build` | `c.map is not a function` — Next.js patched fetch interfiere con prerender | `export const dynamic = 'force-dynamic'` + `cache: 'no-store'` |
| CI/CD deploy 502 | deploy-api child processes no encuentran Node (nvm no sourced) | `shell: '/bin/bash'` + `${NVM_SOURCE}` en local deploys |

---

## Estado Final

- **CI/CD Pipeline:** PASANDO (lint, test, build, deploy API, deploy frontend, OWASP ZAP)
- **Produccion:** angelonesto.com sirviendo Next.js 15, api.angelonesto.com sirviendo NestJS
- **Seguridad:** Sin secrets en git, path traversal corregido, rate limiting en auth, env vars validadas
- **Tests:** 3 test suites (upload, auth, interceptor)
- **SEO:** JSON-LD, Twitter Cards, sitemap dinamico, manifest
- **Legacy:** App CRA completamente eliminada (210+ archivos, ~79MB de assets)
