# Contexto Completo — angelonesto.com

> Documento de referencia para no perder contexto entre sesiones.
> Ultima actualizacion: 2026-08-16

---

## Resumen del Proyecto

**angelonesto.com** es la plataforma de marca personal de Angel David Onesto Frias. Evoluciono de un portafolio React SPA basico a una plataforma completa con backend NestJS, sistema de cursos, blog con IA, mensajeria en tiempo real, y panel de administracion.

**Repositorio:** github.com/SinckCode/portafolioN (monorepo)
**Stack:** Next.js 14 (frontend) + NestJS 10 (backend) + MongoDB 8.0 + Socket.IO

---

## Arquitectura

```
portfolio-frontend/    Next.js 14 (App Router, SSR)
portfolio-api/         NestJS 10 (REST + WebSocket)
infra/                 Terraform, Ansible, Docker configs
security-tests/        OWASP ZAP configs
```

### Infraestructura de Produccion

```
Proxmox Hypervisor
├── VM 100 (10.10.20.100) — App Server (Ubuntu 24.04, 2CPU/2GB)
│   ├── Portfolio Frontend (Next.js via PM2)
│   ├── Portfolio API (NestJS via PM2)
│   ├── Deploy API (CI/CD propio, puerto 5000)
│   └── Cloudflare Tunnels → angelonesto.com + api.angelonesto.com
├── VM 101 (10.10.30.101) — MongoDB Server (3CPU/4GB, auth enabled)
├── VM 103 (10.10.20.103) — WhatsUpEarth, ERP, Clima, Sensores
└── VM 104 (10.10.20.104) — AstroCloud (astrocloud.dev)
```

---

## Frontend — Paginas Implementadas (18 rutas)

### Publicas
| Ruta | Descripcion |
|------|-------------|
| `/` | Landing 3D con Three.js, hero con rotacion de roles, about, servicios, proyectos, blog preview, contacto |
| `/blog` | Listado de posts con filtros |
| `/blog/[slug]` | Post individual |
| `/portafolio` | Listado de proyectos con filtros por tipo/categoria/tecnologia |
| `/portafolio/[slug]` | Detalle del proyecto |
| `/cursos` | Listado de cursos |
| `/cursos/[slug]` | Detalle del curso con enrollment |
| `/cursos/[slug]/[lesson]` | Leccion individual (protegida por enrollment) |
| `/contacto` | Formulario de contacto |
| `/certificado/[id]` | Verificacion publica de certificados |

### Autenticacion
| Ruta | Descripcion |
|------|-------------|
| `/login` | Login (email/password + OAuth Google/GitHub) |
| `/registro` | Registro |
| `/forgot-password` | Recuperar contrasena |
| `/reset-password/[token]` | Reset con token |
| `/verify-email/[token]` | Verificacion de email |
| `/auth/callback` | Callback de OAuth |

### Usuario Autenticado
| Ruta | Descripcion |
|------|-------------|
| `/perfil` | Perfil del usuario |
| `/perfil/editar` | Editar perfil |
| `/perfil/cursos` | Cursos inscritos |
| `/mensajes` | Chat directo con otros usuarios (WebSocket real-time) |

### Admin Panel (12 secciones)
| Ruta | Descripcion |
|------|-------------|
| `/admin` | Dashboard |
| `/admin/proyectos` | CRUD de proyectos |
| `/admin/servicios` | CRUD de servicios |
| `/admin/posts` | CRUD de posts (con editor TipTap) |
| `/admin/cursos` | CRUD de cursos |
| `/admin/usuarios` | Gestion de usuarios |
| `/admin/categorias` | Categorias |
| `/admin/comentarios` | Moderacion de comentarios |
| `/admin/mensajes` | Vista admin de todas las conversaciones |
| `/admin/newsletter` | Suscriptores |
| `/admin/configuracion` | Configuracion del sitio |
| `/admin/media` | Gestion de archivos |

---

## Backend — 18 Modulos NestJS

| Modulo | Endpoints | Descripcion |
|--------|-----------|-------------|
| **auth** | 14 endpoints | Registro, login, OAuth (Google/GitHub), JWT access+refresh, email verify, password reset, rate limiting |
| **users** | 5 endpoints | CRUD de usuarios, busqueda |
| **posts** | 6 endpoints | Blog con slugs, filtros, likes, ownership |
| **projects** | 5 endpoints | Portafolio con filtros por tipo/featured/categoria/tecnologia |
| **courses** | 7 endpoints | LMS: cursos, modulos, lecciones, reviews |
| **enrollments** | 5 endpoints | Inscripcion, progreso, verificacion |
| **certificates** | 3 endpoints | Generacion y verificacion publica (formato AO-xxx) |
| **categories** | 5 endpoints | Categorias compartidas |
| **comments** | 6 endpoints | Comentarios polimorficos con moderacion |
| **messages** | 8 endpoints | Mensajeria directa + vista admin |
| **services** | 5 endpoints | Servicios ofrecidos |
| **newsletter** | 3 endpoints | Suscripcion con token-based unsubscribe |
| **upload** | 3 endpoints | Archivos (50MB) + avatars (10MB) |
| **analytics** | 3 endpoints | Tracking de page views propio |
| **site-config** | 2 endpoints | Configuracion dinamica |
| **generation** | 1 endpoint | Generacion de posts con Claude AI |
| **health** | 1 endpoint | Health check (CI/CD) |
| **mail** | servicio interno | Emails transaccionales |

