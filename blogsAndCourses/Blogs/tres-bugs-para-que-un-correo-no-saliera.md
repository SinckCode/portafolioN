---
title: "Tres bugs apilados para que un solo correo no saliera"
slug: tres-bugs-para-que-un-correo-no-saliera
category: desarrollo-web
tags: ["NestJS", "Nodemailer", "SMTP", "Debugging", "Brevo", "Deploy"]
status: published
publishedAt: 2026-09-30
contentFormat: markdown
coverImage: /covers/tres-bugs-para-que-un-correo-no-saliera.png
excerpt: "La recuperación de contraseña de mi sitio no funcionaba. Arreglar lo que yo creía que era el problema no habría servido de nada: había tres fallos independientes, uno detrás de otro."
metaTitle: "Por qué no se enviaba mi correo: tres bugs apilados en NestJS"
metaDescription: "Caso real de depuración: variables SMTP ausentes, el remitente confundido con la credencial del relay, y plantillas .hbs que nest build no copia a dist. Ninguno se veía solo."
metaKeywords: ["nodemailer no envia", "nest build no copia assets", "hbs enoent dist", "brevo smtp relay", "MAIL_FROM smtp user", "recuperar contraseña no llega", "nestjs mailservice"]
---

Mi sitio tiene recuperación de contraseña, confirmación de newsletter y correos de
bienvenida. Ninguno funcionaba. Y el endpoint respondía `201 Created` como si todo
estuviera bien.

Lo que me dejó pensando no fue el bug, sino que eran **tres**, independientes, en
fila. Arreglar el que yo había diagnosticado no habría cambiado nada: el correo
habría seguido sin salir, y yo habría jurado que ya estaba resuelto.

## Bug 1: las variables que no estaban

Empecé comparando lo que el código pide contra lo que existe en producción:

```bash
# lo que el código espera
grep -rhoE "process\.env\.[A-Z_]+" src | sed 's/process\.env\.//' | sort -u

# lo que hay en el servidor
cut -d= -f1 .env | grep -E "^[A-Z]" | sort
```

Recomiendo ese diff a cualquiera que tenga una app en producción. En mi caso
faltaban seis variables, cinco de ellas de correo: `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS` y `MAIL_FROM`.

El transporte se construía con host y credenciales vacíos. Peor: el default del
código era `smtp.gmail.com` con usuario vacío, así que ni siquiera fallaba de
forma escandalosa, solo lanzaba una excepción que el servicio atrapaba y
registraba.

Puse las credenciales de mi relay, probé la autenticación, y funcionó:

```js
transporter.verify()
  .then(() => console.log('AUTENTICACION OK'))
  .catch(e => console.log('FALLO:', e.message));
```

`verify()` es la mejor herramienta para esto: autentica contra el servidor **sin
enviar nada**. Si eso pasa, tus credenciales y tu host son correctos y el problema
está en otra parte.

Un envío de prueba manual devolvió `250 2.0.0 OK: queued`. Yo di el caso por
cerrado. Me equivoqué.

## Bug 2: el remitente no es la credencial

Fui a leer el servicio y encontré esto:

```ts
await this.transporter.sendMail({
  from: `"Angel Onesto" <${this.configService.get('SMTP_USER')}>`,
  to, subject, html,
});
```

`SMTP_USER`. Con un relay de correo transaccional, ese valor es algo como
`ad3989001@smtp-brevo.com`: **es la credencial de acceso, no una dirección desde
la que puedas enviar.**

Los relays solo aceptan como `From` un remitente que hayas dado de alta y
verificado en su panel. Si mandas el usuario SMTP, el mensaje se rechaza — o, peor
para tu reputación, sale con un remitente que no es tu dominio.

Y el default también estaba mal:

```ts
from: process.env.MAIL_FROM || 'noreply@angelonesto.com',
```

`noreply@` sonaba razonable. No estaba verificado en el relay. El único verificado
era `contacto@`.

Dos correcciones: usar `MAIL_FROM` en lugar de `SMTP_USER`, y cambiar el default
por la dirección que de verdad está verificada.

Aproveché para alinear el servicio con el resto del proyecto. Todos mis servicios
leen la configuración con namespace (`jwt.refreshSecret`, `generation.apiKey`), y
este era el único que leía `process.env` plano con defaults inventados:

```ts
this.transporter = nodemailer.createTransport({
  host: this.configService.get<string>('mail.host'),
  port: this.configService.get<number>('mail.port'),
  secure: false, // 587 arranca en claro y sube a TLS con STARTTLS
  auth: {
    user: this.configService.get<string>('mail.user'),
    pass: this.configService.get<string>('mail.pass'),
  },
});
```

Un servicio que se sale del convenio del proyecto es una señal: casi siempre es
el que nadie ha tocado desde que se escribió, y el que nadie ha probado.

## Bug 3: el que solo aparece por el camino real

Desplegué, y en vez de confiar en mi script de prueba, pegué al endpoint que usa
la aplicación:

```bash
curl -X POST https://api.angelonesto.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@angelonesto.com"}'
```

```json
{"data":{"message":"If this email exists, a reset link has been sent"}}
```

`201`. Perfecto… salvo que ese endpoint **responde lo mismo pase lo que pase**, a
propósito: si contestara distinto cuando el correo existe, sería un oráculo para
enumerar usuarios. Es la decisión correcta de seguridad y a la vez el peor enemigo
de la depuración.

El fallo real vivía en los logs:

```
ERROR [AuthService] Failed to send reset password email to admin@angelonesto.com
Error: ENOENT: no such file or directory, open
  '.../dist/modules/mail/templates/reset-password.hbs'
```

**`nest build` compila TypeScript y no copia nada más.** Mis tres plantillas de
Handlebars vivían en `src/modules/mail/templates/`, nunca llegaban a `dist/`, y
cualquier correo con plantilla moría antes de tocar el relay.

Se arregla declarando los assets:

```json
// nest-cli.json
{
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      { "include": "modules/mail/templates/**/*.hbs", "outDir": "dist" }
    ],
    "watchAssets": true
  }
}
```

Esta vez sí:

```
LOG [MailService] Email sent to admin@angelonesto.com: Restablecer contraseña
```

## Lo que me llevo

**Un `verify()` exitoso no prueba que tu aplicación envíe correo.** Prueba que las
credenciales sirven. Entre eso y un correo entregado hay plantillas, remitentes y
un servicio que tiene que estar bien cableado.

**Prueba siempre por el camino real.** Mi script funcionaba y la aplicación no,
porque el script construía el mensaje a mano y se saltaba la plantilla. El bug 3
era invisible desde cualquier prueba que no pasara por el endpoint de verdad.

**Los endpoints que callan por diseño necesitan logs que hablen.** Un
`forgot-password` que siempre responde igual es correcto; la contrapartida es que
tienes que ir a los logs a ver qué pasó, y esos logs tienen que existir y decir
algo útil. El mío lo hacía, y fue lo único que me salvó.

**Haz el diff de variables de entorno cuando algo "no funciona y no da error".**
Tres de las áreas muertas de mi API eran variables ausentes. Es de las cosas más
baratas de comprobar y de las últimas que a uno se le ocurren.

**Y la que más me costó aceptar:** cuando arreglas un bug y el síntoma no
desaparece, la respuesta rara vez es que tu arreglo estuvo mal. Casi siempre es
que había otro detrás.
