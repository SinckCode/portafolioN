---
title: "Mi propia API de despliegue: un POST por proyecto, pipelines como datos"
slug: mi-propia-api-de-despliegue
category: devops
tags: ["DevOps", "CI/CD", "Node.js", "Express", "Deploy", "GitHub Actions"]
status: draft
publishedAt: 2026-11-05
contentFormat: markdown
excerpt: "Tenía una mini-API de deploy copiada por cada proyecto, con los comandos dentro de un controller. La reemplacé por una sola donde agregar un proyecto es editar un JSON."
metaTitle: "API de despliegue autoalojada: pipelines declarados en JSON"
metaDescription: "Cómo rediseñé mi CI/CD propio: registro de proyectos como datos, pasos de uno en uno para saber cuál falló, scripts por stdin para no escapar comillas y auth que falla cerrada."
metaKeywords: ["api de despliegue propia", "ci cd autoalojado", "deploy sin ssh github actions", "bash -s stdin ssh", "express deploy api", "pipeline json", "timingSafeEqual token"]
---

Empecé con una mini-API de despliegue para un proyecto: un `POST /deploy`, un
token, y los comandos escritos dentro del controller. Funcionó tan bien que hice
otra para el siguiente proyecto. Y otra. Llegué a tener **cuatro**, cada una con
su puerto, su túnel y sus comandos hardcodeados, dos de ellas duplicando trabajo
que ya hacía una tercera.

Este es el rediseño, y las cuatro decisiones que cambiaron cómo se comporta.

## De dónde venía

El patrón original era así:

```js
exports.deploy = (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s*/i, '');
  if (token !== SECRET) return res.status(403).send('Acceso no autorizado');

  const commands = [
    'cd /home/onesto/Proyectos/clima-web',
    'git pull origin main',
    'npm install',
    'npm run build',
    'rm -rf /var/www/clima-web/*',
    'cp -a dist/. /var/www/clima-web/',
    'sudo systemctl reload apache2',
  ];

  exec(commands.join(' && '), { timeout: 300000 }, (error, stdout, stderr) => {
    if (error) return res.status(500).send('Error en deploy:\n' + error.message);
    return res.send('Deploy completado correctamente');
  });
};
```

Funciona. Y tiene cuatro problemas que solo se ven cuando algo falla.

## Decisión 1: el registro es datos, no código

Agregar un proyecto no debería obligarte a editar el servidor. Saqué los pipelines
a un JSON:

```json
{
  "vars": {
    "HOME": "/home/onesto",
    "PROYECTOS": "/home/onesto/Proyectos",
    "DEPLOY_KEY": "/home/onesto/.ssh/deploy_key"
  },
  "targets": {
    "vm100": { "type": "local" },
    "vm103": {
      "type": "ssh", "host": "10.10.20.103", "user": "onesto",
      "key": "${DEPLOY_KEY}", "useNvm": true
    }
  },
  "projects": {
    "clima": {
      "description": "App Clima IoT",
      "target": "vm103",
      "cwd": "${PROYECTOS}/clima-web",
      "verify": { "url": "https://clima.angelonesto.com", "delayMs": 3000 },
      "steps": [
        { "name": "sync-repo", "run": "git pull origin main" },
        { "name": "deps",      "run": "npm install" },
        { "name": "build",     "run": "npm run build" },
        { "name": "publicar",  "run": "sudo rm -rf /var/www/clima-web/*\nsudo cp -a dist/. /var/www/clima-web/" },
        { "name": "reload",    "run": "sudo systemctl reload apache2" }
      ]
    }
  }
}
```

Agregar un proyecto = editar el archivo + `pm2 restart`. Y como es declarativo,
`GET /projects` puede decirte qué hace cada uno sin que nadie lea código.

El registro **se valida al arrancar**. Un `${VAR}` que no existe o un paso sin
`run` impide levantar el servicio:

```js
function interpolar(texto, vars, donde) {
  return texto.replace(/\$\{([A-Z0-9_]+)\}/g, (_, nombre) => {
    if (!(nombre in vars)) {
      throw new Error(`${donde}: la variable \${${nombre}} no esta definida`);
    }
    return vars[nombre];
  });
}
```

Prefiero no arrancar que descubrir el typo a media hora de un despliegue. Y una
variable vacía dentro de un `rm -rf` es exactamente el accidente que no quiero
tener.

## Decisión 2: los pasos corren de uno en uno

La cadena de `&&` es cómoda y te deja ciego. Cuando falla, tienes un mensaje de
error genérico y un `stdout` truncado de quince comandos concatenados. Suerte
adivinando cuál se rompió.

Ejecutando paso a paso, el error dice exactamente qué pasó:

```json
{
  "ok": false,
  "project": "portfolio-api",
  "duration": "18.4s",
  "steps": [
    { "name": "sync-repo", "ok": true,  "exitCode": 0, "duration": "1.2s" },
    { "name": "deps",      "ok": true,  "exitCode": 0, "duration": "9.8s" },
    { "name": "build",     "ok": false, "exitCode": 1, "duration": "7.4s" }
  ],
  "failed": { "step": "build", "exitCode": 1, "stderr": "...últimos 2 KB..." }
}
```

Cuesta unos milisegundos más por paso. A cambio, cada despliegue fallido se
diagnostica leyendo la respuesta.

