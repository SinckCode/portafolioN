---
title: "Monté un servidor de correo en casa y no puede enviar un solo mensaje"
slug: no-puedes-autohospedar-correo-en-casa
category: infraestructura
tags: ["Correo", "Postfix", "Self-hosting", "DNS", "SPF", "DKIM", "Homelab"]
status: draft
publishedAt: 2026-10-29
contentFormat: markdown
excerpt: "Postfix, Dovecot, OpenDKIM y Roundcube, todo funcionando en una VM de mi casa. Y es inútil, por cuatro razones que ninguna cantidad de RAM arregla."
metaTitle: "Autohospedar correo en casa: por qué no funciona (y qué hacer)"
metaDescription: "Puerto 25 bloqueado por el ISP, IP residencial en listas de bloqueo, sin control del PTR y túneles que solo transportan HTTP. La arquitectura que sí funciona para un homelab."
metaKeywords: ["autohospedar correo", "puerto 25 bloqueado isp", "servidor correo casa", "postfix homelab", "improvmx", "brevo smtp relay", "spf dkim dmarc", "ptr rdns correo"]
---

En una de mis VMs tengo un servidor de correo completo: Postfix para el
transporte, Dovecot para IMAP, OpenDKIM para firmar, MariaDB para los buzones
virtuales y Roundcube como webmail. Configurado con su dominio, escuchando en los
puertos 25, 143, 465, 587 y 993. Todo levanta, todo responde.

Y no sirve para enviar ni recibir un solo correo del mundo real.

No es un error de configuración. Es que autohospedar correo desde una conexión
doméstica choca con cuatro obstáculos, y ninguno se arregla con más recursos. Los
cuento porque yo tuve que descubrirlos después de montarlo, y preferiría haberlos
sabido antes.

## Obstáculo 1: el puerto 25 saliente está bloqueado

Este es el definitivo. Probé desde dentro de mi red:

```bash
timeout 10 bash -c "cat < /dev/null > /dev/tcp/mx1.improvmx.com/25"
# (timeout)

timeout 10 bash -c "cat < /dev/null > /dev/tcp/smtp-relay.brevo.com/587"
# (conecta)
```

El 587 sale. El **25 no**.

Y el 25 es el único puerto que importa para *entregar*. Cuando tu servidor le
manda un correo a Gmail, se conecta al puerto 25 del MX de Gmail. El 587 es para
que un cliente se autentique contra *tu* servidor, no para hablar con otros
servidores.

Casi todos los ISP residenciales bloquean el 25 saliente, y es una medida
razonable: la mayoría del spam del mundo sale de máquinas domésticas
comprometidas. Pero el efecto para ti es que tu MTA puede recibir y jamás
entregar. Nunca. A nadie.

## Obstáculo 2: tu IP está en listas de bloqueo desde antes de empezar

Supón que consigues que el ISP te abra el 25. Tu IP sigue perteneciendo a un rango
residencial, y esos rangos están en listas como la PBL de Spamhaus **por
definición**: no porque hayas hecho nada, sino porque son direcciones dinámicas de
consumo.

La mayoría de los servidores grandes consultan esas listas antes de aceptar una
conexión. Tu correo cae en spam o se rechaza en el saludo.

## Obstáculo 3: no controlas el PTR

Gmail, Outlook y Yahoo esperan que la IP que envía tenga un **DNS inverso** (PTR)
coherente con el dominio del remitente. Es un requisito publicado, no una
recomendación.

El PTR de una IP lo controla quien es dueño del bloque: tu ISP. En una conexión
doméstica el tuyo dirá algo como `dsl-189-203-205-16.tuisp.net.mx` y no hay forma
de cambiarlo.

## Obstáculo 4: el correo no entra por un túnel

Este es específico de cómo tengo montado el homelab, y es el que más me dolió
porque creí que era mi salida.

Publico todos mis servicios con Cloudflare Tunnel: sin abrir puertos, con HTTPS
gratis, sin IP fija. Pensé que podía hacer lo mismo con el correo.

No se puede. **El túnel transporta HTTP.** SMTP no es HTTP. Aunque mis MX
apuntaran a mi servidor, no habría forma de que una conexión SMTP entrante llegara
a Postfix sin abrir el 25 en el router — que es exactamente lo que el ISP bloquea.

Círculo cerrado.

## Lo que sí funciona: separar recibir de enviar

La arquitectura correcta para un homelab no es un MTA propio. Es dividir el
problema en dos, y las dos mitades tienen opciones gratuitas:

