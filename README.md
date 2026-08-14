# mi-portfolio-3d

Monorepo for **angelonesto.com** — personal portfolio with 3D interactive background.

## Architecture

```
mi-portfolio-3d/
  portfolio-frontend/   Next.js 15 + React 19 + Tailwind 4 + Three.js
  portfolio-api/        NestJS 10 + MongoDB (Mongoose) + JWT auth
  infra/                Terraform, Ansible, deploy API, monitoring
```

## Quick Start

### Prerequisites

- Node.js 22+
- MongoDB 8.0 (local or remote)

### Backend (API)

```bash
cd portfolio-api
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, etc.
npm install
npm run seed                 # populate DB with initial data (requires SEED_ADMIN_PASSWORD)
npm run start:dev            # http://localhost:4000/api
```

### Frontend

```bash
cd portfolio-frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL
npm install
npm run dev                  # http://localhost:3000
```

### Both at once (from root)

```bash
npm run dev:api      # starts API in watch mode
npm run dev:frontend # starts Next.js dev server
```

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4, Three.js, Framer Motion |
| Backend | NestJS 10, Mongoose 8, Passport (JWT + OAuth), Sharp, Pino |
| Database | MongoDB 8.0 |
| Infra | Proxmox VMs, PM2, Nginx, GitHub Actions CI/CD |

## Features

- 3D interactive hero with `.glb` model
- 17 portfolio projects with filtering, search, and detail pages
- Blog with markdown content, likes, and comments
- Course platform with modules, lessons, enrollment, and certificates
- Admin panel with full CRUD for all content types
- OAuth login (Google, GitHub) + email/password auth
- Newsletter subscription
- Analytics tracking
- Responsive dark-mode design with glassmorphism effects

## License

MIT
