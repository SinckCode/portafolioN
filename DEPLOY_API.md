# Cómo se despliega este proyecto — Deploy API

> Última actualización: 2026-09-30

**Lee esto antes de tocar el CI/CD de este repo o de cualquier otro proyecto del
homelab.** El servidor tiene una API de despliegue propia. No hay `ssh` ni
`rsync` en los workflows de GitHub Actions: el pipeline hace un `POST` y la API
se encarga del resto.

## El mecanismo

```
push a main
   ↓
GitHub Actions (.github/workflows/ci-cd.yml)
   ↓  POST https://deploy.angelonesto.com/deploy/<proyecto>
   ↓  Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}
Deploy API (VM 100, puerto 5000, expuesta por Cloudflare Tunnel)
   ↓  ejecuta el pipeline de ESE proyecto
   ├── local en VM 100      → portfolio-api, portfolio-frontend
   └── por SSH a otra VM    → astrocloud (104), clima / whatsupearth / erp / sensores (103)
```

- **Repo de la API:** `SinckCode/deploy-api`
- **En la VM:** `onesto@10.10.20.100:~/deploy-api`
- **Registro de proyectos:** `~/deploy-api/projects.json` — pipelines declarados
  como datos. Agregar un proyecto no toca código.
- **No tiene CI/CD propio, a propósito:** es el proceso límite que despliega a
  todos los demás. Se actualiza a mano: `git pull` + `pm2 restart deploy-api`.

## Qué corre cuando se despliega este repo

`POST /deploy/portfolio-api`:

| Paso | Comando | Por qué |
|---|---|---|
| `sync-repo` | `git pull` del monorepo en `~/portfolio` | |
| `deps` | `npm ci` | |
| `build` | `npm run build` | |
| `seed-proyectos` | `node dist/seeds/seed.js --only=projects` | **Publica el contenido de git a Mongo** |
| `sync-posts` | `node scripts/sync-posts.js` | Igual, para los artículos del blog |
| `reload` | `pm2 startOrReload infra/ecosystem.config.js --only portfolio-api` | |

`POST /deploy/portfolio-frontend`: `sync-repo → deps → build → reload`.

### Los dos pasos de contenido son la parte que importa

Antes no existían, y era la causa de un bug silencioso: los 17 proyectos tenían
`details: ""` en la base de producción, así que `/portafolio/[slug]` caía al
fallback estático y servía descripciones pobres sin que nada fallara a la vista.

Ahora **el contenido versionado en git es la fuente de verdad** y se publica en
cada deploy de la API:

- `portfolio-api/content/projects.json` → descripciones largas de los proyectos
- `portfolio-api/content/posts/*.md` → artículos del blog

Los dos scripts hacen *upsert* por slug: no borran nada y preservan
`views` / `likes` / `likesBy`. Corren sobre `dist/`, así que no dependen de
`ts-node` ni de que `npm ci` instale devDependencies.

**Consecuencia a tener presente:** si editas un proyecto o un artículo desde
`/admin`, el siguiente deploy de la API lo revierte a lo que diga git. Para que
un cambio sobreviva, va en el `.md` o en el `projects.json` y se commitea. Los
artículos creados directamente en el panel (que no existen como `.md`) no se
tocan.

## Publicar contenido sin tocar código

1. Editar `portfolio-api/content/posts/*.md` o `content/projects.json`
2. Commit y push a `main`
3. El CI despliega y el deploy publica el contenido

Para revisar antes: `npm run posts:sync:dry` en `portfolio-api`.

Las páginas usan ISR con `revalidate: 300`, así que tras el deploy hay que
esperar ~5 min o pegarle dos veces a la URL para ver el cambio.

## Agregar un proyecto nuevo al servidor

1. En `~/deploy-api/projects.json` de la VM 100, agregar la entrada con sus
   `steps`, su `target` y su `verify`. Ver el README del repo `deploy-api`.
2. `pm2 restart deploy-api`
3. En el repo del proyecto nuevo, un job de deploy que haga el `POST`, con
   `DEPLOY_TOKEN` como secret del repo.
4. Si necesita dominio, agregarlo al `config.yml` de cloudflared en la VM.

## Estado del resto de las deploy APIs (2026-09-30)

Hay mini-APIs legacy de la época anterior, una por proyecto, que hoy son
**duplicados** de lo que ya hace la unificada:

| Dónde | Puerto | Túnel | Estado |
|---|---|---|---|
| VM 100 `~/deploy-api` | 5000 | `deploy.angelonesto.com` | **La que se usa** |
| VM 103 `~/Apis/Whasup-earthDeploy` | 4001 | `deploy-whatsupearth.angelonesto.com` | Legacy, redundante |
| VM 103 `~/Apis/climaDeploy` | 4002 | `deploy-clima.angelonesto.com` | Legacy, redundante. Loguea el token en claro |
| VM 103 `~/Apis/erp-Deploy` | 4006 | `deploy-erp.angelonesto.com` | En disco, **no corre**: túnel apuntando a nada |

Inventario completo y detalles de seguridad en
`E:\Universidad\serverProxmox\DEPLOY_APIS.md`.