Hay un beneficio de seguridad que no había previsto: con el orden
`build → publicar`, si el build falla **nunca se ejecuta el `rm -rf` del
directorio público**. La cadena de `&&` también lo cortaría, pero aquí es
explícito y verificable en la respuesta.

## Decisión 3: el script entra por stdin, no como argumento

Este es mi favorito, porque arregla una bomba de tiempo.

Para ejecutar en otra máquina, la versión vieja concatenaba todo y escapaba a mano:

```js
const escaped = remoteCmd.replace(/"/g, '\\"');
fullCmd = `ssh ... onesto@${host} "bash -c \\"${escaped}\\""`;
```

Eso sobrevive mientras los comandos sean simples. Pero uno de mis pipelines tiene
este paso:

```
docker compose exec -e PG_USER=whatsup -e PG_PASSWORD=x -T backend npx sequelize-cli db:migrate
```

Comillas dentro de comillas dentro de un `ssh "bash -c \"...\""`. Cada nivel de
anidamiento es una oportunidad de que el escapado se rompa, y cuando se rompe no
falla limpio: ejecuta *algo parecido* a lo que querías.

La solución es no pasar el script como argumento:

```js
const hijo = target.type === 'local'
  ? spawn('/bin/bash', ['-s'], { stdio: ['pipe', 'pipe', 'pipe'] })
  : spawn('ssh', [
      '-o', 'ConnectTimeout=10',
      '-o', 'BatchMode=yes',
      '-i', target.key,
      `${target.user}@${target.host}`,
      'bash -s',
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

hijo.stdin.write(script);
hijo.stdin.end();
```

`bash -s` lee de stdin. **Cero escapado.** El script llega byte por byte, sin
importar qué comillas contenga. Lo verifiqué con un paso deliberadamente horrible
y llegó intacto.

El script de cada paso se arma así:

```js
function script(paso, target) {
  const lineas = ['set -eo pipefail'];
  if (target.useNvm) lineas.push('export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh";');
  lineas.push(`cd ${paso.cwd}`);
  lineas.push(paso.run);
  return lineas.join('\n') + '\n';
}
```

`set -eo pipefail` para que un comando intermedio que falle corte el paso en lugar
de seguir.

## Decisión 4: auth que falla cerrada

Las versiones viejas tenían esto:

```js
const SECRET = process.env.DEPLOY_SECRET || 'cambia_este_token_super_secreto';
```

Si el `.env` no se carga, la API acepta un token que está escrito en un repositorio
público. Esto **ejecuta comandos de shell** y está publicado en internet: es lo
mismo que no tener autenticación.

Además, una de ellas imprimía el secreto en los logs de PM2 al arrancar.

La versión nueva:

```js
const TOKEN = process.env.DEPLOY_TOKEN || '';

function iguales(a, b) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function auth(req, res, next) {
  if (!TOKEN) {
    console.error('[auth] DEPLOY_TOKEN no configurado: rechazando todo');
    return res.status(503).json({ error: 'Deploy API sin token configurado' });
  }
  const recibido = (req.headers.authorization || '').replace(/^Bearer\s*/i, '').trim();
  if (!recibido || !iguales(recibido, TOKEN)) return res.status(403).json({ error: 'Unauthorized' });
  next();
}
```

Sin token en el entorno, todo es `503`. Nunca hay un valor por defecto. El hash
previo iguala longitudes para poder usar `timingSafeEqual`, que exige buffers del
mismo tamaño, sin filtrar el largo del token real.

## Dos cosas más que valen la pena

**Logs por despliegue en archivo.** La respuesta HTTP trae la cola, pero cuando un
build falla los últimos 2 KB casi nunca son la línea que importa. Cada despliegue
escribe `logs/<proyecto>/<id>.log` completo, con retención, y hay endpoints para
consultarlos después.

**Verificación post-deploy declarada por proyecto.** Un `GET` a la URL del
proyecto tras recargar. Es lo que convierte "el comando terminó sin error" en "el
sitio responde".

## Y por qué esto no tiene CI/CD

Deliberado: **es el proceso límite.** Es lo que despliega a todo lo demás. Si se
desplegara sola, un commit malo la dejaría sin forma de arreglarse a sí misma.

Se actualiza a mano, y son tres comandos:

```bash
ssh onesto@10.10.20.100
cd ~/deploy-api && git pull origin main
npm ci --omit=dev && node -e "require('./src/registry').load()" && pm2 restart deploy-api
```

Ese `registry.load()` de en medio valida el JSON **antes** de reiniciar. Si el
registro está roto, el servicio viejo sigue en pie.

## Lo que me llevo

**Cuando copias la misma pieza por tercera vez, el problema es el diseño.** Cuatro
APIs de deploy no eran cuatro necesidades: era una, mal factorizada.

**Lo que no puedes inspeccionar, no lo controlas.** El cambio de mayor impacto no
fue técnico, fue que ahora `GET /projects` responde qué hace cada pipeline y
`GET /deploys/:proyecto` qué pasó en los últimos.

**Los defaults cómodos son deuda de seguridad.** `|| 'cambia_este_token'` se
escribe en dos segundos y se queda años.

El código está público, si te sirve de base: **[github.com/SinckCode/deploy-api](https://github.com/SinckCode/deploy-api)**.
