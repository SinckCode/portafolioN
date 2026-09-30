---
title: "Monté un servidor de correo en casa: lo que sí puede y lo que nunca va a poder"
slug: autohospedar-correo-en-casa-limites
category: infraestructura
tags: ["Correo", "Postfix", "Self-hosting", "DNS", "SPF", "DKIM", "Homelab"]
status: published
publishedAt: 2026-09-30
contentFormat: markdown
coverImage: /covers/autohospedar-correo-en-casa-limites.png
excerpt: "Postfix, Dovecot y OpenDKIM en una VM de mi casa. Enviar sí puede, con truco. Recibir no va a poder nunca, y la razón no es la que yo creía."
metaTitle: "Autohospedar correo en casa: qué sí funciona y qué no"
metaDescription: "El puerto 25 saliente bloqueado se resuelve con un relay autenticado en el 587. Recibir no: hace falta abrir el 25 entrante, y un tunel HTTP no transporta SMTP."
metaKeywords: ["autohospedar correo", "puerto 25 bloqueado isp", "servidor correo casa", "postfix homelab", "improvmx", "brevo smtp relay", "spf dkim dmarc", "ptr rdns correo"]
---

En una de mis VMs tengo un servidor de correo completo: Postfix para el
transporte, Dovecot para IMAP, OpenDKIM para firmar, MariaDB para los buzones
virtuales y Roundcube como webmail. Configurado con su dominio, escuchando en los
puertos 25, 143, 465, 587 y 993.

Este artículo empezó siendo "y no sirve para nada". Lo reescribí a mitad porque
cuando fui a comprobarlo con datos, la realidad era más interesante: **enviar sí
puede.** Lo que no va a poder nunca, en esta conexión, es recibir.

La diferencia entre las dos mitades es la parte útil, y tardé en entenderla.

## El puerto 25 saliente está bloqueado (y se rodea)

Empecé por aquí porque creí que era el obstáculo definitivo. Probé desde dentro de
mi red:

```bash
timeout 10 bash -c "cat < /dev/null > /dev/tcp/mx1.improvmx.com/25"
# (timeout)

timeout 10 bash -c "cat < /dev/null > /dev/tcp/smtp-relay.brevo.com/587"
# (conecta)
```

El 587 sale. El **25 no**.

Y el 25 es el que importa para *entregar*: cuando tu servidor le manda un correo a
Gmail, se conecta al puerto 25 del MX de Gmail. Casi todos los ISP residenciales lo
bloquean, y es razonable — la mayoría del spam sale de máquinas domésticas
comprometidas.

Ahí es donde yo di el caso por perdido, y donde me equivoqué. **Un MTA no está
obligado a entregar directo.** Puede reenviar todo a través de un servidor
autenticado, por un puerto que sí sale:

```
relayhost = [smtp.sendgrid.net]:587
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
```

Esas tres líneas en `main.cf` convierten a Postfix en un cliente de un relay. Tu
servidor sigue siendo el que compone y firma el mensaje; la entrega final la hace
alguien con IP limpia y reputación.

Lo descubrí revisando mi propia configuración, que ya lo tenía puesto de una sesión
anterior que había olvidado. Enviar, entonces, sí se puede. Con un intermediario,
pero se puede.

## Por qué el relay no es "trampa", es la única vía

Supón que consigues que el ISP te abra el 25. Aun así:

**Tu IP está en listas de bloqueo desde antes de empezar.** Los rangos
residenciales están en listas como la PBL de Spamhaus **por definición**: no porque
hayas hecho nada, sino porque son direcciones dinámicas de consumo. La mayoría de
los servidores grandes las consultan antes de aceptar la conexión.

**No controlas el PTR.**

Gmail, Outlook y Yahoo esperan que la IP que envía tenga un DNS inverso coherente
con el dominio del remitente. Es un requisito publicado, no una recomendación. El
PTR lo controla quien es dueño del bloque —tu ISP— y en una conexión doméstica dirá
algo como `dsl-189-203-205-16.tuisp.net.mx`.

Así que el relay no es un atajo: es la forma correcta de enviar desde una IP que
nunca va a tener reputación propia.

## Recibir es el muro de verdad

Aquí no hay relay que te salve, y es lo que más me costó aceptar.

Publico todos mis servicios con Cloudflare Tunnel: sin abrir puertos, con HTTPS
gratis, sin IP fija. Pensé que podía hacer lo mismo con el correo.

No se puede. **El túnel transporta HTTP.** SMTP no es HTTP.

Para recibir correo hacen falta dos cosas que no tengo: que los MX del dominio
apunten a mi IP, y que el puerto 25 **entrante** llegue a Postfix. Lo segundo exige
una regla en el router, y con el 25 bloqueado por el ISP ni eso alcanza.

Esa es la asimetría que define todo: **enviar se delega, recibir no.** Para enviar
basta un relay que acepte tu autenticación por el 587. Para recibir, alguien tiene
que poder abrir una conexión hacia ti, y en una conexión doméstica detrás de un
túnel HTTP eso no existe.

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

**Enviar y recibir son dos problemas distintos.** Yo los trataba como uno y por
eso descarté el servidor entero cuando vi el 25 bloqueado. Enviar se delega a un
relay; recibir exige que alguien pueda conectarse hacia ti.

**Mide antes de concluir, incluso sobre tu propia máquina.** Escribí la primera
versión de este artículo diciendo que mi servidor no podía enviar. Después fui a
leer su configuración y encontré un `relayhost` que yo mismo había puesto meses
antes y había olvidado. La memoria no es evidencia.

**Y el hallazgo que más me dolió.** Revisando los logs de ese servidor encontré
1,036 correos rechazados en tres días, todos desde mi servidor de aplicaciones:

```
NOQUEUE: reject: RCPT from unknown[10.10.20.100]: 454 4.7.1
  <mi@correo.com>: Relay access denied; from=<noreply@midominio.com>
```

Era **Grafana**, con su SMTP apuntando a este servidor, intentando mandarme
alertas. Postfix las rechazaba porque no acepta relay hacia dominios externos desde
ese cliente.

O sea: mi sistema de alertas llevaba días sin poder avisarme de nada. Y esto es lo
que cierra el círculo — en ese mismo periodo tuve dos servicios reiniciándose cada
30 segundos durante semanas sin que me enterara. **La pieza que debía avisarme
estaba rota por la misma razón que investigaba en este artículo.**

Si montas un servidor de correo interno para notificaciones, comprueba que los
mensajes **salgan**. Un log lleno de rechazos es un sistema de alertas que solo se
habla a sí mismo.