```
Recibir:  remitente → MX de tu dominio → servicio de reenvío → tu bandeja real
Enviar:   tu app → relay SMTP autenticado (puerto 587) → destinatario
```

### Recibir: reenvío

Un servicio de forwarding recibe el correo de tu dominio y lo reenvía a la bandeja
que ya usas. Yo uso ImprovMX; **Cloudflare Email Routing** es igual de bueno y
tiene la ventaja de estar en el mismo panel donde ya administras el DNS.

Dos registros MX y listo. Tu `contacto@tudominio.com` funciona sin servidor.

### Enviar: un relay por el 587

Aquí entra un servicio de correo transaccional. Brevo, Resend, Postmark, Amazon
SES: todos con nivel gratuito suficiente para un sitio personal, y todos por el
587, que sí sale de tu red.

En Node con Nodemailer:

```js
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // 587 arranca en claro y sube a TLS con STARTTLS
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
```

**Cuidado con una trampa aquí**, que me costó un rato: el `From` **no** es tu
`SMTP_USER`. Ese valor es la credencial de acceso del relay (algo como
`ad3989001@smtp-brevo.com`). El remitente tiene que ser una dirección que hayas
dado de alta y verificado en el panel del proveedor, o el mensaje se rechaza.

## Los cuatro registros DNS que no son opcionales

Con el relay ya funcionando, esto es lo que decide si tu correo llega a la bandeja
o a spam:

**MX** — quién recibe. Los que te dé tu servicio de reenvío.

**SPF** — qué servidores pueden enviar en nombre de tu dominio:

```
v=spf1 include:spf.improvmx.com include:spf.brevo.com ~all
```

Un aviso de mi propia configuración: yo tenía `ip4:189.203.205.16` ahí, mi IP de
casa. No servía de nada —el 25 está bloqueado, nada sale de ahí— y es un riesgo:
si la IP es dinámica, algún día el ISP la reasigna y quien la reciba queda
autorizado a enviar como tú. Fuera.

**DKIM** — la firma criptográfica. Los proveedores la dan como dos CNAME:

```
brevo1._domainkey  →  b1.tudominio-com.dkim.brevo.com
brevo2._domainkey  →  b2.tudominio-com.dkim.brevo.com
```

Si tu DNS está en Cloudflare, **estos CNAME van en gris (DNS only), no en
naranja**. El proxy los rompe.

Un detalle de método: yo mismo me equivoqué diagnosticando esto. Busqué el DKIM de
mi dominio en los selectores que se me ocurrieron (`mail.`, `default.`) y
consultando solo registros TXT, concluí que no existía. Sí existía: en
`brevo1._domainkey` y como **CNAME**. Si buscas DKIM, pregunta por el selector que
usa tu proveedor y no asumas el tipo de registro.

**DMARC** — qué hacer con el correo que falla las dos anteriores:

```
v=DMARC1; p=none; rua=mailto:tu@correo.com; aspf=r; adkim=r
```

Empieza en `p=none`, que solo reporta. Revisa los informes un par de semanas y
sube a `p=quarantine`. Quedarte en `p=none` para siempre es dejar la puerta
abierta: cualquiera puede falsificar tu dominio y los servidores lo aceptarán.

## ¿Y el servidor que ya monté?

El mío sigue encendido, con Roundcube accesible por el túnel, porque como
laboratorio enseña muchísimo: los buzones virtuales, los mapas de Postfix, cómo
firma OpenDKIM. Pero no tiene los MX de ningún dominio apuntándole y no los va a
tener.

Lo que sí voy a borrar es un registro A que tenía apuntando a mi IP de casa, sin
proxy. Eso publicaba mi IP de origen y anulaba el sentido del túnel para todo lo
demás: cualquiera resuelve ese subdominio y ya sabe a dónde escanear. Comprobé que
no hay ningún puerto abierto ahí, así que hoy es solo divulgación de información —
pero el registro no sirve para nada y sobra.

## Lo que me llevo

**Montar Postfix es la parte fácil.** Lo difícil de autohospedar correo no es el
software, es la reputación: IP, PTR, listas, autenticación. Eso no se instala.

**Comprueba el puerto 25 saliente antes de escribir una línea de configuración.**
Una prueba de diez segundos te ahorra un fin de semana.

**Que una VM esté corriendo no significa que sirva para algo.** La mía llevaba
meses gastando 940 MB de RAM en Postfix, Dovecot, MariaDB y Apache para no mover
un solo correo de nadie. Descubrirlo fue más útil que el servidor.
