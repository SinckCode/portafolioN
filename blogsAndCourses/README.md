# blogsAndCourses — borradores antes de publicar

Zona de trabajo. Nada de aquí está en vivo: es donde se escribe y se revisa antes
de mover al pipeline real.

```
blogsAndCourses/
├─ Blogs/     Artículos listos para publicar en angelonesto.com/blog
└─ Courses/   Plantillas y guiones de cursos, antes de grabar nada
```

## Cómo publicar un artículo

Los artículos de `Blogs/` ya traen el frontmatter exacto que espera el pipeline,
así que publicar es mecánico:

1. Abrir el `.md`, revisarlo y ajustar lo que suene ajeno.
2. Cambiar `status: draft` a `status: published` y poner la fecha real en
   `publishedAt`.
3. Copiarlo a `portfolio-api/content/posts/`.
4. Commit y push a `main`.

El CI despliega y el paso `sync-posts` del deploy publica el contenido a Mongo.
Las páginas usan ISR con `revalidate: 300`, así que tarda hasta 5 minutos en
verse.

Para revisar antes de escribir nada a la base:

```bash
cd portfolio-api && npm run posts:sync:dry
```

### Reglas que el pipeline impone

- **`category` tiene que ser un slug que exista en la base**, o el sync salta el
  artículo sin avisar mucho. Los válidos hoy: `desarrollo-web`,
  `aplicaciones-moviles`, `iot`, `desktop`, `infraestructura`, `tutorial`,
  `reflexion`, `devops`.
- `slug` es la llave. Si lo cambias después de publicar, se crea un artículo
  nuevo y el viejo se queda huérfano con sus visitas.
- El sync **nunca borra** y preserva `views`, `likes` y `likesBy`.
- Desde el 2026-09-30 el sync es idempotente: si el contenido no cambió, no
  escribe. Eso mantiene honesto el `lastmod` del sitemap.

## Calendario sugerido

Uno por semana rinde más que diez de golpe: Google premia la constancia y cada
artículo nuevo le da una razón para volver a rastrear el sitio. Las fechas en los
borradores están escalonadas con esa idea, pero son sugerencias.

## Criterio de los artículos

Todos salen de cosas que pasaron de verdad, con números reales del servidor. No
hay tutoriales genéricos de "cómo instalar X": eso ya está escrito mil veces y no
posiciona. Lo que nadie más tiene es el detalle específico —el disco al 93%, los
24,000 reinicios, los tres bugs apilados— y es justo lo que la gente busca cuando
se le rompe lo mismo.

## Ideas pendientes de escribir

Material que existe pero todavía no tiene artículo:

- **Multi-tenancy con RLS de Postgres** — el `org_id` y `withOrg` de Custodia.
- **El favicon que Google ignoraba** — un SVG no basta: Googlebot-Image lo
  rasteriza y cae al globo genérico. Hizo falta un `.ico` multi-resolución real.
- **Modelo GLB de 76 MB a partículas WebGL** — la historia de performance del
  portafolio 3D.
- **Auto-refresh de JWT** — la causa raíz de los chats que desaparecían.
- **Socket.IO con el patrón de Rocket.Chat** — mensajería que no pierde mensajes.
- **Sistema de Incidentes Urbanos con Leaflet** — geo-referenciación, del
  semestre 7.
- **Minería de datos con Python** — las prácticas del semestre, si dan para algo
  publicable.
