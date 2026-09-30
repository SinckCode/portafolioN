# Next.js + NestJS en producción: del localhost al dominio propio

> Estado: esqueleto. Falta guion detallado por lección.

## Metadatos

```yaml
title: "Next.js + NestJS en producción: del localhost al dominio propio"
slug: nextjs-nestjs-en-produccion
description: "El curso que falta después de los tutoriales: autenticación que no expulsa a tus usuarios, mensajería que no pierde mensajes, y todo desplegado en un servidor real con su CI/CD."
category: desarrollo-web-curso
level: advanced
duration: "6h 30m"
price: 0
status: draft
tags: ["Next.js", "NestJS", "MongoDB", "JWT", "Socket.IO", "TypeScript", "Producción"]
```

### requirements

- React y TypeScript a nivel de construir componentes con estado
- Haber consumido una API REST desde el frontend
- Nociones de base de datos: colecciones, documentos, consultas

### whatYouLearn

- Estructurarás un monorepo con frontend y backend que comparten contrato de tipos
- Implementarás JWT con refresh que no expulse al usuario a mitad de sesión
- Construirás mensajería en tiempo real que sobrevive a una reconexión
- Renderizarás en servidor de forma que los crawlers reciban contenido real
- Desplegarás con un pipeline que publica también tu contenido versionado

---

## Por qué este curso

Los tutoriales de full stack terminan en `npm run dev`. Este empieza ahí y llega
hasta un sitio en producción con dominio propio, y sobre todo cubre las cosas que
solo aparecen cuando hay usuarios de verdad: el token que expira a mitad de
sesión, el mensaje que se pierde al reconectar, el contenido que se ve en
desarrollo y llega vacío al buscador.

---

## Estructura

### Módulo 1 — Arquitectura y monorepo (45m)

| # | Lección | Tipo | Min | Gratis |
|---|---|---|---|:---:|
| 1 | Qué vamos a construir y por qué así | video | 8 | ✅ |
| 2 | Monorepo: frontend y backend en un repositorio | video | 10 | ✅ |
| 3 | Un solo contrato de tipos para los dos lados | video | 12 | ✅ |
| 4 | Variables de entorno sin sorpresas | video | 9 | |
| 5 | Quiz | quiz | 4 | |

> La 1.3 previene la clase de bug más cara: el backend renombra un campo, el
> frontend sigue leyendo el viejo, y nadie se entera hasta producción.

### Módulo 2 — La API con NestJS (1h 10m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Módulos, controladores y servicios | video | 11 |
| 2 | Schemas de Mongoose y DTOs: dos contratos que deben coincidir | video | 12 |
| 3 | Validación con class-validator | video | 10 |
| 4 | **Cuando el schema, el DTO y el panel admin divergen** | video | 12 |
| 5 | Envelope de respuesta consistente | video | 10 |
| 6 | Manejo de errores y logging estructurado | video | 11 |
| 7 | Quiz | quiz | 4 |

> La 2.4 es un caso real: tres definiciones del mismo objeto que se
> desincronizaron, y el síntoma fue un campo que el panel guardaba y la API
> descartaba en silencio.

### Módulo 3 — Autenticación que no molesta (1h)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | JWT: qué es y qué no resuelve | video | 10 |
| 2 | Access y refresh: por qué dos tokens | video | 11 |
| 3 | **El bug del refresh: guardar el token viejo tras renovarlo** | video | 12 |
| 4 | OAuth con Google y GitHub | video | 12 |
| 5 | Proteger rutas en el frontend sin parpadeos | video | 11 |
| 6 | Quiz | quiz | 4 |

> **La 3.3 vale el módulo.** El auto-refresh funcionaba y el contexto seguía
> guardando el token expirado, así que la sesión moría igual pero de forma
> intermitente e imposible de reproducir a voluntad. Es la clase de bug que
> enseña a depurar estado compartido.

### Módulo 4 — Tiempo real (55m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | WebSockets y Socket.IO en NestJS | video | 11 |
| 2 | Salas, eventos y autenticación del socket | video | 12 |
| 3 | **Reconexión: el patrón que usa Rocket.Chat** | video | 12 |
| 4 | Confirmación de entrega estilo WhatsApp | video | 12 |
| 5 | Quiz | quiz | 4 |

> La 4.3 es la diferencia entre un chat de demo y uno usable: qué pasa con los
> mensajes emitidos mientras el socket estaba caído.

### Módulo 5 — Frontend que los buscadores entienden (55m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Server y client components: dónde va cada cosa | video | 12 |
| 2 | **El bailout a cliente que vacía tu HTML** | video | 11 |
| 3 | Rutas interceptadas: modal y página con el mismo componente | video | 12 |
| 4 | Filtros que viven en la URL | video | 11 |
| 5 | ISR y cuándo se revalida de verdad | video | 9 |

> La 5.3 es de las cosas que más impresionan y menos gente conoce: abrir un
> detalle en modal navegando, y que recargar o compartir el link dé la página
> completa, sin duplicar el componente.

### Módulo 6 — A producción (1h 5m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Construir para producción: standalone y PM2 | video | 11 |
| 2 | Variables de entorno en el servidor | video | 9 |
| 3 | CI/CD: del push al sitio actualizado | video | 12 |
| 4 | **Contenido versionado en git, publicado en el deploy** | video | 12 |
| 5 | Health checks y verificación post-deploy | video | 10 |
| 6 | El fallback que esconde que algo está roto | video | 11 |

> La 6.6 cierra con la lección más incómoda del curso: un fallback bien intencionado
> puede ocultar durante meses que tu contenido real nunca llegó a producción.

### Módulo 7 — Cierre (20m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Lo que haría distinto | video | 12 |
| 2 | Por dónde seguir | video | 8 |

---

## Notas de producción

- Es el curso más largo y el más vendible: cubre el stack completo con
  problemas reales.
- Repositorio con tag por módulo, imprescindible aquí.
- Varias lecciones (2.4, 3.3, 5.2, 6.4, 6.6) salen de bugs documentados en el
  blog. Escribir el artículo primero y grabar después funciona bien: el artículo
  ordena el guion y capta tráfico hacia el curso.
