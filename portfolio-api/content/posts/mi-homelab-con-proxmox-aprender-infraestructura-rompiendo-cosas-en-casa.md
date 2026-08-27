---
title: "Mi homelab con Proxmox: aprender infraestructura rompiendo cosas en casa"
slug: mi-homelab-con-proxmox-aprender-infraestructura-rompiendo-cosas-en-casa
category: tutorial
tags: ["Infraestructura", "Proxmox", "Homelab", "Virtualización", "Redes", "OPNsense"]
status: published
publishedAt: 2026-06-15
contentFormat: markdown
excerpt: "Dos nodos Proxmox, un firewall OPNsense y tres VLANs segmentadas en mi casa. Lo que aprendí montando (y rompiendo) infraestructura real."
metaTitle: "Homelab con Proxmox: cómo monté un cluster con VLANs y OPNsense"
metaDescription: "Mi homelab real con Proxmox VE: dos nodos en cluster, firewall OPNsense, tres VLANs segmentadas, VLAN trunking y storage compartido. Qué aprendí y qué haría distinto."
metaKeywords: ["homelab", "proxmox ve", "proxmox cluster", "opnsense", "vlan", "virtualización", "servidor casero", "laboratorio de redes"]
---

La mejor decisión que tomé para aprender infraestructura fue montar un homelab: máquinas donde puedo crear, romper y restaurar servidores sin miedo. Todo lo que sé de redes, virtualización y administración de sistemas pasó primero por ahí, y pasó porque rompí cosas.

Este es el estado actual del lab y, más importante, lo que cada pieza me enseñó.

## El hardware

Dos nodos, ambos con hardware de servidor de segunda mano — que es la forma realista de tener muchos núcleos y mucha RAM sin gastar una fortuna:

| | pve-main | core1 |
|---|---|---|
| CPU | 2× Xeon E5-2680 v4 (56 threads) | 1× Xeon E5-2650 v4 (24 threads) |
| RAM | 47 GB DDR4 | 23 GB DDR4 |
| Disco | NVMe 512 GB | SSD 256 GB + HDD 256 GB |
| Red | 2× Ethernet 1 Gbps | 1 Gbps + USB-Ethernet 100 Mbps |

Los dos corren Proxmox VE 9.1 unidos en cluster, lo que me deja administrar ambos desde un solo panel y mover VMs entre ellos.

**Primera lección de hardware:** ese adaptador USB-Ethernet de 100 Mbps en el segundo nodo fue un parche que terminó siendo un cuello de botella permanente. Cuando planifiques, cuenta las tarjetas de red que necesitas *antes* de comprar el equipo. Un adaptador USB no es un sustituto de una NIC.

## La red: tres VLANs, no una

Al principio tenía todo en una sola red plana. Funcionaba, y ahí estaba el problema: mi servidor de Minecraft podía hablar con mi base de datos de producción. No había ninguna razón para permitir eso.

Rediseñé la red en tres segmentos, cada uno con su propósito:

| VLAN | Rango | Para qué |
|---|---|---|
| 20 — LAN | `10.10.20.x` | Apps web, APIs, frontend |
| 30 — DATABASES | `10.10.30.x` | MongoDB y bases de datos |
| 40 — HOMELAB | `10.10.40.x` | Proyectos personales, Minecraft |

El razonamiento es contención de daños. Si comprometen algo en HOMELAB, el atacante llega a una red donde no hay nada valioso, y el firewall no le deja saltar a DATABASES.

Es el mismo principio que aplican en producción con subredes privadas, solo que a escala de casa. Y es la clase de cosa que puedes leer cien veces sin entenderla del todo hasta que la configuras y ves un paquete siendo rechazado.

## OPNsense: el firewall que enruta todo

Entre esas tres redes y el internet vive una VM con OPNsense. Es el router, el firewall y el que decide qué segmento puede hablar con cuál.

Que el firewall sea una VM dentro del mismo Proxmox que protege suena raro al principio, pero es una práctica común en homelabs y funciona bien. Lo que sí tienes que aceptar es la consecuencia: **si esa VM no arranca, te quedas sin red.** Me pasó. La solución fue aprender a entrar por la consola de Proxmox en lugar de por SSH, porque SSH pasaba justamente por el firewall caído.

## VLAN trunking: tres redes por un cable

El segundo nodo está conectado al primero con un solo cable físico, pero sus VMs necesitan estar en las mismas tres redes. La solución es VLAN trunking: etiquetar el tráfico con el ID de VLAN y pasar los tres segmentos por el mismo enlace.

Así, la VM de MongoDB puede vivir físicamente en el segundo nodo y seguir estando en la red DATABASES como si estuviera en el primero.

Este fue el concepto que más me costó y el que más me sirvió después. Es literalmente lo que hacen los switches administrables en cualquier empresa, y entenderlo en tu propia casa con tus propios cables lo vuelve concreto.

## Snapshots: la función que más uso

Antes de cada experimento, snapshot. Es la razón por la que puedo permitirme romper cosas.

```bash
qm snapshot 100 antes-de-actualizar --description "Pre upgrade Node 22"
```

Si algo sale mal, `qm rollback 100 antes-de-actualizar` y estás como antes en segundos. La mitad de mis experimentos terminan mal, y esa es exactamente la idea: un lab donde no puedes romper nada no es un lab, es producción.

**Advertencia que aprendí por las malas:** los snapshots no son backups. Viven en el mismo disco que la VM. Si muere el disco, se van los dos. Para respaldo real necesitas copias fuera de la máquina.

## Acceso remoto: dos herramientas, dos propósitos

Tardé en entender que no son alternativas, son cosas distintas:

- **Tailscale** para mí. Es una VPN que me deja entrar a mis redes privadas desde cualquier lugar como si estuviera en casa. La uso para SSH, para el panel de Proxmox y para depurar.
- **Cloudflare Tunnel** para el público. Publica servicios HTTP con dominio propio y HTTPS sin abrir puertos.

La regla que uso: si soy yo administrando, Tailscale. Si es un usuario visitando una web, Cloudflare Tunnel. Cómo funciona la segunda la explico a detalle en [publicar tu homelab sin abrir puertos](/blog/cloudflare-tunnel-sin-abrir-puertos).

## Qué haría distinto si empezara hoy

**Documenta mientras construyes, no después.** Reconstruir de memoria por qué configuraste una regla de firewall hace tres meses es horrible. Ahora todo cambio queda en un archivo markdown con fecha.

**Direcciona la red antes de crear la primera VM.** Reasignar IPs con servicios ya corriendo es mucho más trabajo que planearlas en una tabla desde el inicio.

**No virtualices el almacenamiento crítico al principio.** Añade complejidad justo donde menos quieres depurar.

**Empieza más pequeño de lo que crees.** No necesitas dos Xeon para aprender. Cualquier PC vieja con 16 GB de RAM corre Proxmox y tres o cuatro VMs, que es más de lo que necesitas para entender los conceptos.

## Por qué vale la pena

Leer sobre VLANs o segmentación de red es una cosa; diseñar tu propia red y depurar a las 2 AM por qué un cliente no resuelve DNS es otra completamente distinta. El homelab convierte los temas de clase en problemas reales con consecuencias reales — aunque las consecuencias solo sean que se cayó tu servidor de Minecraft.

Y hay un beneficio que no esperaba: cuando en una entrevista te preguntan por virtualización, redes o deploy, tienes historias concretas en vez de definiciones memorizadas. Eso se nota.

Instala Proxmox en esa PC que tienes guardada, crea tu primera VM y rompe algo. Ahí empieza.
