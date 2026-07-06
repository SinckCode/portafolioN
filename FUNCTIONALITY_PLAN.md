# Plan de Funcionalidad - Portfolio + Blog + Cursos + Admin

## Arquitectura General

```
                        ┌─────────────────────────────┐
                        │      Cloudflare Tunnel       │
                        │   angelonesto.com (dominio)  │
                        └──────────┬──────────────────┘
                                   │
                    ┌──────────────┼──────────────────┐
                    │              │                   │
              ┌─────▼─────┐ ┌─────▼──────┐  ┌────────▼────────┐
              │  Frontend  │ │  Backend   │  │  Admin Panel     │
              │  React 19  │ │  NestJS    │  │  React (SPA)     │
              │  SSR/SSG   │ │  REST API  │  │  /admin          │
              │  Next.js   │ │  JWT Auth  │  │  Dashboard       │
              └─────┬──────┘ └─────┬──────┘  └────────┬────────┘
                    │              │                   │
                    └──────────────┼───────────────────┘
                                   │
                          ┌────────▼────────┐
                          │   MongoDB 7     │
                          │  VM 101 core1   │
                          │ 10.10.30.101    │
                          │    :27017       │
                          └─────────────────┘
```

### Stack Tecnologico

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| **Frontend publico** | Next.js 15 (React 19) | SSR/SSG para SEO, ISR para contenido dinamico |
| **Backend API** | NestJS + TypeScript | Modular, escalable, decoradores, guards, pipes |
| **Base de datos** | MongoDB 7 (VM 101) | Ya disponible en Proxmox, flexible para blog/cursos |
| **ODM** | Mongoose | Schemas tipados, validacion, populate |
| **Autenticacion** | JWT (access + refresh tokens) | Stateless, escalable |
| **Almacenamiento** | Cloudflare R2 o MinIO (self-hosted) | Imagenes, videos, archivos de cursos |
| **Cache** | Redis (VM nueva o contenedor) | Sesiones, cache de queries frecuentes |
| **Email** | Nodemailer + servidor mail (VM 102) | Email transaccional propio |
| **Busqueda** | MongoDB Atlas Search o Meilisearch | Busqueda full-text para blog y cursos |
| **Deploy** | Cloudflare Tunnel → VM 100 o VM nueva | Ya configurado para el dominio |

### Infraestructura en Proxmox

| Recurso | Ubicacion | Detalles |
|---------|-----------|----------|
| **MongoDB** | VM 101 (core1) - 10.10.30.101:27017 | Ya existente, auth habilitada |
| **Backend NestJS** | VM 100 o nueva VM en vmbr1 | PM2 + Nginx reverse proxy |
| **Frontend Next.js** | VM 100 o nueva VM en vmbr1 | PM2 + Nginx, SSR en puerto dedicado |
| **Redis** | Contenedor en VM 103 o nueva VM | Cache + rate limiting |
| **Almacenamiento** | TrueNAS (192.168.100.11) o Cloudflare R2 | Assets estaticos |
| **Tunnel** | Cloudflare → dominio angelonesto.com | SSL automatico, proteccion DDoS |

---

## Modelos de Base de Datos (MongoDB)

### User

```javascript
{
  _id: ObjectId,
  email: String,              // unico, indexado
  passwordHash: String,       // bcrypt
  name: String,
  avatar: String,             // URL imagen
  role: "admin" | "editor" | "subscriber",
  isVerified: Boolean,
  refreshTokens: [String],    // tokens activos
  bio: String,                // solo para admin/editor
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### BlogPost

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,               // unico, indexado, generado desde titulo
  excerpt: String,            // resumen para SEO y cards (max 160 chars)
  content: String,            // markdown o HTML (editor WYSIWYG)
  coverImage: String,         // URL imagen de portada
  author: ObjectId,           // ref → User
  category: ObjectId,         // ref → Category
  tags: [String],             // indexado para busqueda
  status: "draft" | "published" | "archived",
  publishedAt: Date,
  readingTime: Number,        // minutos estimados
  views: Number,              // contador de visitas
  likes: Number,
  seo: {
    metaTitle: String,        // max 60 chars
    metaDescription: String,  // max 160 chars
    ogImage: String,
    canonicalUrl: String
  },
  relatedPosts: [ObjectId],   // ref → BlogPost
  createdAt: Date,
  updatedAt: Date
}
```

### Category

```javascript
{
  _id: ObjectId,
  name: String,               // "DevOps", "Frontend", "Backend", "IoT"
  slug: String,               // unico
  description: String,
  color: String,              // color hex para UI
  icon: String,               // emoji o icono
  postCount: Number,          // denormalizado para performance
  createdAt: Date
}
```

