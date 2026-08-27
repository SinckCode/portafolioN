---
title: "Cloudflare Tunnel: publicar tu homelab en internet sin abrir un solo puerto"
slug: cloudflare-tunnel-sin-abrir-puertos
category: infraestructura
tags: ["Cloudflare", "Homelab", "Infraestructura", "Seguridad", "Self-hosting"]
status: published
publishedAt: 2026-08-27
contentFormat: markdown
excerpt: "Cómo expongo las apps de mi servidor casero con dominio propio y HTTPS sin tocar el router, sin IP fija y sin abrir puertos al mundo."
metaTitle: "Cloudflare Tunnel: expón tu homelab sin abrir puertos (guía real)"
metaDescription: "Guía práctica de Cloudflare Tunnel: instalar cloudflared, escribir el ingress, correrlo como servicio y publicar varias apps con HTTPS sin abrir puertos ni tener IP fija."
metaKeywords: ["cloudflare tunnel", "cloudflared", "homelab", "sin abrir puertos", "port forwarding alternativa", "self hosting", "proxmox", "https gratis"]
---

Durante mucho tiempo la única forma que conocía de publicar algo desde casa era abrir un puerto en el router. Funciona, sí, pero significa exponer un servicio directamente a internet, depender de que tu ISP no te cambie la IP y descubrir que muchos ISP en México bloquean el puerto 80 y el 443 de todos modos.

Hoy tengo seis dominios apuntando a servicios que corren en mi servidor de casa, todos con HTTPS válido, y **no hay un solo puerto abierto en mi router**. Uso Cloudflare Tunnel. Esto es cómo funciona y cómo lo configuré.

## El problema con abrir puertos

Cuando haces port forwarding le estás diciendo a tu router: "todo lo que llegue al puerto 443 mándalo a la máquina 192.168.1.50". A partir de ahí:

