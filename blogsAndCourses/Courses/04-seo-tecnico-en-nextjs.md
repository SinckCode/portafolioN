# SEO técnico en Next.js: que Google sí indexe tu sitio

> Estado: esqueleto. Falta guion detallado por lección.

## Metadatos

```yaml
title: "SEO técnico en Next.js: que Google sí indexe tu sitio"
slug: seo-tecnico-en-nextjs
description: "Tu sitio está en línea, Search Console dice 'Descubierta: actualmente sin indexar' y no sabes por qué. Este curso recorre las causas técnicas reales, con un caso documentado de principio a fin."
category: desarrollo-web-curso
level: intermediate
duration: "2h 50m"
price: 0
status: draft
tags: ["SEO", "Next.js", "Search Console", "Sitemap", "Canonical", "Core Web Vitals"]
```

### requirements

- Un sitio en Next.js con App Router, publicado
- Acceso a Google Search Console del dominio
- Nociones de qué es un `<head>` y una etiqueta meta

### whatYouLearn

- Diagnosticarás por qué una página concreta no se indexa, con evidencia
- Emitirás canonical correctos, incluso en rutas que son componentes de cliente
- Generarás un sitemap cuyo `lastmod` Google se crea
- Comprobarás lo que Googlebot recibe de verdad, no lo que tú ves
- Sabrás cuándo pedir reindexación y cuándo es tirar la cuota

---

## Por qué este curso

Casi todo el contenido de SEO es de marketing: palabras clave, backlinks,
extensión ideal. Este es de ingeniería: qué etiquetas emite tu framework, qué
recibe el crawler y por qué decide no indexarte.

El hilo conductor es un caso real: un sitio con 28 URLs y **una** indexada, y el
camino hasta encontrar las dos causas.

---

## Estructura

### Módulo 1 — Cómo funciona de verdad la indexación (35m)

| # | Lección | Tipo | Min | Gratis |
|---|---|---|---|:---:|
| 1 | Rastrear, indexar y posicionar son tres cosas distintas | video | 9 | ✅ |
| 2 | Leer el informe de páginas de Search Console | video | 10 | ✅ |
| 3 | Qué significa "Descubierta: actualmente sin indexar" | video | 8 | ✅ |
| 4 | Presupuesto de rastreo y por qué te afecta si eres pequeño | video | 8 | |

### Módulo 2 — Ver lo que ve el crawler (40m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | `curl` con user-agent de Googlebot | video | 9 |
| 2 | **El bailout a cliente: HTML vacío sin ningún error** | video | 12 |
| 3 | `opacity: 0` en el HTML del servidor y las animaciones | video | 10 |
| 4 | Inspección de URLs: HTML renderizado contra HTML crudo | video | 9 |

> **La 2.2 es el gancho del curso.** Una página que se ve perfecta en el navegador
> y llega vacía al crawler. Se muestra el `curl` lado a lado con la captura.

### Módulo 3 — Canonical (45m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Qué resuelve y qué pasa sin él | video | 9 |
| 2 | `metadataBase` **no** es un canonical | video | 8 |
| 3 | `alternates` en páginas de servidor | video | 9 |
| 4 | **`'use client'` bloquea `metadata`: el layout que lo rescata** | video | 12 |
| 5 | Auditar todas tus rutas de una pasada | video | 7 |

> La 3.4 resuelve una confusión frecuentísima. Un componente de cliente no puede
> exportar `metadata`, y la respuesta no es quitar el `'use client'`: es un layout
> de servidor que solo devuelve `children` y aporta la metadata.

### Módulo 4 — Sitemap honesto (35m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | `sitemap.ts` en el App Router | video | 9 |
| 2 | **`lastmod` que miente: cómo pierdes la señal completa** | video | 11 |
| 3 | Fechas reales desde tu base de datos | video | 9 |
| 4 | Coherencia entre `<loc>` y canonical | video | 6 |

> La 4.2 tiene un giro que sorprende: el `lastmod` mentía porque el *pipeline de
> despliegue* hacía `$set` idénticos que movían `updatedAt`. La causa estaba a dos
> capas de distancia del síntoma.

### Módulo 5 — Lo demás que sí importa (30m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | `robots.txt`: qué bloquear y qué no | video | 8 |
| 2 | **El favicon: por qué un SVG no basta para Google** | video | 9 |
| 3 | Datos estructurados que valen la pena | video | 8 |
| 4 | Quiz final | quiz | 5 |

> La 5.2 es un caso propio: Googlebot-Image rasteriza el favicon para los
> resultados y con un SVG solo cae al globo genérico. Hizo falta un `.ico`
> multi-resolución real.

### Módulo 6 — Método (25m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Cuándo pedir reindexación (y cuándo no sirve) | video | 9 |
| 2 | Qué esperar y en cuánto tiempo | video | 8 |
| 3 | Checklist de auditoría | text | 8 |

> La 6.1 cierra el arco: en el caso real se pidió reindexación **antes** de
> arreglar canonical y `lastmod`, y no sirvió de nada. El orden importa.

---

## Notas de producción

- Curso corto a propósito. El valor está en la densidad, no en la duración.
- Cada lección de diagnóstico necesita un antes y un después en pantalla.
- Este es el curso más fácil de convertir desde el blog: los artículos sobre
  indexación y contenido cubren buena parte del guion.
