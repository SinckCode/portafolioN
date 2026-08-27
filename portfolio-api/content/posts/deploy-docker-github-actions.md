---
title: "CI/CD con GitHub Actions contra tu propio servidor (sin exponer SSH)"
slug: deploy-docker-github-actions
category: devops
tags: ["DevOps", "CI/CD", "GitHub Actions", "Docker", "PM2", "Deploy"]
status: published
publishedAt: 2026-07-10
contentFormat: markdown
excerpt: "Mi pipeline real: del push a main a producción en tres minutos, sin dar credenciales SSH a GitHub y con health check que detecta un deploy roto."
metaTitle: "CI/CD con GitHub Actions a tu propio servidor sin exponer SSH"
metaDescription: "Cómo despliego a un servidor propio desde GitHub Actions sin entregar llaves SSH: una deploy API con token, PM2, health checks y los errores que me costaron horas."
metaKeywords: ["github actions deploy", "ci/cd servidor propio", "deploy sin ssh", "pm2 deploy", "github actions self hosted", "webhook deploy", "healthcheck deploy"]
---

Cuando empecé a subir proyectos a producción lo hacía a mano: compilaba en mi máquina, subía archivos por SFTP y cruzaba los dedos. Funcionaba… hasta que dejaba de funcionar, normalmente porque olvidaba un archivo o desplegaba desde una rama equivocada.

Hoy cada push a `main` despliega solo. Pero el camino más común que verás en tutoriales — darle a GitHub tu llave SSH — es el que decidí **no** tomar. Esto es lo que hago en su lugar y por qué.

## El problema de darle SSH a GitHub Actions

La receta típica es guardar una llave privada en GitHub Secrets y que el workflow entre por SSH a ejecutar comandos. Funciona, y millones de proyectos lo hacen. Pero implica que:

- Una llave con acceso a tu servidor vive en un servicio de terceros.
- Esa llave normalmente tiene permisos amplios: si alguien la obtiene, tiene shell en tu máquina.
- Tienes que exponer el puerto SSH, o al menos permitir el acceso desde el rango de IPs de los runners de GitHub, que es enorme y cambiante.

Para un proyecto personal quizá sea aceptable. A mí me incomodaba, sobre todo teniendo el servidor en mi propia casa.

## La alternativa: una deploy API

En lugar de dar shell, monté un servicio pequeño en el servidor que expone **una sola acción**: desplegar un proyecto concreto. GitHub no obtiene una consola; obtiene un botón.

```
push a main → GitHub Actions → POST deploy.midominio.com/deploy/portfolio-api
                                    (Bearer token)
                                        ↓
                              git pull + npm ci + build + pm2 reload
```

El workflow queda así:

```yaml
deploy-api:
  needs: [lint-and-test-api]
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  steps:
    - name: Deploy via Deploy API
      run: |
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
          "https://deploy.midominio.com/deploy/portfolio-api" \
          -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
          --max-time 120)
        HTTP_CODE=$(echo "$RESPONSE" | tail -1)
        echo "$RESPONSE" | sed '$d'
        [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ] \
          || { echo "::error::Deploy failed (HTTP $HTTP_CODE)"; exit 1; }
```

Lo que GitHub guarda ahora es un token que solo sirve para pedir un deploy. Si se filtra, el daño máximo es que alguien redespliegue mi propio código.

El servicio en sí es un Express de menos de 200 líneas con un mapa de proyectos permitidos. La clave está en que los nombres de proyecto son una **lista blanca**, no un parámetro libre — si aceptas cualquier string y lo metes en un comando de shell, acabas de construir una ejecución remota de código.

Y el endpoint no queda expuesto por port forwarding: sale por un Cloudflare Tunnel, así que el servidor no tiene ningún puerto abierto. Eso lo cuento en [publicar tu homelab sin abrir puertos](/blog/cloudflare-tunnel-sin-abrir-puertos).

## El health check es lo que hace que sirva

Un deploy que responde 200 no significa que la app esté viva. Significa que el comando arrancó. Por eso el paso siguiente verifica de verdad:

```yaml
- name: Verify deployment
  run: |
    sleep 10
    curl -sf "https://api.midominio.com/health" --max-time 10
```

El `-f` de curl es lo importante: hace que falle con código de salida distinto de cero ante un HTTP 4xx o 5xx. Sin él, curl imprime la página de error y devuelve éxito, y el pipeline te dice que todo salió bien mientras producción está caída.

En la API el endpoint es trivial pero tiene que estar fuera del prefijo global para que no dependa de nada:

```typescript
app.setGlobalPrefix('api', { exclude: ['health'] });
```

## Contenerizar: cuándo sí

Para servicios que corren en un solo servidor, PM2 con `startOrReload` me da recargas sin downtime y menos piezas móviles que Docker. Para lo que necesita aislamiento o dependencias del sistema, Docker con build multi-stage:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=app:app . .
USER app
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:4000/health || exit 1
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

Dos cosas que no son opcionales: el `USER app` — un contenedor que corre como root es root en tu host si algo escapa —, y el `HEALTHCHECK`, que le permite al orquestador saber que el proceso está vivo pero no respondiendo.

## Los errores que me costaron horas

**Los procesos hijos no heredan tu PATH.** Mi deploy API ejecutaba `npm run build` y fallaba con "node: not found", aunque en mi sesión SSH funcionaba perfecto. La causa: Node estaba instalado con nvm, que se carga desde `~/.bashrc`, y un proceso hijo no interactivo nunca lee ese archivo. La solución fue forzar el shell y cargar nvm explícitamente:

```javascript
exec(`source ~/.nvm/nvm.sh && ${command}`, { shell: '/bin/bash' })
```

Si tu CI funciona a mano pero no automatizado, esta es la primera sospecha.

**El mismo check de seguridad falla distinto según el sistema operativo.** Tenía una validación contra path traversal usando `path.basename()`. Pasaba los tests en mi Windows y fallaba en el runner Linux: `path.basename('..\\..\\etc\\passwd')` no separa por backslash en Linux, así que devolvía la cadena completa. Ahora rechazo explícitamente `/`, `\` y `..` antes de normalizar nada.

**Prerender que rompe el build.** El sitemap dinámico crasheaba en `next build` porque el fetch parcheado de Next interfería durante el prerender. Marcarlo como `export const dynamic = 'force-dynamic'` lo resolvió — no toda ruta debe generarse en build time.

## El resultado

Del `git push` a producción verificada pasan menos de tres minutos, con lint, tests, build, deploy y health check de por medio. Si algo falla, el pipeline se detiene y me avisa antes de que el sitio quede roto.

Lo que más valoro no es la velocidad, es que **desplegar dejó de dar miedo**. Cuando el deploy es un push, corriges un bug al momento en lugar de acumular cambios hasta juntar valor para subirlos.

Si estás desplegando a mano, dedicarle una tarde a automatizarlo se paga en la primera semana.