- Tu IP pública queda expuesta y cualquiera puede escanearla. En cuestión de horas vas a tener bots probando `/wp-admin` y credenciales SSH.
- Necesitas IP fija, o montar DDNS y rezar para que actualice a tiempo.
- Tienes que gestionar los certificados TLS tú mismo (Let's Encrypt, renovaciones, un reverse proxy).
- Si tu ISP usa CGNAT, simplemente no puedes. No tienes una IP pública propia que reenviar.

## Qué hace Cloudflare Tunnel diferente

En lugar de que internet entre a tu red, un demonio dentro de tu red **sale** hacia Cloudflare y mantiene la conexión abierta. Cloudflare recibe las peticiones del público y las empuja por ese túnel ya establecido.

```
Usuario → tudominio.com → Cloudflare → (túnel saliente) → tu VM → localhost:4000
```

La diferencia es toda la seguridad del modelo: tu firewall no necesita ninguna regla de entrada. Desde afuera, tu red no tiene nada escuchando. El túnel se estableció desde adentro.

Como beneficio secundario, el HTTPS lo termina Cloudflare. No gestionas certificados nunca más.

## Instalación

En la VM que corre tus servicios (yo uso Ubuntu Server sobre Proxmox):

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
cloudflared --version
```

Autenticas contra tu cuenta. Esto abre un navegador para que elijas la zona (el dominio) que vas a usar:

```bash
cloudflared tunnel login
```

Te deja un `cert.pem` en `~/.cloudflared/`. Ese certificado es el que autoriza a crear túneles en tu cuenta — trátalo como una credencial.

Creas el túnel:

```bash
cloudflared tunnel create mi-tunel
```

Esto genera un UUID y un archivo de credenciales `~/.cloudflared/<UUID>.json`. Anota el UUID, lo necesitas para el config.

## El archivo de ingress

Aquí está lo que hace útil a Cloudflare Tunnel: **un solo túnel puede servir muchos hostnames**, cada uno apuntando a un puerto local distinto. Este es el `~/.cloudflared/config.yml` de mi VM de aplicaciones:

```yaml
tunnel: <UUID-de-tu-tunel>
credentials-file: /home/onesto/.cloudflared/<UUID-de-tu-tunel>.json

ingress:
  - hostname: api.midominio.com
    service: http://localhost:4000

  - hostname: deploy.midominio.com
    service: http://localhost:5000

  - hostname: grafana.midominio.com
    service: http://localhost:3003

  - service: http_status:404
```

Tres cosas que importan:

**El orden es significativo.** Cloudflare evalúa las reglas de arriba hacia abajo y usa la primera que coincide. Una regla genérica arriba se come a las de abajo.

**La última regla es obligatoria.** Ese `http_status:404` es el catch-all. Si lo omites, `cloudflared` se niega a arrancar. Es su forma de obligarte a decidir qué pasa con lo que no coincide.

**El servicio apunta a localhost.** Los puertos 4000, 5000 y 3003 nunca se exponen. Solo son alcanzables desde dentro de la VM, y `cloudflared` es quien los alcanza.

## Conectar el DNS

Cada hostname necesita un registro CNAME apuntando al túnel. `cloudflared` lo crea por ti:

```bash
cloudflared tunnel route dns mi-tunel api.midominio.com
cloudflared tunnel route dns mi-tunel deploy.midominio.com
```

En el dashboard de Cloudflare vas a ver un CNAME hacia `<UUID>.cfargotunnel.com` marcado como proxied (nube naranja). Ese registro es el que hace la magia.

## Correrlo como servicio

Probar en primer plano está bien para verificar:

```bash
cloudflared tunnel run mi-tunel
```

Pero para producción lo quieres como servicio de systemd, que arranca solo al reiniciar la VM:

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
systemctl is-active cloudflared
```

Un detalle que me costó una tarde: `cloudflared service install` copia la configuración a `/etc/cloudflared/`. Si después editas `~/.cloudflared/config.yml` y reinicias el servicio, **tus cambios no se aplican** porque el servicio está leyendo la otra copia. Verifica siempre qué archivo está usando de verdad:

```bash
systemctl cat cloudflared | grep ExecStart
```

## Varios túneles, varias VMs

Cuando tienes servicios repartidos en distintas máquinas, la opción limpia es un túnel por VM en vez de intentar enrutar todo desde una sola. En mi caso tengo túneles separados en la VM de aplicaciones, en la de proyectos y en la de otro dominio, cada uno con su propio `config.yml`.

Ventaja: si una VM se cae, solo caen sus hostnames. Y cada túnel se reinicia de forma independiente sin tocar los demás.

## Lo que Cloudflare Tunnel no resuelve

Vale la pena ser claro sobre los límites:

**No es una VPN.** Cloudflare Tunnel publica servicios HTTP al mundo. Si lo que quieres es entrar tú a tu red para administrar, SSH o depurar, eso es otra herramienta — yo uso Tailscale para eso, y las dos conviven sin problema.

**Cloudflare ve tu tráfico.** Termina el TLS, así que el contenido pasa en claro por su infraestructura. Para un portafolio o un blog es irrelevante; para datos sensibles es una decisión que tienes que tomar conscientemente.

**Sigues necesitando autenticación.** El túnel te protege de escaneos de puertos, no de que alguien entre a tu panel de admin. Un servicio expuesto por túnel es un servicio expuesto. Cloudflare Access ayuda si necesitas poner una capa de login delante.

**Dependes de un tercero.** Si Cloudflare tiene una caída, tus servicios no son alcanzables aunque tu servidor esté perfectamente vivo.

## ¿Vale la pena?

Para un homelab, sin dudarlo. Eliminé el port forwarding por completo, dejé de preocuparme por la IP dinámica, obtuve HTTPS gratis y automático, y puedo mover un servicio de una VM a otra cambiando una línea de YAML en vez de reconfigurar el router.

Si estás montando tu propio servidor y llegaste a la parte de "¿y ahora cómo lo hago público?", esta es la respuesta que hubiera querido encontrar antes.

Si quieres ver el contexto completo — las VLANs, el firewall y cómo está organizado todo —, lo cuento en [mi homelab con Proxmox](/blog/mi-homelab-con-proxmox-aprender-infraestructura-rompiendo-cosas-en-casa).
