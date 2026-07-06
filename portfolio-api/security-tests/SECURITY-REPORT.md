# Reporte de Seguridad — angelonesto.com (producción)

**Fecha:** 2026-07-06
**Alcance:** frontend `https://angelonesto.com` (Next.js) y API `https://api.angelonesto.com` (NestJS), MongoDB (VM101).
**Metodología:** OWASP ZAP Baseline (Docker) + `npm audit` + hardening manual, replicando el enfoque de `SEMESTRE5/adminProyectosTec/parcial1`.

## Resumen ejecutivo

**0 vulnerabilidades High/Critical** detectadas por OWASP ZAP en ambos sitios. Los hallazgos fueron cabeceras de seguridad faltantes (patrón OWASP A05: Security Misconfiguration), ya remediadas. Se blindó además la base de datos y la superficie del API.

| Objetivo | FAIL (High) | WARN | PASS | Estado |
|---|---|---|---|---|
| API (api.angelonesto.com) | 0 | 5 | 62 | Endurecido |
| Frontend (angelonesto.com) | 0 | 11 | 56 | Endurecido |

Reportes HTML/JSON: `security-tests/reports/{api,frontend}-baseline.{html,json}`.

## Hallazgos y remediación

### Cabeceras de seguridad (Low/Medium) — RESUELTO
Faltaban HSTS, X-Content-Type-Options, CSP, CORP, COOP, Referrer-Policy, Permissions-Policy.
- **Frontend** (`next.config.ts`): CSP completa (self + API + fuentes Google), HSTS, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP, `poweredByHeader:false`.
- **API** (`src/main.ts`): `helmet()` explícito (HSTS, referrer strict-origin, CORP **cross-origin** para servir `/uploads` al frontend), `X-Content-Type-Options nosniff`, `trust proxy` (detrás de Cloudflare).
- Verificado en vivo con `curl -I` (todas presentes).

### Swagger expuesto — RESUELTO
`/docs` se deshabilita cuando `NODE_ENV=production` (antes exponía toda la superficie del API). Verificado: `/docs` → 404 en prod.

### MongoDB — ENDURECIDO
- **UFW** en VM101: 27017 permitido **solo** desde 10.10.20.100 (app); acceso externo bloqueado (verificado). Defensa en profundidad sobre la segmentación de OPNsense.
- **Backups** diarios (`mongodump` gzip, cron 03:30, retención 7 días) en `~/backups/mongo`.
- Usuario de app `portfolioApp` con `readWrite` solo sobre la DB `portfolio` (mínimo privilegio, aislado del resto de DBs). Usuario `monitoring` con `clusterMonitor` para métricas.

### CORS / Rate limiting / Auth — YA CORRECTOS (verificado)
- CORS restringido a `https://angelonesto.com`.
- `@nestjs/throttler` activo (100 req/60s).
- JWT con secretos fuertes generados en prod (no los de dev), expiración 15m; refresh hasheado.
- Passwords bcrypt (coste 12); password admin de prod rotado (no `ChangeMe123!`).
- Validación estricta de DTOs (`whitelist` + `forbidNonWhitelisted`).
- Uploads validados (tipo/tamaño; avatar recortado con sharp a 512px).

## Dependencias (`npm audit --omit=dev`)

De **7 high** iniciales de runtime → **4 high, 0 critical** tras upgrades seguros:
- **Resueltos** (bcrypt 5→6): cadena `@mapbox/node-pre-gyp` → `tar` (path traversal). nodemailer→7.
- **Pendientes (riesgo aceptado / documentado):**
  - `multer` y `@nestjs/platform-express` (DoS por multipart incompleto): el multer vulnerable vive dentro de `@nestjs/platform-express@10`. Se corrige migrando a **NestJS 11** (usa multer 2.x). Mitigado hoy por límites de tamaño (avatar 10MB, general 50MB) y rate limiting. **Remediación planificada:** upgrade a NestJS 11 con pruebas de uploads.
  - `lodash` (`_.template` code injection): dependencia transitiva; **no explotable** en este proyecto (no se usa `_.template` con entrada de usuario). Sin versión con fix disponible.

**Gate de CI:** `npm audit --omit=dev --audit-level=critical` (0 críticos). Subir a `--audit-level=high` tras la migración a NestJS 11.

## Pendientes / mejoras futuras

- Migrar a NestJS 11 para cerrar multer/platform-express.
- CSP con nonces (hoy usa `unsafe-inline`/`unsafe-eval` que Next.js requiere sin nonce).
- Cloudflare WAF + rate-limit en el edge (requiere API token de Cloudflare).
- Escaneo ZAP **active** (además del baseline) y `trivy` a imágenes en el pipeline.
- Entrega de alertas por correo: el mail-server (VM102) rechaza relay externo; habilitar relay desde 10.10.20.100 o usar webhook (Telegram/Discord).