### Course

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,               // unico, indexado
  description: String,        // descripcion larga
  excerpt: String,            // resumen corto para cards
  coverImage: String,
  instructor: ObjectId,       // ref → User (admin)
  category: ObjectId,         // ref → Category
  tags: [String],
  level: "beginner" | "intermediate" | "advanced",
  language: "es" | "en",
  status: "draft" | "published" | "coming_soon" | "archived",
  price: {
    type: "free" | "paid",
    amount: Number,           // 0 si es gratis
    currency: String          // "MXN", "USD"
  },
  modules: [{
    _id: ObjectId,
    title: String,
    order: Number,
    lessons: [{
      _id: ObjectId,
      title: String,
      slug: String,
      type: "video" | "text" | "quiz" | "exercise",
      content: String,        // markdown para texto
      videoUrl: String,       // URL del video
      duration: Number,       // segundos
      isFree: Boolean,        // leccion gratuita de preview
      resources: [{
        name: String,
        url: String,
        type: String          // "pdf", "zip", "link"
      }],
      order: Number
    }]
  }],
  totalDuration: Number,      // minutos totales (calculado)
  totalLessons: Number,       // total lecciones (calculado)
  enrollmentCount: Number,    // denormalizado
  rating: {
    average: Number,
    count: Number
  },
  requirements: [String],     // prerequisitos
  whatYouLearn: [String],     // objetivos de aprendizaje
  seo: {
    metaTitle: String,
    metaDescription: String,
    ogImage: String
  },
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // ref → User
  course: ObjectId,           // ref → Course
  progress: [{
    lesson: ObjectId,
    completed: Boolean,
    completedAt: Date,
    lastPosition: Number      // segundos del video donde se quedo
  }],
  completedModules: [ObjectId],
  overallProgress: Number,    // porcentaje 0-100
  enrolledAt: Date,
  completedAt: Date,          // null si no terminado
  certificate: {
    issued: Boolean,
    issuedAt: Date,
    certificateId: String     // UUID unico para verificacion
  }
}
```

### Project (migracion desde projects.js)

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,
  description: String,        // corta, para cards
  details: String,            // larga, markdown
  technologies: [String],
  type: String,               // "Fullstack", "Web", "IoT", "Desktop"
  date: Date,
  featured: Boolean,          // destacado en inicio
  order: Number,              // orden manual
  status: "published" | "draft" | "archived",
  repos: {
    frontend: String,
    backend: String,
    hardware: String,
    deploy: String
  },
  demo: String,
  demos: [String],
  media: {
    videos: [String],
    images: [String],
    thumbnail: String         // imagen principal
  },
  api: Map,                   // endpoints publicos
  credentials: {              // credenciales de demo
    email: String,
    password: String
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    ogImage: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Comment

```javascript
{
  _id: ObjectId,
  content: String,
  author: ObjectId,           // ref → User
  targetType: "post" | "course" | "lesson",
  targetId: ObjectId,         // ref → BlogPost | Course | Lesson
  parentComment: ObjectId,    // null si es raiz, ref → Comment si es respuesta
  likes: Number,
  isApproved: Boolean,        // moderacion
  createdAt: Date,
  updatedAt: Date
}
```

### SiteConfig

```javascript
{
  _id: ObjectId,
  key: "hero" | "about" | "contact" | "seo" | "social",
  data: Mixed,                // contenido dinamico segun key
  updatedAt: Date,
  updatedBy: ObjectId         // ref → User
}
// Ejemplo key="hero":
// data: { name, subtitle, tagline, ctaText }
// Ejemplo key="about":
// data: { avatar, bio, specializations[], education[] }
```

### Newsletter

```javascript
{
  _id: ObjectId,
  email: String,              // unico, indexado
  name: String,
  isActive: Boolean,
  subscribedAt: Date,
  unsubscribedAt: Date
}
```

---

## Roles y Permisos

| Permiso | Admin | Editor | Subscriber | Visitante |
|---------|-------|--------|------------|-----------|
| Ver blog publico | Si | Si | Si | Si |
| Ver cursos publicos | Si | Si | Si | Si |
| Ver portafolio | Si | Si | Si | Si |
| Comentar posts/cursos | Si | Si | Si | No |
| Inscribirse a cursos | Si | Si | Si | No |
| Ver progreso propio | Si | Si | Si | No |
| Crear/editar posts | Si | Si | No | No |
| Crear/editar cursos | Si | No | No | No |
| Gestionar proyectos | Si | No | No | No |
| Gestionar usuarios | Si | No | No | No |
| Editar config del sitio | Si | No | No | No |
| Moderar comentarios | Si | Si | No | No |
| Ver analytics/dashboard | Si | No | No | No |
| Gestionar categorias/tags | Si | Si | No | No |

---

## API Endpoints (NestJS)

### Auth (`/api/auth`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| POST | `/register` | Registro de usuario | Publico |
| POST | `/login` | Login, retorna access + refresh token | Publico |
| POST | `/refresh` | Renueva access token | Autenticado |
| POST | `/logout` | Invalida refresh token | Autenticado |
| POST | `/forgot-password` | Envia email de recuperacion | Publico |
| POST | `/reset-password` | Resetea contrasena con token | Publico |
| GET | `/me` | Perfil del usuario actual | Autenticado |
| PATCH | `/me` | Actualiza perfil propio | Autenticado |

### Blog (`/api/posts`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | `/` | Lista posts publicados (paginado, filtros) | Publico |
| GET | `/:slug` | Detalle de un post por slug | Publico |
| GET | `/category/:slug` | Posts por categoria | Publico |
| GET | `/tag/:tag` | Posts por tag | Publico |
| POST | `/` | Crear post | Admin/Editor |
| PATCH | `/:id` | Actualizar post | Admin/Editor |
| DELETE | `/:id` | Eliminar post | Admin |
| POST | `/:id/like` | Dar like a un post | Autenticado |
| GET | `/search?q=` | Busqueda full-text | Publico |

### Courses (`/api/courses`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | `/` | Lista cursos publicados (paginado, filtros) | Publico |
| GET | `/:slug` | Detalle de curso (modulos visibles, lecciones ocultas si no inscrito) | Publico |
| GET | `/:slug/lessons/:lessonSlug` | Contenido de leccion | Inscrito/Admin |
| POST | `/` | Crear curso | Admin |
| PATCH | `/:id` | Actualizar curso | Admin |
| DELETE | `/:id` | Eliminar curso | Admin |
| POST | `/:id/enroll` | Inscribirse a curso | Autenticado |
| PATCH | `/:courseId/progress/:lessonId` | Marcar leccion completada | Inscrito |
| GET | `/:id/progress` | Progreso del usuario en curso | Inscrito |
| POST | `/:id/review` | Dejar resena | Inscrito |

### Projects (`/api/projects`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | `/` | Lista proyectos publicados | Publico |
| GET | `/:slug` | Detalle de proyecto | Publico |
| POST | `/` | Crear proyecto | Admin |
| PATCH | `/:id` | Actualizar proyecto | Admin |
| DELETE | `/:id` | Eliminar proyecto | Admin |
| PATCH | `/:id/order` | Reordenar proyecto | Admin |

### Categories (`/api/categories`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | `/` | Lista categorias | Publico |
| POST | `/` | Crear categoria | Admin/Editor |
| PATCH | `/:id` | Actualizar categoria | Admin/Editor |
| DELETE | `/:id` | Eliminar categoria | Admin |

### Comments (`/api/comments`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | `/?targetType=post&targetId=xxx` | Comentarios de un recurso | Publico |
| POST | `/` | Crear comentario | Autenticado |
| PATCH | `/:id` | Editar comentario propio | Autenticado |
| DELETE | `/:id` | Eliminar comentario | Admin/Propietario |
| PATCH | `/:id/approve` | Aprobar comentario | Admin/Editor |

### Site Config (`/api/config`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | `/:key` | Obtener config por key | Publico |
| PATCH | `/:key` | Actualizar config | Admin |

### Upload (`/api/upload`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| POST | `/image` | Subir imagen (optimiza, genera thumbnails) | Admin/Editor |
| POST | `/video` | Subir video | Admin |
| POST | `/file` | Subir archivo generico (PDF, ZIP) | Admin |
| DELETE | `/:fileId` | Eliminar archivo | Admin |

### Newsletter (`/api/newsletter`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| POST | `/subscribe` | Suscribirse al newsletter | Publico |
| POST | `/unsubscribe` | Cancelar suscripcion | Publico |
| GET | `/subscribers` | Lista suscriptores | Admin |

### Analytics (`/api/analytics`)

| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | `/dashboard` | Metricas generales | Admin |
| GET | `/posts/popular` | Posts mas vistos | Admin |
| GET | `/courses/popular` | Cursos mas inscritos | Admin |
| GET | `/users/growth` | Crecimiento de usuarios | Admin |

---

## SEO

### Estrategia

| Aspecto | Implementacion |
|---------|---------------|
| **SSR/SSG** | Next.js con getStaticProps para blog/cursos, ISR con revalidacion cada 60s |
| **Meta tags** | Titulo, descripcion, og:image, og:type en cada pagina |
| **Structured Data** | JSON-LD: Person (inicio), Article (blog), Course (cursos), BreadcrumbList |
| **Sitemap** | `/sitemap.xml` generado automaticamente con next-sitemap |
| **Robots** | `/robots.txt` configurado para indexacion selectiva |
| **Canonical URLs** | Tag canonical en cada pagina |
| **Open Graph** | og:title, og:description, og:image, og:url en todas las paginas |
| **Twitter Cards** | twitter:card, twitter:title, twitter:description, twitter:image |
| **Slug semantico** | URLs amigables: `/blog/como-deployar-con-docker` |
| **Headings** | Jerarquia h1 > h2 > h3 correcta en cada pagina |
| **Alt text** | Todas las imagenes con atributo alt descriptivo |
| **Performance** | Core Web Vitals optimizados (LCP < 2.5s, FID < 100ms, CLS < 0.1) |
| **Internacionalizacion** | `lang="es"` en HTML, hreflang si se agrega ingles |

### URLs del Sitio

```
/                           → Inicio (Hero + About + Portafolio + Contacto)
/blog                       → Lista de posts
/blog/:slug                 → Post individual
/blog/categoria/:slug       → Posts por categoria
/blog/tag/:tag              → Posts por tag
/cursos                     → Catalogo de cursos
/cursos/:slug               → Detalle de curso (temario)
/cursos/:slug/leccion/:slug → Leccion individual (protegida)
/portafolio                 → Todos los proyectos
/portafolio/:slug           → Detalle de proyecto
/contacto                   → Formulario de contacto
/login                      → Inicio de sesion
/registro                   → Registro de usuario
/perfil                     → Perfil del usuario
/perfil/cursos              → Mis cursos inscritos
/admin                      → Dashboard admin
/admin/posts                → Gestionar blog
/admin/posts/nuevo          → Crear/editar post
/admin/cursos               → Gestionar cursos
/admin/cursos/nuevo         → Crear/editar curso
/admin/proyectos            → Gestionar proyectos
/admin/proyectos/nuevo      → Crear/editar proyecto
/admin/usuarios             → Gestionar usuarios
/admin/comentarios          → Moderar comentarios
/admin/config               → Configuracion del sitio
/admin/analytics            → Metricas y estadisticas
/admin/media                → Biblioteca de archivos
```

---

## Vistas Detalladas (para Stitch)

---

### VISTA 1: Inicio (Landing Page) — `/`

**Proposito:** Primera impresion, resumen de quien eres, acceso rapido a secciones

**Layout:** Single page con scroll vertical, 4 secciones full-height

**Seccion 1.1 — Hero**
- Fondo: Canvas 3D con modelo rotando (mantener actual)
- Centro: Nombre grande (h1), subtitulo profesional (h2 en cyan), parrafo descriptivo (gris), boton CTA "Conoceme"
- Nav: Header fijo arriba (desktop) / Hamburger flotante (mobile)
- Dot navigation derecha (desktop)
- NUEVO: Indicadores de redes sociales (GitHub, LinkedIn) como iconos flotantes en esquina inferior

**Seccion 1.2 — Sobre Mi**
- Avatar pixel-art centrado arriba
- Titulo "Sobre Mi" en cyan
- Bio en 3 parrafos con texto justificado
- NUEVO: Grid de "especialidades" con iconos (Frontend, Backend, DevOps, IoT, Mobile) debajo de la bio
- NUEVO: Seccion "Experiencia" con timeline vertical (opcional, si hay datos)

**Seccion 1.3 — Portafolio (preview)**
- Titulo "Mi trayectoria en codigo"
- Muestra solo 4-6 proyectos destacados (featured=true) en carrusel
- Boton "Ver todos los proyectos →" que lleva a `/portafolio`
- Filtros se mantienen pero simplificados (solo busqueda + techs mas populares)

**Seccion 1.4 — Blog (preview) — NUEVA**
- Titulo "Ultimas publicaciones" en cyan
- Grid 3 columnas (desktop) / 1 columna (mobile) con los 3 posts mas recientes
- Cada card: imagen de portada, categoria con color, titulo, excerpt (2 lineas), fecha, tiempo de lectura
- Boton "Ver todo el blog →" que lleva a `/blog`

**Seccion 1.5 — Cursos (preview) — NUEVA**
- Titulo "Aprende conmigo" en cyan
- Carrusel horizontal con 3-4 cursos destacados
- Cada card: imagen portada, badge de nivel (beginner/intermediate/advanced), titulo, numero de lecciones, duracion total, badge "Gratis" o precio
- Boton "Explorar cursos →" que lleva a `/cursos`

**Seccion 1.6 — Newsletter — NUEVA**
- Franja horizontal con fondo diferenciado (gris oscuro #1a1c22)
- Titulo: "Mantente al dia"
- Subtitulo: "Recibe los ultimos posts y cursos en tu correo"
- Input email + boton "Suscribirme" en linea
- Texto legal: "Sin spam. Cancela cuando quieras."

**Seccion 1.7 — Contacto**
- Mantener layout actual: 2 columnas (info + formulario)
- NUEVO: Mapa o animacion sutil de ubicacion
- NUEVO: Enlace a LinkedIn en las tarjetas de contacto

**Footer — NUEVO**
- 4 columnas: Logo + descripcion breve | Links rapidos (Inicio, Blog, Cursos, Portafolio, Contacto) | Redes sociales (GitHub, LinkedIn, WhatsApp) | Newsletter mini
- Copyright: "© 2026 Angel David Onesto Frias"
- Links legales: Politica de privacidad, Terminos de uso

---

### VISTA 2: Blog — Lista de Posts — `/blog`

**Proposito:** Mostrar todos los posts del blog con filtros y busqueda

**Header:** Navegacion global (misma que landing, pero con links activos resaltados)

**Seccion superior:**
- Titulo: "Blog" (h1) en cyan
- Subtitulo: "Articulos sobre desarrollo, DevOps, IoT y tecnologia"
- Barra de busqueda grande con icono de lupa
- Filtro por categorias: chips/pills horizontales scrolleables (DevOps, Frontend, Backend, IoT, General)
- Ordenar por: "Mas recientes" | "Mas populares" | "Mas leidos"

**Grid de posts:**
- Desktop: 3 columnas
- Tablet: 2 columnas
- Mobile: 1 columna
- Cada card:
  - Imagen de portada (aspect ratio 16:9)
  - Badge de categoria (esquina superior, color de la categoria)
  - Titulo (h3, blanco, bold, max 2 lineas)
  - Excerpt (gris, max 3 lineas, truncado con "...")
  - Fila inferior: Avatar mini del autor + nombre | Fecha | "5 min de lectura"
  - Hover: elevacion + borde cyan sutil

**Paginacion:**
- Paginacion numerada al fondo (1, 2, 3... ultima)
- O infinite scroll con boton "Cargar mas"
- 9 posts por pagina (desktop), 6 (tablet), 4 (mobile)

**Sidebar (desktop, opcional):**
- Categorias con conteo de posts
- Tags populares (tag cloud)
- Post mas leido de la semana
- CTA de newsletter

---

### VISTA 3: Blog — Post Individual — `/blog/:slug`

**Proposito:** Lectura del articulo completo con SEO optimizado

**Meta SEO:**
- `<title>` = post.seo.metaTitle || post.title
- `<meta description>` = post.seo.metaDescription || post.excerpt
- `og:image` = post.coverImage
- JSON-LD tipo Article con author, datePublished, dateModified

**Layout:**
- Ancho de lectura: max-width 720px, centrado
- Sidebar derecha (desktop): tabla de contenidos sticky

**Contenido:**
- Imagen de portada: ancho completo del contenedor, aspect ratio 16:9
- Badge de categoria + fecha de publicacion + tiempo de lectura
- Titulo (h1, grande, blanco)
- Info del autor: avatar + nombre + bio corta
- Separador visual
- Cuerpo del articulo: markdown renderizado con syntax highlighting para bloques de codigo (Prism.js o Shiki)
  - Soporte para: headings, listas, imagenes, blockquotes, tablas, inline code, code blocks con lenguaje
  - Imagenes dentro del post: lazy loading, lightbox al click
- Tags al final del articulo como chips
- Contador de likes con boton (corazon) — requiere login

**Navegacion entre posts:**
- Fila con "← Post anterior" y "Post siguiente →" al final

**Seccion de comentarios:**
- Titulo: "Comentarios (N)"
- Input de comentario: avatar del usuario + textarea + boton "Comentar"
- Si no esta logueado: mensaje "Inicia sesion para comentar" con link a /login
- Lista de comentarios: avatar + nombre + fecha + contenido + boton responder
- Respuestas anidadas (1 nivel): indentadas con linea vertical izquierda
- Cada comentario: boton like, boton reportar

**Posts relacionados:**
- Titulo: "Tambien te puede interesar"
- Grid 3 cards horizontales con posts de la misma categoria

---

### VISTA 4: Cursos — Catalogo — `/cursos`

**Proposito:** Explorar y descubrir cursos disponibles

**Header:** Navegacion global

**Seccion superior:**
- Titulo: "Cursos" (h1) en cyan
- Subtitulo: "Aprende desarrollo, infraestructura y mas con proyectos reales"
- Barra de busqueda
- Filtros en fila:
  - Categoria: dropdown o pills
  - Nivel: "Todos" | "Principiante" | "Intermedio" | "Avanzado"
  - Precio: "Todos" | "Gratis" | "De pago"
  - Ordenar: "Mas recientes" | "Mas populares" | "Mejor valorados"

**Grid de cursos:**
- Desktop: 3 columnas
- Tablet: 2 columnas
- Mobile: 1 columna
- Cada card:
  - Imagen de portada (aspect ratio 16:9)
  - Badge de nivel en esquina (color segun nivel: verde=beginner, amarillo=intermediate, rojo=advanced)
  - Badge "Gratis" o precio "$XXX MXN" en esquina opuesta
  - Titulo (h3, blanco, bold)
  - Descripcion corta (excerpt, gris, 2 lineas)
  - Fila de stats: icono reloj + "X horas" | icono lecciones + "X lecciones" | icono usuarios + "X inscritos"
  - Rating: estrellas (1-5) + numero de resenas
  - Instructor: avatar mini + nombre
  - Hover: elevacion + glow cyan
  - Badge "NUEVO" si publicado hace menos de 30 dias
  - Badge "PROXIMAMENTE" si status=coming_soon (card deshabilitada, opacidad reducida)

---

### VISTA 5: Cursos — Detalle de Curso — `/cursos/:slug`

**Proposito:** Convencer al usuario de inscribirse y mostrar todo el temario

**Meta SEO:**
- JSON-LD tipo Course con name, description, provider, offers

**Layout:** 2 columnas (desktop), 1 columna (mobile)

**Columna principal (izquierda, 65%):**
- Imagen de portada grande o video introductorio
- Titulo (h1, blanco, grande)
- Subtitulo/descripcion corta
- Stats en fila: nivel badge | duracion total | N lecciones | N inscritos | rating estrellas
- Tabs: "Descripcion" | "Temario" | "Resenas"

  **Tab Descripcion:**
  - Descripcion larga del curso (markdown renderizado)
  - Seccion "Lo que aprenderas": lista con checks verdes (whatYouLearn[])
  - Seccion "Requisitos": lista con puntos (requirements[])
  - Tecnologias del curso: chips/tags

  **Tab Temario:**
  - Lista de modulos (acordeon expandible)
  - Cada modulo: titulo + numero de lecciones + duracion
  - Al expandir: lista de lecciones con icono (video/texto/quiz) + titulo + duracion
  - Lecciones gratuitas marcadas con badge "Vista previa" y son clicables
  - Lecciones de pago muestran icono de candado si no esta inscrito
  - Barra de progreso si esta inscrito (porcentaje completado por modulo)

  **Tab Resenas:**
  - Resumen: rating promedio grande + distribucion de estrellas (barras)
  - Lista de resenas: avatar + nombre + estrellas + fecha + comentario
  - Input para dejar resena (solo si inscrito y no ha dejado resena)

**Columna lateral (derecha, 35%, sticky):**
- Card de inscripcion con fondo superficie:
  - Precio grande: "Gratis" o "$XXX MXN"
  - Boton "Inscribirme" (cyan, ancho completo) — si no inscrito
  - Boton "Continuar aprendiendo" — si ya inscrito
  - Boton "Iniciar sesion para inscribirte" — si no logueado
  - Detalles: idioma, nivel, duracion, actualizacion
  - Incluye: "Acceso de por vida", "Certificado de completado", "Recursos descargables"
- Instructor card: avatar + nombre + bio corta + link a perfil

**Mobile:** La card de inscripcion se convierte en barra fija inferior con precio + boton CTA

---

### VISTA 6: Cursos — Leccion Individual — `/cursos/:slug/leccion/:lessonSlug`

**Proposito:** Consumir el contenido de la leccion

**Acceso:** Requiere inscripcion (o leccion con isFree=true)

**Layout:** 3 columnas (desktop), 1 columna (mobile)

**Columna izquierda (sidebar, 250px):**
- Titulo del curso (link a detalle del curso)
- Progreso general: barra circular o lineal con porcentaje
- Lista de modulos y lecciones (menu tipo arbol):
  - Modulo colapsable
  - Leccion actual resaltada en cyan
  - Lecciones completadas con check verde
  - Click en leccion navega a esa leccion

**Columna central (contenido, fluido):**
- Tipo video:
  - Reproductor de video embebido (ancho completo, controles personalizados)
  - Debajo: titulo de leccion (h1) + duracion
  - Descripcion/notas en markdown
  - Recursos descargables: lista con iconos de tipo + boton descargar
- Tipo texto:
  - Contenido renderizado en markdown con syntax highlighting
  - Imagenes, tablas, code blocks
- Tipo quiz:
  - Preguntas con opciones de respuesta
  - Feedback inmediato (correcto/incorrecto)
  - Score al final
- Navegacion inferior: "← Leccion anterior" | "Marcar como completada" (boton cyan) | "Leccion siguiente →"
- Al marcar como completada: animacion de check, actualiza progreso en sidebar

**Columna derecha (contextual, 200px, solo desktop):**
- Recursos de la leccion
- Mini FAQ o notas del instructor
- Link a foro/comentarios de la leccion

**Seccion de comentarios/dudas:**
- Debajo del contenido
- Sistema de comentarios igual que en blog
- Contexto: "Dudas sobre esta leccion"

---

### VISTA 7: Portafolio Completo — `/portafolio`

**Proposito:** Mostrar todos los proyectos con filtros avanzados

**Similar a seccion actual de portafolio pero en pagina dedicada:**
- Titulo: "Portafolio" (h1)
- FilterPanel completo (busqueda + techs + sort + demo checkbox)
- Grid de proyectos: 3 columnas (desktop), 2 (tablet), 1 (mobile) — layout vertical en vez de carrusel
- Modal de detalle de proyecto al hacer click (o pagina dedicada `/portafolio/:slug`)
- SEO: cada proyecto tiene su propia pagina `/portafolio/:slug` con meta tags

---

### VISTA 8: Portafolio — Detalle de Proyecto — `/portafolio/:slug`

**Proposito:** Pagina dedicada del proyecto para SEO y compartir

**Layout:**
- Imagen/video principal grande (hero del proyecto)
- Titulo (h1) + tipo de proyecto + fecha
- Tags de tecnologias
- Descripcion completa (markdown)
- Galeria de medios: grid de imagenes + videos con lightbox
- Links: Demo, Repos (frontend/backend/hardware), API endpoints
- Credenciales de prueba (si aplica)
- Boton "← Volver al portafolio"

---

### VISTA 9: Login — `/login`

**Proposito:** Autenticacion de usuarios

**Layout:** Centrado, max-width 400px

**Contenido:**
- Logo o nombre del sitio arriba
- Titulo: "Iniciar Sesion"
- Formulario:
  - Campo email con icono
  - Campo contrasena con icono + toggle visibilidad (ojo)
  - Checkbox "Recordarme"
  - Boton "Iniciar Sesion" (cyan, ancho completo)
- Link: "¿Olvidaste tu contrasena?" → /forgot-password
- Separador: "o"
- Boton "Iniciar con GitHub" (OAuth, si se implementa)
- Boton "Iniciar con Google" (OAuth, si se implementa)
- Texto: "¿No tienes cuenta? Registrate" → /registro
- Fondo: oscuro con efecto glassmorphism en el card

---

### VISTA 10: Registro — `/registro`

**Proposito:** Creacion de cuenta para suscriptores

**Layout:** Centrado, max-width 400px

**Contenido:**
- Titulo: "Crear Cuenta"
- Formulario:
  - Campo nombre completo
  - Campo email
  - Campo contrasena (con indicador de fuerza: debil/media/fuerte)
  - Campo confirmar contrasena
  - Checkbox: "Acepto los terminos de uso y politica de privacidad"
  - Checkbox: "Suscribirme al newsletter" (pre-checked)
  - Boton "Crear Cuenta" (cyan, ancho completo)
- OAuth: mismas opciones que login
- Texto: "¿Ya tienes cuenta? Inicia sesion" → /login

---

### VISTA 11: Perfil del Usuario — `/perfil`

**Proposito:** Ver y editar informacion personal, ver cursos inscritos

**Layout:** Sidebar izquierda + contenido principal

**Sidebar:**
- Avatar del usuario (editable, click para subir)
- Nombre
- Email
- Links: Mi perfil | Mis cursos | Configuracion | Cerrar sesion

**Tab Mi Perfil:**
- Formulario editable: nombre, email, bio, avatar
- Boton "Guardar cambios"

**Tab Mis Cursos (`/perfil/cursos`):**
- Grid de cursos inscritos
- Cada card: imagen + titulo + barra de progreso + porcentaje + "Continuar" boton
- Cursos completados: badge "Completado" + link a certificado
- Si no hay cursos: estado vacio con CTA "Explorar cursos"

**Tab Configuracion:**
- Cambiar contrasena: actual, nueva, confirmar
- Preferencias de notificacion: email de nuevos posts, nuevos cursos
- Eliminar cuenta (con confirmacion doble)

---

### VISTA 12: Certificado — `/certificado/:id`

**Proposito:** Pagina publica verificable del certificado

**Layout:** Centrado, estilo diploma

**Contenido:**
- Diseno tipo certificado/diploma:
  - Borde decorativo cyan
  - Logo del sitio
  - "Certificado de Finalizacion"
  - Nombre del estudiante
  - Nombre del curso
  - Fecha de emision
  - Firma del instructor
  - ID unico de verificacion
  - QR code que apunta a la URL del certificado
- Boton "Descargar PDF"
- Boton "Compartir en LinkedIn"

---

### VISTA 13: Admin — Dashboard — `/admin`

**Proposito:** Panel central de administracion con metricas

**Acceso:** Solo rol admin

**Layout:** Sidebar izquierda fija + contenido principal

**Sidebar Admin:**
- Logo/nombre del sitio
- Links con iconos:
  - Dashboard
  - Blog (posts)
  - Cursos
  - Proyectos
  - Usuarios
  - Comentarios
  - Media (archivos)
  - Configuracion del sitio
  - Analytics
- Boton "Ver sitio →" (abre frontend en nueva tab)
- Info del admin: avatar + nombre + "Admin"
- Boton "Cerrar sesion"

**Contenido Dashboard:**
- Fila de stats cards (4 columnas):
  - Total usuarios (con delta vs mes anterior)
  - Total posts publicados
  - Total cursos activos
  - Total inscripciones a cursos
- Grafica de linea: "Visitas ultimos 30 dias" (Chart.js o Recharts)
- Grafica de barras: "Inscripciones por curso"
- Lista: "Ultimos 5 comentarios pendientes de aprobacion"
- Lista: "Ultimos 5 usuarios registrados"
- Lista: "Posts mas leidos esta semana"

---

### VISTA 14: Admin — Gestionar Blog — `/admin/posts`

**Proposito:** CRUD de posts del blog

**Layout:** Tabla de datos con acciones

**Contenido:**
- Titulo: "Gestionar Blog"
- Boton "Nuevo Post +" (cyan, esquina superior derecha)
- Filtros en fila: busqueda + estado (todos/draft/published/archived) + categoria
- Tabla con columnas:
  - Checkbox (seleccion multiple)
  - Imagen mini (thumbnail)
  - Titulo (link al editor)
  - Categoria (badge con color)
  - Estado (badge: verde=published, amarillo=draft, gris=archived)
  - Autor
  - Fecha de publicacion
  - Vistas
  - Acciones: Editar | Ver | Duplicar | Eliminar
- Paginacion inferior
- Acciones masivas: "Publicar seleccionados" | "Archivar seleccionados" | "Eliminar seleccionados"

---

### VISTA 15: Admin — Editor de Post — `/admin/posts/nuevo` y `/admin/posts/:id/editar`

**Proposito:** Crear o editar un post del blog

**Layout:** 2 columnas (contenido 70% + sidebar 30%)

**Columna principal:**
- Campo titulo: input grande, placeholder "Titulo del post..."
- Campo slug: generado automaticamente, editable
- Editor WYSIWYG/Markdown:
  - Toolbar: Bold, Italic, H2, H3, Link, Image, Code block, Blockquote, Lista, Tabla
  - Area de edicion grande
  - Toggle "Editor visual" / "Markdown" / "Preview"
  - Drag & drop de imagenes directo en el editor
  - Syntax highlighting en code blocks

**Sidebar:**
- Seccion "Publicacion":
  - Estado: dropdown (draft/published/archived)
  - Fecha de publicacion: date picker (permite programar)
  - Boton "Guardar borrador" (secundario)
  - Boton "Publicar" (cyan, prominente)
- Seccion "Categoria": dropdown con opcion de crear nueva
- Seccion "Tags": input con autocompletado, chips removibles
- Seccion "Imagen de portada": area de drag & drop o click para subir, preview
- Seccion "Excerpt": textarea (max 160 chars) con contador
- Seccion "SEO":
  - Meta titulo (input con contador 60 chars)
  - Meta descripcion (textarea con contador 160 chars)
  - Preview de como se veria en Google (titulo azul, URL verde, descripcion gris)

---

### VISTA 16: Admin — Gestionar Cursos — `/admin/cursos`

**Proposito:** CRUD de cursos

**Contenido:**
- Titulo: "Gestionar Cursos"
- Boton "Nuevo Curso +"
- Tabla:
  - Imagen mini
  - Titulo
  - Estado (draft/published/coming_soon/archived)
  - Nivel
  - Precio
  - Inscritos
  - Rating
  - Lecciones
  - Acciones: Editar | Ver | Duplicar | Eliminar

---

### VISTA 17: Admin — Editor de Curso — `/admin/cursos/nuevo` y `/admin/cursos/:id/editar`

**Proposito:** Crear o editar un curso completo con modulos y lecciones

**Layout:** Multiples tabs/pasos

**Tab 1 — Informacion General:**
- Titulo del curso
- Slug (auto-generado)
- Descripcion corta (excerpt)
- Descripcion larga (editor markdown)
- Imagen de portada (drag & drop)
- Nivel: radio buttons (beginner/intermediate/advanced)
- Precio: toggle gratis/pago + input monto + moneda
- Categoria: dropdown
- Tags: input con chips
- "Lo que aprenderas": lista editable (agregar/remover items)
- "Requisitos": lista editable
- SEO: meta titulo, meta descripcion, preview Google

**Tab 2 — Temario (Modulos y Lecciones):**
- Lista de modulos con drag & drop para reordenar
- Cada modulo:
  - Input titulo editable inline
  - Boton "Agregar leccion +"
  - Lista de lecciones (drag & drop para reordenar):
    - Titulo de leccion
    - Tipo: dropdown (video/texto/quiz/ejercicio)
    - Checkbox "Vista previa gratuita"
    - Boton expandir para editar contenido:
      - Si video: upload de video o input URL + campo duracion
      - Si texto: editor markdown
      - Si quiz: constructor de preguntas (pregunta + opciones + respuesta correcta)
    - Recursos: agregar archivos (PDF, ZIP, links)
  - Boton eliminar modulo (con confirmacion)
- Boton "Agregar modulo +"
- Calculo automatico de duracion total y numero de lecciones

**Tab 3 — Publicacion:**
- Estado: draft / published / coming_soon / archived
- Fecha de publicacion
- Preview del curso como lo veran los usuarios
- Boton "Guardar borrador" | "Publicar curso"

---

### VISTA 18: Admin — Gestionar Proyectos — `/admin/proyectos`

**Proposito:** CRUD de proyectos del portafolio

**Contenido:**
- Titulo: "Gestionar Proyectos"
- Boton "Nuevo Proyecto +"
- Grid drag & drop para reordenar (o tabla con flechas de orden)
- Cada proyecto:
  - Thumbnail
  - Titulo
  - Tipo
  - Estado (draft/published/archived)
  - Destacado (toggle estrella)
  - Fecha
  - Acciones: Editar | Ver | Eliminar

---

### VISTA 19: Admin — Editor de Proyecto — `/admin/proyectos/nuevo` y `/admin/proyectos/:id/editar`

**Proposito:** Crear o editar un proyecto del portafolio

**Layout:** Formulario con secciones

**Secciones:**
- Informacion basica: titulo, slug, descripcion corta, tipo (dropdown), fecha (date picker)
- Descripcion larga: editor markdown
- Tecnologias: input con autocompletado + chips
- Repositorios: inputs para frontend, backend, hardware, deploy (URLs de GitHub)
- Demo: input URL (o multiples demos)
- APIs: inputs dinamicos key-value
- Credenciales de prueba: email + password (solo si aplica, toggle)
- Media:
  - Imagenes: galeria con drag & drop multiple, reordenar, eliminar
  - Videos: upload o URLs, reordenar
  - Thumbnail: seleccionar de las imagenes o subir aparte
- SEO: meta titulo, meta descripcion, og:image
- Estado: draft/published/archived
- Destacado: toggle
- Boton "Guardar" | "Publicar"

---

### VISTA 20: Admin — Gestionar Usuarios — `/admin/usuarios`

**Proposito:** Ver, buscar y modificar usuarios

**Contenido:**
- Titulo: "Usuarios"
- Stats: total usuarios, nuevos este mes, por rol
- Barra de busqueda
- Filtros: rol (todos/admin/editor/subscriber), estado (verificado/no verificado)
- Tabla:
  - Avatar
  - Nombre
  - Email
  - Rol (badge con color)
  - Verificado (check/x)
  - Fecha de registro
  - Cursos inscritos
  - Acciones: Ver detalle | Cambiar rol | Desactivar
- Modal de detalle de usuario: toda su info + cursos inscritos + comentarios + actividad

---

### VISTA 21: Admin — Moderar Comentarios — `/admin/comentarios`

**Proposito:** Aprobar, rechazar o eliminar comentarios

**Contenido:**
- Tabs: "Pendientes (N)" | "Aprobados" | "Todos"
- Lista de comentarios:
  - Avatar del autor + nombre + email
  - Contexto: "En: [Nombre del post/curso/leccion]" (link)
  - Contenido del comentario
  - Fecha
  - Acciones: Aprobar (check verde) | Rechazar (x roja) | Eliminar (papelera) | Ver en sitio
- Acciones masivas: "Aprobar seleccionados" | "Eliminar seleccionados"

---

### VISTA 22: Admin — Biblioteca de Media — `/admin/media`

**Proposito:** Gestionar todos los archivos subidos (imagenes, videos, PDFs)

**Contenido:**
- Titulo: "Biblioteca de Archivos"
- Boton "Subir archivo +" (drag & drop zone)
- Filtros: tipo (imagen/video/documento/todos), busqueda por nombre
- Vista: toggle grid (thumbnails) / lista (tabla)
- Grid: thumbnails con nombre, tamano, fecha, boton copiar URL
- Al hacer click: modal con preview + info (nombre, tipo, tamano, URL, donde se usa) + boton eliminar

---

### VISTA 23: Admin — Configuracion del Sitio — `/admin/config`

**Proposito:** Editar contenido dinamico del portfolio sin tocar codigo

**Tabs:**

**Tab Hero:**
- Nombre a mostrar
- Subtitulo profesional
- Descripcion/tagline
- Texto del boton CTA

**Tab Sobre Mi:**
- Avatar (upload)
- Biografia (editor markdown)
- Especializaciones: lista editable con icono + titulo + descripcion
- Educacion: lista editable con institucion + periodo + titulo

**Tab Contacto:**
- Email
- Telefono/WhatsApp
- Redes sociales: GitHub, LinkedIn, Twitter (URLs)

**Tab SEO Global:**
- Titulo del sitio
- Descripcion del sitio
- Imagen OG por defecto
- Google Analytics ID
- Google Search Console verificacion

**Tab Apariencia:**
- Color primario (color picker, default #00b4d8)
- Modelo 3D (upload .glb)
- Logo (upload)
- Favicon (upload)

---

### VISTA 24: Admin — Analytics — `/admin/analytics`

**Proposito:** Metricas detalladas del sitio

**Contenido:**
- Selector de rango de fechas: "Ultimos 7 dias" | "30 dias" | "90 dias" | "Personalizado"
- Seccion Trafico:
  - Visitas totales, visitantes unicos, paginas vistas
  - Grafica de linea: visitas por dia
  - Paginas mas visitadas (tabla)
- Seccion Blog:
  - Posts publicados este periodo
  - Total vistas en posts
  - Post mas popular
  - Comentarios recibidos
- Seccion Cursos:
  - Nuevas inscripciones este periodo
  - Cursos completados
  - Leccion con mas abandonos
  - Distribucion por nivel
- Seccion Usuarios:
  - Nuevos registros este periodo
  - Grafica de crecimiento
  - Distribucion por rol

---

### VISTA 25: Forgot/Reset Password — `/forgot-password` y `/reset-password`

**Forgot Password:**
- Titulo: "Recuperar Contrasena"
- Input email
- Boton "Enviar enlace de recuperacion"
- Mensaje de confirmacion: "Si existe una cuenta con ese email, recibiras un enlace"

**Reset Password:**
- Titulo: "Nueva Contrasena"
- Input nueva contrasena (con indicador de fuerza)
- Input confirmar contrasena
- Boton "Cambiar Contrasena"
- Redirige a /login con mensaje de exito

---

### VISTA 26: Error 404 — Pagina no encontrada

**Contenido:**
- Fondo oscuro con Canvas 3D
- "404" grande en cyan
- "Pagina no encontrada"
- "La pagina que buscas no existe o fue movida"
- Boton "Volver al inicio"
- Links sugeridos: Blog | Cursos | Portafolio

---

## Funcionalidades Transversales

### Autenticacion y Seguridad

| Funcionalidad | Detalle |
|---------------|---------|
| **JWT** | Access token (15 min) + Refresh token (7 dias) en httpOnly cookie |
| **Password hashing** | bcrypt con salt rounds 12 |
| **Rate limiting** | 100 req/min por IP (general), 5 req/min (login), 3 req/min (registro) |
| **CORS** | Whitelist de dominios permitidos |
| **Helmet** | Headers de seguridad HTTP |
| **Validacion** | class-validator en DTOs de NestJS |
| **Sanitizacion** | Sanitizar HTML en inputs de usuario (DOMPurify) |
| **CSRF** | Token CSRF para formularios |
| **File upload** | Validacion de tipo MIME, tamano maximo (10MB imagenes, 500MB videos) |
| **Verificacion email** | Token unico por email, expira en 24h |

### Performance

| Funcionalidad | Detalle |
|---------------|---------|
| **ISR** | Incremental Static Regeneration para blog y cursos (revalidate: 60s) |
| **Image optimization** | Next.js Image component, WebP automatico, lazy loading |
| **CDN** | Cloudflare como CDN para assets estaticos |
| **Compresion** | gzip/brotli en Nginx |
| **DB Indexes** | Indices en slug, email, status, publishedAt, tags |
| **Paginacion** | Cursor-based para listas grandes, offset para admin |
| **Cache** | Redis para queries frecuentes (lista de categorias, config del sitio) |
| **Bundle splitting** | Code splitting por ruta en Next.js |

### SEO Tecnico

| Funcionalidad | Detalle |
|---------------|---------|
| **Sitemap** | Generado automaticamente, actualizado con cada publicacion |
| **Robots.txt** | Permite indexacion de publico, bloquea /admin, /perfil, /api |
| **Canonical URLs** | En cada pagina |
| **Structured Data** | Person, Article, Course, BreadcrumbList, FAQPage |
| **Meta tags** | OpenGraph + Twitter Cards en todas las paginas |
| **Heading hierarchy** | Un solo h1 por pagina, h2-h6 jerarquicos |
| **Alt text** | Obligatorio en todas las imagenes |
| **Core Web Vitals** | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| **Mobile-first** | Google mobile-first indexing compatible |

### Notificaciones

| Evento | Canal |
|--------|-------|
| Nuevo comentario en tu post/leccion | Email al autor |
| Respuesta a tu comentario | Email al usuario |
| Nuevo curso publicado | Email a suscriptores newsletter |
| Nuevo post publicado | Email a suscriptores newsletter |
| Inscripcion a curso | Email de bienvenida al usuario |
| Curso completado | Email con certificado |
| Nuevo usuario registrado | Notificacion en admin dashboard |

---

## Fases de Implementacion Sugeridas

### Fase 1 — Fundacion (Backend + Auth + Migracion)
- Setup NestJS con MongoDB (conectar a VM 101)
- Modulo de autenticacion (JWT, registro, login, roles)
- Migrar projects.js a MongoDB (API de proyectos)
- Migrar frontend a Next.js con SSR
- Deploy inicial con Cloudflare Tunnel

### Fase 2 — Blog
- CRUD de posts (API + Admin)
- Editor WYSIWYG/Markdown
- Categorias y tags
- Vista publica del blog con SSR/ISR
- Sistema de comentarios
- SEO (sitemap, meta tags, structured data)

### Fase 3 — Cursos
- CRUD de cursos con modulos y lecciones
- Sistema de inscripcion
- Reproductor de video
- Tracking de progreso
- Certificados

### Fase 4 — Admin Panel Completo
- Dashboard con metricas
- Gestion de usuarios
- Moderacion de comentarios
- Configuracion del sitio
- Biblioteca de media
- Analytics

### Fase 5 — Polish y Produccion
- Newsletter
- Optimizacion de performance
- Testing E2E
- Monitoreo (Grafana, ya existente en VM 103)
- Backup automatico de la BD
- Documentacion