**Total: ~82 endpoints REST + WebSocket namespace /messages**

---

## Features Clave Implementadas

### Autenticacion y Seguridad
- JWT con access token (15min) + refresh token (7d) + auto-refresh en frontend
- OAuth con Google y GitHub
- Rate limiting diferenciado en auth endpoints
- CSP + COOP/CORP headers
- OWASP ZAP: 0 high/critical findings
- Path traversal protection en uploads
- Roles: admin, editor, user

### Landing 3D
- Three.js/WebGL con campo de estrellas (starfield)
- Parallax con mouse, fade con scroll
- Rotacion de roles en hero: "Full Stack", "DevOps", "Infraestructura"
- Fallback si WebGL no carga (timeout 3s)

### Blog
- Editor TipTap (block editor, reemplazo de markdown)
- Generacion de posts con Claude AI
- Slugs, categorias, likes
- SEO: JSON-LD structured data

### Sistema de Cursos (LMS)
- Cursos con modulos y lecciones
- Enrollment requerido para acceder a lecciones de pago
- Tracking de progreso por leccion
- Reviews/ratings
- Generacion de certificados verificables (AO-xxx)

### Mensajeria en Tiempo Real
- WebSocket con Socket.IO (namespace /messages)
- Patron Rocket.Chat: HTTP response como source of truth, WebSocket para real-time
- Optimistic UI con reemplazo por respuesta del servidor
- Auto-refresh de JWT en WebSocket (auth como funcion, no valor estatico)
- Confirmacion de entrega estilo WhatsApp:
  - Reloj = enviando (optimistic)
  - ✓ blanco = enviado al servidor
  - ✓✓ verde lima = entregado al destinatario
  - ✓✓ ambar = leido
- Polling fallback solo cuando WebSocket esta desconectado (10s)
- Panel admin: vista de todas las conversaciones + chat propio + eliminacion

### DevOps/CI/CD
- GitHub Actions: build + deploy automatico
- Deploy API propia (deploy.angelonesto.com) que maneja multiples proyectos/VMs
- Docker hardening + .dockerignore
- Health check endpoint para verificacion post-deploy
- Graceful shutdown + validacion de env vars

---

## Historial de Desarrollo (commits clave)

```
2026-06   Inicio: React CRA → Next.js migration + NestJS backend
          Portfolio SPA con 13 componentes y Three.js
          Plan maestro con 10 fases

2026-07   Seguridad enterprise: CSP, rate limiting, OWASP ZAP scan
          CI/CD con GitHub Actions + deploy API
          SEO: JSON-LD, sitemap dinamico, Twitter Cards
          Editor TipTap para blog
          Generacion de posts con Claude AI
          Performance: modelo GLB de 76MB → sistema de particulas WebGL

2026-08   Starfield (particulas como estrellas)
          Sistema de cursos con enrollment
          Mensajeria en tiempo real (Socket.IO)
          Confirmacion de entrega WhatsApp-style
          Auto-refresh de JWT
          Patron Rocket.Chat para mensajeria robusta
```

---

## Proximos Pasos (angelonesto.com)

### Monetizacion con marca personal
- [ ] Contenido premium (micro-pagos desde $1)
- [ ] Integracion de pagos (Stripe/MercadoPago)
- [ ] Cursos de pago con certificados
- [ ] Membresías o suscripciones

### Comunidad
- [ ] Sistema de comentarios mejorado
- [ ] Foro o discusiones
- [ ] Notificaciones push

### Contenido
- [ ] Blog activo con SEO (contenido tecnico en espanol)
- [ ] YouTube/redes sociales
- [ ] Open source projects bajo la marca

### Separacion de marcas
- angelonesto.com = marca personal, educacion, comunidad, micro-pagos
- astrocloud.dev = servicios comerciales para negocios

---

## Archivos Criticos

```
E:\NEGOCIOS\mi-portfolio-3d\
├── PLAN_MAESTRO.md          Infra, VMs, servicios, deploy config
├── CONTEXTO_ANGELONESTO.md  ESTE ARCHIVO — contexto completo
├── DESIGN.md                Sistema de diseno, colores, tipografia
├── portfolio-frontend/
│   ├── src/app/             18 rutas (App Router)
│   ├── src/components/      Componentes compartidos
│   ├── src/context/         AuthContext (JWT + OAuth)
│   └── src/lib/api.ts       Cliente API con auto-refresh
└── portfolio-api/
    └── src/modules/         18 modulos NestJS
```
