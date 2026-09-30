# Homelab desde cero: tu propio servidor en casa

> Estado: esqueleto. Falta guion detallado por lección.

## Metadatos

```yaml
title: "Homelab desde cero: tu propio servidor en casa"
slug: homelab-desde-cero
description: "Monta un servidor casero de verdad: virtualización con Proxmox, red segmentada con un firewall propio, y tus apps publicadas en internet con dominio y HTTPS sin abrir un solo puerto."
category: devops-curso
level: beginner
duration: "5h 20m"
price: 0
status: draft
tags: ["Homelab", "Proxmox", "Redes", "Cloudflare Tunnel", "Linux", "Self-hosting"]
```

### requirements

- Una computadora que puedas dedicar al servidor (una laptop vieja sirve; 8 GB de
  RAM es un buen punto de partida)
- Saber moverte en una terminal de Linux: `cd`, `ls`, editar un archivo
- Un dominio propio (cuestan menos de $200 MXN al año)

### whatYouLearn

- Instalarás Proxmox y crearás máquinas virtuales a partir de plantillas
- Segmentarás tu red en subredes por función, con un firewall virtual
- Publicarás tus apps con dominio y HTTPS sin abrir puertos en el router
- Diagnosticarás un problema de red distinguiendo un fallo de ruteo de uno de
  firewall
- Dejarás todo arrancando solo después de un corte de luz

---

## Por qué este curso

El mercado está lleno de tutoriales de "instala Proxmox". Lo que no encuentras es
qué pasa **después**: cómo organizas las VMs, por qué segmentar la red, qué se
rompe cuando se va la luz y en qué orden tiene que volver.

Este curso es el recorrido completo con los errores incluidos.

---

## Estructura

### Módulo 1 — Qué es un homelab y qué hardware necesitas (35m)

| # | Lección | Tipo | Min | Gratis |
|---|---|---|---|:---:|
| 1 | Qué puedes hacer con un servidor en casa | video | 7 | ✅ |
| 2 | Hardware: lo que importa y lo que no | video | 10 | ✅ |
| 3 | Virtualización: por qué no instalar todo en una máquina | video | 8 | ✅ |
| 4 | El plan: qué vamos a construir | video | 10 | |

### Módulo 2 — Proxmox (55m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Instalación paso a paso | video | 12 |
| 2 | Recorrido por la interfaz | video | 8 |
| 3 | Tu primera VM | video | 10 |
| 4 | Plantillas: dejar de instalar Ubuntu diez veces | video | 11 |
| 5 | Snapshots y backups | video | 9 |
| 6 | Quiz del módulo | quiz | 5 |

> **Lección clave: plantillas.** Aquí es donde el alumno pasa de "probé Proxmox" a
> "puedo trabajar con Proxmox". Crear una VM en 30 segundos cambia por completo la
> disposición a experimentar.

### Módulo 3 — Red: segmentar en serio (1h 10m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Por qué una sola red plana es mala idea | video | 9 |
| 2 | Bridges y VLANs en Proxmox | video | 12 |
| 3 | Instalar un firewall virtual | video | 12 |
| 4 | Una subred por función | video | 11 |
| 5 | Reglas entre segmentos | video | 12 |
| 6 | **Diagnosticar: el ping pasa y el puerto no** | video | 12 |
| 7 | Quiz | quiz | 4 |

> **La 3.6 es la joya del curso.** Caso real: un servicio que no conecta a su base
> de datos, ping respondiendo en 2.5 ms, y la diferencia entre *timeout* y
> *connection refused* como la pista que resuelve el caso. Esto no está en ningún
> tutorial y es lo que más se usa en la vida real.

### Módulo 4 — Publicar en internet sin abrir puertos (50m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Por qué el port forwarding es mala idea hoy | video | 8 |
| 2 | Cómo funciona un túnel saliente | video | 9 |
| 3 | Instalar y autenticar cloudflared | video | 10 |
| 4 | El archivo de ingress: varios servicios, un túnel | video | 11 |
| 5 | Correrlo como servicio y probar un reinicio | video | 8 |
| 6 | Quiz | quiz | 4 |

### Módulo 5 — Operar sin sufrir (1h 5m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Apps de Node con PM2 | video | 11 |
| 2 | Docker para los servicios auxiliares | video | 12 |
| 3 | **Logs: el contenedor que se comió 10 GB** | video | 12 |
| 4 | Rotación: logrotate y pm2-logrotate | video | 10 |
| 5 | Orden de arranque tras un corte de luz | video | 9 |
| 6 | Qué revisar una vez al mes | text | 6 |
| 7 | Quiz final | quiz | 5 |

### Módulo 6 — Cierre (25m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Errores que cometí y te vas a ahorrar | video | 12 |
| 2 | Hacia dónde seguir | video | 8 |
| 3 | Recursos y checklist descargable | text | 5 |

---

## Notas de producción

- **El curso necesita una maqueta reproducible.** Grabar contra el homelab real
  significa enseñar IPs, nombres y servicios personales. Montar un cluster de
  práctica con nombres genéricos, aunque cueste una tarde.
- Revisar el prompt de la terminal antes de grabar: no debe mostrar hostname real.
- Las lecciones 3.6 y 5.3 son casos reales documentados en el blog. Los artículos
  sirven de guion base y además funcionan como captación hacia el curso.
