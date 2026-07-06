# Guia de Vistas — Portfolio Angel David Onesto Frias

Este documento describe TODAS las vistas de la aplicacion para que Stitch genere los disenos. Cada vista incluye: ruta, proposito, layout con wireframe ASCII, componentes, estados, y variantes responsive.

---

## Sistema de Diseno Base (aplica a TODAS las vistas)

### Paleta de Colores

| Token | Hex | Uso |
|-------|-----|-----|
| `--primary` | `#00b4d8` | Titulos de seccion, links, bordes activos, botones CTA, badges activos |
| `--primary-hover` | `#0096b7` | Hover de botones primarios |
| `--primary-glow` | `rgba(0,180,216,0.3)` | Box-shadow glow en hover de cards y elementos interactivos |
| `--bg-base` | `#000000` | Fondo del body en todo el sitio publico |
| `--bg-surface` | `#0f1115` | Fondo de cards, modales, contenedores elevados |
| `--bg-surface-2` | `#1a1c22` | Fondo de paneles secundarios (filtros, sidebar, inputs) |
| `--bg-surface-3` | `#242830` | Fondo de hover en items de lista, bordes sutiles |
| `--bg-admin` | `#0c0e12` | Fondo base del panel admin |
| `--text-primary` | `#ffffff` | Titulos, nombres, texto principal |
| `--text-secondary` | `#aaaaaa` | Descripciones, fechas, metadatos |
| `--text-muted` | `#666666` | Placeholders, texto deshabilitado |
| `--border` | `#2a2d35` | Bordes de inputs, separadores, divisiones |
| `--success` | `#22c55e` | Estados publicado, completado, activo, checks |
| `--warning` | `#f59e0b` | Estados draft, pendiente, nivel intermedio |
| `--error` | `#ef4444` | Errores, eliminar, estados criticos |
| `--info` | `#3b82f6` | Informacion, nivel avanzado |

### Tipografia

| Elemento | Fuente | Peso | Tamano Desktop | Tamano Mobile |
|----------|--------|------|----------------|---------------|
| h1 pagina | Inter | 800 | 3rem (48px) | 2rem (32px) |
| h2 seccion | Inter | 700 | 2rem (32px) | 1.5rem (24px) |
| h3 card/titulo | Inter | 600 | 1.25rem (20px) | 1.1rem (17.6px) |
| Body | Inter | 400 | 1rem (16px) | 0.875rem (14px) |
| Small/meta | Inter | 400 | 0.875rem (14px) | 0.75rem (12px) |
| Caption | Inter | 500 | 0.75rem (12px) | 0.7rem (11.2px) |

### Componentes Reutilizables

**Boton Primario:**
- Fondo: `--primary`, texto: `#000000` (oscuro), border-radius: 8px, padding: 12px 24px
- Hover: `--primary-hover` + sombra `0 0 15px var(--primary-glow)`
- Disabled: opacidad 0.5, cursor not-allowed

**Boton Secundario (outline):**
- Fondo: transparente, borde: 1px solid `--primary`, texto: `--primary`
- Hover: fondo `--primary`, texto: negro

**Input/Textarea:**
- Fondo: `--bg-surface-2`, borde: 1px solid `--border`, border-radius: 8px
- Texto: `--text-primary`, placeholder: `--text-muted`
- Focus: borde `--primary` + sombra `0 0 8px var(--primary-glow)`
- Padding: 12px 16px

**Card Base:**
- Fondo: `--bg-surface`, border-radius: 12px, borde: 1px solid `--border`
- Hover: borde `--primary` + sombra `0 0 20px var(--primary-glow)`
- Transicion: all 0.3s ease

**Badge/Chip:**
- Fondo: `--bg-surface-2`, borde: 1px solid `--border`, border-radius: 20px
- Padding: 4px 12px, font-size: 0.75rem
- Activo: fondo `--primary`, texto negro, sin borde
- Variantes de color: success (verde), warning (amarillo), error (rojo)

**Avatar:**
- Circular (border-radius: 50%), borde: 2px solid `--border`
- Tamanos: 32px (mini), 48px (medio), 80px (grande), 120px (perfil)

**Glassmorphism Card:**
- Fondo: `rgba(15,17,21,0.7)`, backdrop-filter: blur(12px)
- Borde: 1px solid `rgba(255,255,255,0.08)`
- Border-radius: 12px

### Breakpoints

| Nombre | Ancho | Columnas de Grid |
|--------|-------|------------------|
| Mobile | 0 — 480px | 1 columna |
| Tablet | 481px — 768px | 2 columnas |
| Desktop | 769px — 1200px | 3 columnas |
| Wide | 1201px+ | 3-4 columnas, max-width contenedor 1400px |

### Animaciones Estandar

| Tipo | Propiedad | Valor |
|------|-----------|-------|
| Hover general | transition | all 0.3s ease |
| Entrada de seccion | Framer Motion | opacity: 0→1, y: 30→0, duration: 0.6s |
| Fade in page | CSS | opacity: 0→1, 0.4s ease |
| Card hover | transform + shadow | translateY(-4px) + glow cyan |
| Modal entrada | CSS | opacity 0→1 + scale 0.95→1, 0.3s ease |

---

## Navegacion Global (presente en todas las vistas)

### Desktop (>768px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Logo/Nombre    Inicio  Blog  Cursos  Portafolio  Contacto    [Avatar▾] │
└─────────────────────────────────────────────────────────────────────┘
```
- Fijo en la parte superior (sticky), fondo: `--bg-base` con `backdrop-filter: blur(10px)` al hacer scroll
- Logo: texto "AO" o nombre corto, cyan, bold
- Links: `--text-primary`, hover `--primary`, el activo tiene borde inferior `--primary` 2px
- Si no logueado: boton "Iniciar Sesion" (outline) en lugar de avatar
- Si logueado: avatar circular 32px + dropdown (Mi perfil, Mis cursos, Cerrar sesion)
- Si admin: link adicional "Admin" visible antes del avatar
- Dot Navigation vertical (derecha, solo en landing `/`): 4-7 puntos segun secciones visibles

### Mobile (<=768px)

```
┌──────────────────────────────┐
│ Logo/Nombre           [≡]    │
└──────────────────────────────┘
```
- Header simplificado: logo izquierda + hamburger derecha
- Hamburger abre menu lateral (drawer) desde la derecha:

```
┌──────────┬───────────────────┐
│          │  [X]              │
│  (fondo  │  ──────────────   │
│  oscuro  │  Inicio           │
│  overlay)│  Blog             │
│          │  Cursos            │
│          │  Portafolio        │
│          │  Contacto          │
│          │  ──────────────   │
│          │  Iniciar Sesion   │
│          │  o                │
│          │  [Avatar] Perfil  │
│          │  Mis Cursos       │
│          │  Cerrar Sesion    │
└──────────┴───────────────────┘
```
- Drawer: fondo `--bg-surface` con glassmorphism, ancho 280px, desliza desde derecha
- Overlay oscuro al abrir (click cierra el drawer)

### Footer Global (presente en todas las paginas excepto admin)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   AO                     Links              Redes        Newsletter │
│   Angel David            Inicio             GitHub       [email   ] │
│   Onesto Frias           Blog               LinkedIn     [Suscri-] │
│   Desarrollador          Cursos             WhatsApp     [birme  ] │
│   Full Stack             Portafolio                                 │
│                          Contacto                                   │
│                                                                     │
│─────────────────────────────────────────────────────────────────────│
│  © 2026 Angel David Onesto Frias    Privacidad  |  Terminos        │
└─────────────────────────────────────────────────────────────────────┘
```
- Fondo: `--bg-surface`, borde superior: 1px solid `--border`
- 4 columnas desktop, 2 columnas tablet, 1 columna mobile (apilado)
- Links en `--text-secondary`, hover `--primary`
- Copyright en `--text-muted`

---

## SITIO PUBLICO

---

### VISTA 1 — Landing Page (Inicio)
**Ruta:** `/`
**Proposito:** Primera impresion, resumen profesional, acceso a todas las secciones

Esta pagina es un scroll vertical continuo con multiples secciones full-height. El fondo es un Canvas 3D fijo (modelo .glb rotando lentamente) que se ve detras de todo el contenido.

#### Seccion 1.1 — Hero

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav: Inicio  Blog  Cursos  Portafolio  Contacto       [Iniciar]   │
│                                                              ●      │
│                                                              ○      │
│                                                              ○      │
│                    Angel David Onesto Frias                   ○      │
│                                                              ○      │
│            Desarrollador Full Stack · Infraestructura        ○      │
│                        & DevOps                              ○      │
│                                                                     │
│         Estudiante de Ingenieria de Software con enfoque            │
│         en desarrollo Full Stack, infraestructura y DevOps.         │
│                                                                     │
│                    ┌──────────────────┐                              │
│                    │   Conoceme  ↓    │                              │
│                    └──────────────────┘                              │
│                                                                     │
│              [GitHub]  [LinkedIn]  [WhatsApp]                        │
│                                                                     │
│  ─────────── linea cyan degradada ─────────────────────────         │
└─────────────────────────────────────────────────────────────────────┘
```
- Fondo: Canvas 3D fijo + overlay gradiente `rgba(0,0,0,0.6)` → `rgba(0,0,0,0.8)`
- Nombre: h1, blanco, 3rem, bold, centrado, `letter-spacing: -1px`
- Subtitulo: h2, `--primary`, 1.3rem, centrado
- Descripcion: `--text-secondary`, 1rem, max-width 600px, centrado
- CTA: boton outline cyan, centrado
- Iconos sociales: 3 iconos en fila (32px), `--text-secondary` hover `--primary`
- Linea inferior: gradiente horizontal cyan → transparente (1px)
- Dot Navigation: fija a la derecha, actualiza segun scroll
- Animacion: Fade secuencial (nombre → subtitulo → desc → boton, delay 0.2s entre cada uno)

**Mobile:** nombre 2rem, subtitulo 1rem, iconos sociales debajo del boton. Sin dot navigation.

#### Seccion 1.2 — Sobre Mi

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                      ┌──────────┐                                   │
│                      │  Avatar  │  (pixel-art, 120px, circular)     │
│                      └──────────┘                                   │
│                                                                     │
│                         Sobre Mi                                    │
│                                                                     │
│    Soy estudiante de Ingenieria en Software y Sistemas ...          │
│    Tengo experiencia practica desarrollando proyectos ...           │
│    Me apasiona disenar sistemas completos ...                       │
│                                                                     │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│    │ Frontend │ │ Backend  │ │  DevOps  │ │   IoT    │ │ Mobile │ │
│    │   icon   │ │   icon   │ │   icon   │ │   icon   │ │  icon  │ │
│    │ React,   │ │ Node,    │ │ Docker,  │ │ ESP32,   │ │ Swift, │ │
│    │ Next.js  │ │ NestJS   │ │ CI/CD    │ │ Arduino  │ │ Kotlin │ │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Titulo: h2, `--primary`, centrado
- Bio: `--text-secondary`, max-width 900px, centrado, `text-align: justify`
- Especialidades: 5 cards en fila horizontal (glassmorphism), cada una con icono (32px) + titulo (blanco) + techs (gris). Hover: glow cyan
- Animacion: whileInView, fade + slide up

**Mobile:** especialidades en grid 2x3 (ultimo centrado) o scroll horizontal

#### Seccion 1.3 — Portafolio (preview)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                  Mi trayectoria en codigo                            │
│                                                                     │
│         Cada proyecto aqui es una historia ...                      │
│                                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│  │  imagen   │ │  imagen   │ │  imagen   │ │  imagen   │   ←  →   │
│  │           │ │           │ │           │ │           │          │
│  │  Proyecto │ │  Proyecto │ │  Proyecto │ │  Proyecto │          │
│  │  Titulo   │ │  Titulo   │ │  Titulo   │ │  Titulo   │          │
│  │           │ │           │ │           │ │           │          │
│  │  desc...  │ │  desc...  │ │  desc...  │ │  desc...  │          │
│  │           │ │           │ │           │ │           │          │
│  │ [tag][tag]│ │ [tag][tag]│ │ [tag][tag]│ │ [tag][tag]│          │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘          │
│                                                                     │
│                    [ Ver todos los proyectos → ]                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Solo muestra 4-6 proyectos destacados (featured=true)
- Carrusel horizontal con scroll-snap
- Boton "Ver todos los proyectos" (outline cyan) → navega a `/portafolio`
- Cards: imagen de fondo con overlay gradiente oscuro, titulo cyan bold en la parte inferior, descripcion blanca truncada, tags como chips abajo

**Mobile:** 1 card visible a la vez, swipe horizontal

#### Seccion 1.4 — Blog Preview (NUEVA)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                     Ultimas publicaciones                           │
│                                                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │   imagen     │  │   imagen     │  │   imagen     │             │
│   │   16:9       │  │   16:9       │  │   16:9       │             │
│   │ [Categoria]  │  │ [Categoria]  │  │ [Categoria]  │             │
│   │              │  │              │  │              │             │
│   │ Titulo del   │  │ Titulo del   │  │ Titulo del   │             │
│   │ Post         │  │ Post         │  │ Post         │             │
│   │              │  │              │  │              │             │
│   │ Excerpt del  │  │ Excerpt del  │  │ Excerpt del  │             │
│   │ post ...     │  │ post ...     │  │ post ...     │             │
│   │              │  │              │  │              │             │
│   │ 📅 12 Jun  ⏱ 5min │           │  │              │             │
│   └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│                      [ Ver todo el blog → ]                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Grid 3 columnas desktop, 1 mobile
- Muestra los 3 posts mas recientes con status=published
- Card: fondo `--bg-surface`, imagen 16:9 arriba, badge de categoria (color de la categoria) superpuesto en esquina, titulo blanco bold, excerpt gris truncado 3 lineas, meta inferior (fecha + reading time)
- Boton outline cyan para ver mas

#### Seccion 1.5 — Cursos Preview (NUEVA)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                       Aprende conmigo                               │
│                                                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │   imagen     │  │   imagen     │  │   imagen     │             │
│   │ [Principian] │  │ [Intermedio] │  │ [Avanzado]   │             │
│   │       [FREE] │  │     [$299]   │  │       [FREE] │             │
│   │              │  │              │  │              │             │
│   │ Titulo del   │  │ Titulo del   │  │ Titulo del   │             │
│   │ Curso        │  │ Curso        │  │ Curso        │             │
│   │              │  │              │  │              │             │
│   │ Descripcion  │  │ Descripcion  │  │ Descripcion  │             │
│   │ corta...     │  │ corta...     │  │ corta...     │             │
│   │              │  │              │  │              │             │
│   │ ⏱ 4h  📚 12 lec  ★★★★☆ (24)  │  │              │             │
│   └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│                     [ Explorar cursos → ]                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Grid 3 columnas desktop, carrusel horizontal mobile
- Muestra cursos destacados con status=published
- Card: imagen 16:9, badge nivel (verde=beginner, amarillo=intermediate, rojo=advanced) esquina superior izquierda, badge precio esquina superior derecha ("Gratis" verde o "$XXX" blanco), titulo, excerpt, stats (duracion + lecciones + rating)
- Cursos coming_soon: card con opacidad 0.6, badge "PROXIMAMENTE" superpuesto

#### Seccion 1.6 — Newsletter (NUEVA)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          fondo: --bg-surface                        │
│                                                                     │
│            Mantente al dia                                          │
│    Recibe los ultimos posts y cursos en tu correo                   │
│                                                                     │
│        ┌──────────────────────────┐ ┌─────────────┐                │
│        │  tu@email.com            │ │ Suscribirme │                │
│        └──────────────────────────┘ └─────────────┘                │
│                                                                     │
│            Sin spam. Cancela cuando quieras.                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Fondo: `--bg-surface` para diferenciarse del negro base
- Centrado, max-width 600px
- Input + boton en linea (desktop), apilados (mobile)
- Texto legal en `--text-muted`, 0.75rem

**Estados:**
- Default: input vacio
- Loading: boton muestra spinner
- Success: input reemplazado por "Gracias por suscribirte" con check verde
- Error: borde rojo en input + mensaje de error debajo

#### Seccion 1.7 — Contacto

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ┌─────────────────────┐    ┌────────────────────────────────┐     │
│   │ │ Correo             │    │        Contactame              │     │
│   │ │ soyangeldavid1     │    │                                │     │
│   │ │ @gmail.com         │    │  ┌──────────────────────────┐  │     │
│   │ │ Enviame un correo  │    │  │ Tu Nombre Completo       │  │     │
│   │ └────────────────────│    │  └──────────────────────────┘  │     │
│   │                      │    │  ┌──────────────────────────┐  │     │
│   │ │ WhatsApp           │    │  │ Tu Email                 │  │     │
│   │ │ +52 4621581879     │    │  └──────────────────────────┘  │     │
│   │ │ Escribeme por WA   │    │  ┌──────────────────────────┐  │     │
│   │ └────────────────────│    │  │ Tu Mensaje               │  │     │
│   │                      │    │  │                          │  │     │
│   │ │ LinkedIn           │    │  └──────────────────────────┘  │     │
│   │ │ /in/angelonesto    │    │                                │     │
│   │ │ Ver perfil         │    │  ┌──────────────────────────┐  │     │
│   └─────────────────────┘    │  │     Enviar Mensaje        │  │     │
│                               │  └──────────────────────────┘  │     │
│                               └────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- 2 columnas: info (40%) + formulario (60%)
- Tarjetas de info: glassmorphism, borde izquierdo cyan 3px, links cyan
- Formulario: contenedor con borde cyan 1px, border-radius 12px, titulo `--primary`
- Boton enviar: primario cyan, ancho completo

**Mobile:** 1 columna, formulario arriba, info debajo (o viceversa)

**Estados del formulario:**
- Default: campos vacios con placeholders
- Validacion: borde rojo en campo invalido + texto error debajo
- Enviando: boton deshabilitado con spinner + texto "Enviando..."
- Exito: mensaje verde "Mensaje enviado correctamente" + form reseteado
- Error: mensaje rojo "Error al enviar. Intenta de nuevo."

---

### VISTA 2 — Blog: Lista de Posts
**Ruta:** `/blog`
**Proposito:** Explorar y buscar articulos del blog

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                            Blog                                     │
│          Articulos sobre desarrollo, DevOps e IoT                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar articulos...                                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  [Todos] [Frontend] [Backend] [DevOps] [IoT] [General]             │
│                                                                     │
│  Ordenar: [Mas recientes ▾]                   43 articulos          │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   imagen     │  │   imagen     │  │   imagen     │             │
│  │ [DevOps]     │  │ [Frontend]   │  │ [Backend]    │             │
│  │              │  │              │  │              │             │
│  │ Como deployar│  │ React Server │  │ NestJS Guards│             │
│  │ con Docker   │  │ Components   │  │ avanzados    │             │
│  │              │  │              │  │              │             │
│  │ Aprende a    │  │ Todo lo que  │  │ Implementa   │             │
│  │ containeriz..│  │ necesitas... │  │ autorizacion.│             │
│  │              │  │              │  │              │             │
│  │ 📅 Jun 15    │  │ 📅 Jun 10    │  │ 📅 Jun 5     │             │
│  │ ⏱ 8 min      │  │ ⏱ 12 min     │  │ ⏱ 6 min      │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   ...        │  │   ...        │  │   ...        │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│              [ 1 ]  [ 2 ]  [ 3 ]  ...  [ 8 ]  [ → ]               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Footer                                                             │
└─────────────────────────────────────────────────────────────────────┘
```
- Grid 3 columnas desktop, 2 tablet, 1 mobile
- Filtro de categorias: chips horizontales, "Todos" activo por defecto
- Barra de busqueda: full-width, con icono lupa
- Paginacion: botones numerados, 9 posts por pagina
- Card: imagen 16:9, badge categoria, titulo (h3), excerpt (3 lineas max), fecha + reading time
- Si no hay resultados: estado vacio "No se encontraron articulos" con ilustracion

**Mobile:** busqueda full-width, categorias scroll horizontal, grid 1 columna

---

### VISTA 3 — Blog: Post Individual
**Ruta:** `/blog/:slug`
**Proposito:** Lectura completa del articulo

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Blog > Categoria > Titulo del Post   (breadcrumb)                  │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Imagen de Portada 16:9                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [DevOps]  ·  15 de junio, 2026  ·  8 min de lectura               │
│                                                                     │
│  Como Deployar tu Aplicacion                       │ Contenido     ││
│  con Docker y CI/CD                                │               ││
│                                                    │ 1. Intro      ││
│  ┌────┐                                            │ 2. Setup      ││
│  │ Av │ Angel David Onesto Frias                   │ 3. Docker     ││
│  │    │ Desarrollador Full Stack                   │ 4. CI/CD      ││
│  └────┘                                            │ 5. Deploy     ││
│  ──────────────────────────────────                │ 6. Conclusion ││
│                                                    │               ││
│  ## Introduccion                                   │  (sticky,     ││
│                                                    │   desktop     ││
│  Lorem ipsum dolor sit amet, consectetur           │   only)       ││
│  adipiscing elit. Sed do eiusmod tempor...         │               ││
│                                                                     │
│  ```javascript                                                      │
│  const app = express();                                             │
│  app.listen(3000);                                                  │
│  ```                                                                │
│                                                                     │
│  ## Setup del proyecto                                              │
│  ...                                                                │
│  (contenido markdown renderizado)                                   │
│  ...                                                                │
│                                                                     │
│  ──────────────────────────────────                                 │
│  Tags: [Docker] [CI/CD] [GitHub Actions] [NestJS]                   │
│                                                                     │
│  ♥ 24 likes    [ ♥ Me gusta ]                                      │
│                                                                     │
│  ┌─────────────────────┐        ┌─────────────────────┐            │
│  │ ← Post anterior     │        │  Post siguiente →    │            │
│  │ "Titulo del post"   │        │  "Titulo del post"   │            │
│  └─────────────────────┘        └─────────────────────┘            │
│                                                                     │
│  ────── Comentarios (12) ──────                                     │
│                                                                     │
│  ┌────┐ ┌──────────────────────────────────────────┐               │
│  │ Av │ │ Escribe un comentario...                  │               │
│  └────┘ └──────────────────────────────────────────┘ [Comentar]    │
│                                                                     │
│  ┌────┐ Usuario1 · hace 2 horas                                    │
│  │ Av │ Excelente articulo, me ayudo mucho con...                   │
│  └────┘ ♥ 3  · Responder                                           │
│         │                                                           │
│         ├─┌────┐ Angel David · hace 1 hora                         │
│         │ │ Av │ Gracias! Me alegra que te sirviera.               │
│         │ └────┘ ♥ 1  · Responder                                  │
│                                                                     │
│  ────── Tambien te puede interesar ──────                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Post rel. 1  │  │ Post rel. 2  │  │ Post rel. 3  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Footer                                                             │
└─────────────────────────────────────────────────────────────────────┘
```
- Contenido: max-width 720px centrado
- Sidebar derecha (desktop): tabla de contenidos sticky, generada desde headings h2/h3
- Imagen portada: ancho completo del contenedor
- Breadcrumb: `--text-muted`, separado por ">"
- Meta: badge categoria + fecha + reading time
- Autor: avatar 48px + nombre + titulo
- Contenido markdown: headings blancos, body gris, code blocks con fondo `--bg-surface-2` + syntax highlighting (tema oscuro), imagenes con border-radius 8px
- Tags: chips al final
- Likes: icono corazon + contador, boton para dar like (requiere login)
- Navegacion: cards anterior/siguiente con titulo truncado
- Comentarios: textarea + boton, lista con respuestas anidadas 1 nivel (indentadas con linea vertical `--border`)
- Si no logueado: en lugar del textarea, mensaje "Inicia sesion para comentar" con link

**Mobile:** sin sidebar de contenidos, imagen full-width, meta apilado

---

### VISTA 4 — Cursos: Catalogo
**Ruta:** `/cursos`
**Proposito:** Explorar cursos disponibles

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                           Cursos                                    │
│       Aprende desarrollo, infraestructura y mas con                 │
│                   proyectos reales                                  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar cursos...                                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Categoria: [Todas ▾]   Nivel: [Todos ▾]   Precio: [Todos ▾]      │
│                                                                     │
│  Ordenar: [Mas recientes ▾]                    12 cursos            │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │     imagen       │  │     imagen       │  │     imagen       │  │
│  │ [Principiante]   │  │ [Intermedio]     │  │ [Avanzado]       │  │
│  │          [GRATIS]│  │          [$499]  │  │          [GRATIS]│  │
│  │                  │  │                  │  │                  │  │
│  │ NestJS desde     │  │ Docker &         │  │ CI/CD con GitHub │  │
│  │ Cero             │  │ Kubernetes       │  │ Actions          │  │
│  │                  │  │                  │  │                  │  │
│  │ Aprende a crear  │  │ Domina la        │  │ Automatiza tus   │  │
│  │ APIs REST...     │  │ orquestacion...  │  │ deploys...       │  │
│  │                  │  │                  │  │                  │  │
│  │ ⏱ 12h  📚 45 lec│  │ ⏱ 8h  📚 30 lec │  │ ⏱ 6h  📚 22 lec │  │
│  │ ★★★★★ (48)      │  │ ★★★★☆ (23)      │  │ ★★★★★ (67)      │  │
│  │                  │  │                  │  │                  │  │
│  │ 👤 Angel Onesto  │  │ 👤 Angel Onesto  │  │ 👤 Angel Onesto  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                     │
│              [ 1 ]  [ 2 ]  [ → ]                                   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Footer                                                             │
└─────────────────────────────────────────────────────────────────────┘
```
- Grid 3 columnas desktop, 2 tablet, 1 mobile
- Filtros en fila: dropdowns para categoria, nivel, precio
- Badges de nivel: verde `--success` (Principiante), amarillo `--warning` (Intermedio), rojo `--error` (Avanzado)
- Badge precio: esquina superior derecha, "GRATIS" en verde o monto en blanco
- Rating: estrellas amarillas rellenas/vacias + conteo entre parentesis
- Stats: iconos pequenos + texto `--text-muted`
- Cursos coming_soon: overlay semitransparente + badge "PROXIMAMENTE" centrado, no clicable
- Si no hay cursos: estado vacio "Proximamente nuevos cursos" con ilustracion

---

### VISTA 5 — Cursos: Detalle de Curso
**Ruta:** `/cursos/:slug`
**Proposito:** Informacion completa del curso y boton de inscripcion

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Cursos > NestJS desde Cero   (breadcrumb)                          │
│                                                                     │
│  ┌─────────────────────────────────────────┐ ┌────────────────────┐ │
│  │                                         │ │                    │ │
│  │  NestJS desde Cero: APIs               │ │  GRATIS            │ │
│  │  REST Profesionales                     │ │                    │ │
│  │                                         │ │  ┌──────────────┐ │ │
│  │  Aprende a construir APIs REST          │ │  │ Inscribirme  │ │ │
│  │  escalables y profesionales con         │ │  └──────────────┘ │ │
│  │  NestJS, TypeScript y MongoDB.          │ │                    │ │
│  │                                         │ │  ──────────────── │ │
│  │  [Principiante] ⏱ 12h  📚 45 lec       │ │  📖 45 lecciones  │ │
│  │  👥 234 inscritos  ★★★★★ (48)          │ │  ⏱  12 horas      │ │
│  │                                         │ │  📊 Principiante  │ │
│  │  ─────────────────────────              │ │  🌐 Espanol       │ │
│  │                                         │ │  📅 Actualizado   │ │
│  │  [Descripcion] [Temario] [Resenas]      │ │     Jun 2026      │ │
│  │                                         │ │                    │ │
│  │  ── Tab Descripcion ──                  │ │  ──────────────── │ │
│  │                                         │ │  Incluye:         │ │
│  │  Descripcion larga del curso en         │ │  ✓ Acceso de por  │ │
│  │  markdown renderizado...                │ │    vida            │ │
│  │                                         │ │  ✓ Certificado    │ │
│  │  Lo que aprenderas:                     │ │  ✓ Recursos       │ │
│  │  ✅ Crear APIs REST con NestJS          │ │    descargables   │ │
│  │  ✅ Autenticacion JWT                   │ │  ✓ Codigo fuente  │ │
│  │  ✅ Conectar MongoDB                    │ │                    │ │
│  │  ✅ Deploy en produccion                │ │  ──────────────── │ │
│  │                                         │ │  👤 Instructor    │ │
│  │  Requisitos:                            │ │  ┌──┐ Angel David │ │
│  │  • JavaScript basico                    │ │  │Av│ Onesto Frias│ │
│  │  • Conocimiento de Node.js              │ │  └──┘ Full Stack  │ │
│  │                                         │ │       Developer   │ │
│  │  Tecnologias:                           │ │                    │ │
│  │  [NestJS] [TypeScript] [MongoDB]        │ └────────────────────┘ │
│  │  [JWT] [Swagger]                        │                        │
│  │                                         │                        │
│  │  ── Tab Temario ──                      │                        │
│  │                                         │                        │
│  │  ▼ Modulo 1: Introduccion (5 lec, 45m) │                        │
│  │    ├ 📹 Bienvenida al curso    (5m) [P] │                        │
│  │    ├ 📹 Que es NestJS?         (12m)[P] │                        │
│  │    ├ 📹 Instalacion            (8m) 🔒  │                        │
│  │    ├ 📝 Arquitectura           (10m)🔒  │                        │
│  │    └ 📹 Primer endpoint        (10m)🔒  │                        │
│  │                                         │                        │
│  │  ▶ Modulo 2: Controllers (8 lec, 1.2h) │                        │
│  │  ▶ Modulo 3: Services (6 lec, 55m)     │                        │
│  │  ▶ Modulo 4: MongoDB (7 lec, 1.5h)     │                        │
│  │  ...                                    │                        │
│  │                                         │                        │
│  │  ── Tab Resenas ──                      │                        │
│  │                                         │                        │
│  │  ★★★★★ 4.8/5  (48 resenas)             │                        │
│  │  ★★★★★ ████████████████ 38             │                        │
│  │  ★★★★  ████████ 7                      │                        │
│  │  ★★★   ██ 2                             │                        │
│  │  ★★    █ 1                              │                        │
│  │  ★     0                                │                        │
│  │                                         │                        │
│  │  ┌────┐ Maria Lopez · ★★★★★            │                        │
│  │  │ Av │ Excelente curso, muy bien       │                        │
│  │  └────┘ explicado. Lo recomiendo 100%.  │                        │
│  │                                         │                        │
│  │  ┌────┐ Carlos Ruiz · ★★★★☆            │                        │
│  │  │ Av │ Muy bueno, solo le falta mas    │                        │
│  │  └────┘ sobre testing.                  │                        │
│  │                                         │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Footer                                                             │
└─────────────────────────────────────────────────────────────────────┘
```
- 2 columnas: contenido (65%) + sidebar sticky (35%)
- Tabs: Descripcion | Temario | Resenas (subrayado cyan en tab activo)
- Temario: acordeon expandible, [P] = preview gratuita (verde, clicable), candado = requiere inscripcion
- Sidebar sticky: card con fondo `--bg-surface`, borde `--border`
- Boton CTA principal: cyan, ancho completo, prominente
- Si inscrito: boton cambia a "Continuar aprendiendo" + barra de progreso
- Si no logueado: "Inicia sesion para inscribirte"

**Mobile:** sidebar se convierte en barra fija inferior:
```
┌─────────────────────────────────────────────────────────────────────┐
│  GRATIS         [ Inscribirme ]                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### VISTA 6 — Cursos: Leccion
**Ruta:** `/cursos/:slug/leccion/:lessonSlug`
**Acceso:** Inscrito o leccion con isFree=true

```
┌────────────────────────────────────────────────────────────────────────┐
│  ← Volver al curso          NestJS desde Cero         [Avatar▾]      │
├───────────┬────────────────────────────────────────────────────────────┤
│           │                                                            │
│  Progreso │  ┌──────────────────────────────────────────────────────┐ │
│  ████ 35% │  │                                                      │ │
│           │  │              REPRODUCTOR DE VIDEO                    │ │
│  ▼ Mod 1  │  │                                                      │ │
│  ✅ Bienve│  │              16:9 aspect ratio                       │ │
│  ✅ Que es│  │              controles de video                      │ │
│  ● Instal │  │                                                      │ │
│    Arquit │  └──────────────────────────────────────────────────────┘ │
│    Primer │                                                            │
│           │  Leccion 3: Instalacion del entorno                       │
│  ▶ Mod 2  │  Duracion: 8 minutos                                     │
│  ▶ Mod 3  │                                                            │
│  ▶ Mod 4  │  ──────────────────────────────────                       │
│           │                                                            │
│           │  ## Notas de la leccion                                    │
│           │                                                            │
│           │  Contenido markdown con instrucciones...                   │
│           │                                                            │
│           │  ### Recursos                                              │
│           │  📄 Guia de instalacion.pdf        [Descargar]            │
│           │  🔗 Documentacion oficial NestJS   [Abrir]                │
│           │                                                            │
│           │  ──────────────────────────────────                       │
│           │                                                            │
│           │  ┌─────────────┐  ┌───────────────────┐  ┌─────────────┐ │
│           │  │ ← Anterior  │  │ Marcar completada │  │ Siguiente → │ │
│           │  └─────────────┘  └───────────────────┘  └─────────────┘ │
│           │                                                            │
│           │  ────── Dudas sobre esta leccion (5) ──────               │
│           │                                                            │
│           │  (sistema de comentarios igual que blog)                   │
│           │                                                            │
├───────────┴────────────────────────────────────────────────────────────┤
```
- Nav superior simplificado: flecha volver + titulo del curso + avatar
- Sidebar izquierda (250px, desktop): progreso circular/barra + lista de modulos/lecciones
  - Leccion completada: icono check verde ✅
  - Leccion actual: punto cyan ●
  - Leccion pendiente: texto `--text-muted`
- Video: reproductor 16:9, controles nativos o personalizados
- Tipo texto: markdown renderizado en lugar del video
- Tipo quiz: preguntas con opciones + feedback
- Boton "Marcar completada": cyan, al presionar anima check + actualiza sidebar
- Navegacion: anterior/siguiente leccion

**Mobile:** sidebar se oculta, accesible via boton hamburger que abre drawer. Video full-width.

---

### VISTA 7 — Portafolio Completo
**Ruta:** `/portafolio`
**Proposito:** Todos los proyectos con filtros avanzados

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                        Portafolio                                   │
│     Todos los proyectos que he desarrollado                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      Panel de Filtros                         │  │
│  │  🔍 Buscar por nombre, descripcion o tecnologia...            │  │
│  │                                                               │  │
│  │  [Java] [React] [Firebase] [Node.js] [Express] [MongoDB]     │  │
│  │  [Docker] [ESP32] [NestJS] [Swift] [Android] [Next.js] ...   │  │
│  │                                                               │  │
│  │  Ordenar: [Mas recientes ▾]   ☐ Solo con demo   [Limpiar]   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   imagen     │  │   imagen     │  │   imagen     │             │
│  │              │  │              │  │              │             │
│  │  Proyecto 1  │  │  Proyecto 2  │  │  Proyecto 3  │             │
│  │  desc...     │  │  desc...     │  │  desc...     │             │
│  │ [tag][tag]   │  │ [tag][tag]   │  │ [tag][tag]   │             │
│  │ Fullstack    │  │ IoT · 2025   │  │ Web · 2024   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   ...        │  │   ...        │  │   ...        │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Footer                                                             │
└─────────────────────────────────────────────────────────────────────┘
```
- Mismo sistema de filtros que el actual pero en pagina dedicada
- Grid vertical 3 columnas (en vez de carrusel horizontal)
- Card: imagen de fondo con gradient overlay, titulo cyan, desc blanca, tags chips, tipo + fecha
- Click en card → navega a `/portafolio/:slug`

---

### VISTA 8 — Portafolio: Detalle de Proyecto
**Ruta:** `/portafolio/:slug`
**Proposito:** Pagina dedicada del proyecto (SEO-friendly)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Portafolio > Clima Aula   (breadcrumb)                             │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Imagen/Video principal del proyecto                │ │
│  │                        16:9                                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  (thumbnails)       │
│  │ img1 │ │ img2 │ │ vid1 │ │ img3 │ │ img4 │                     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                     │
│                                                                     │
│  Clima Aula (Monitor Ambiental IoT + Analytics)                     │
│  IoT · Fullstack · 15 de marzo, 2025                                │
│                                                                     │
│  [ESP32] [Arduino] [BME680] [Node.js] [Express] [React] [MongoDB] │
│                                                                     │
│  ──────────────────────────────────                                 │
│                                                                     │
│  Sistema IoT + Web que monitorea en tiempo real las                 │
│  condiciones ambientales de un aula, analiza cumplimiento           │
│  normativo y se despliega automaticamente via CI/CD...              │
│  (descripcion completa en markdown)                                 │
│                                                                     │
│  ──────────────────────────────────                                 │
│                                                                     │
│  Enlaces:                                                           │
│  [🌐 Demo]  [📦 Frontend]  [📦 Backend]  [📦 Hardware]  [🚀 Deploy] │
│                                                                     │
│  Credenciales de prueba:                                            │
│  Email: test@test.com | Password: demo123                           │
│                                                                     │
│  ← Volver al portafolio                                             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Footer                                                             │
└─────────────────────────────────────────────────────────────────────┘
```
- Media principal grande con galeria de thumbnails debajo (click cambia media principal)
- Tags como chips
- Links como botones/iconos
- Markdown renderizado para descripcion

---

### VISTA 9 — Login
**Ruta:** `/login`

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global (simplificado: solo logo + link Inicio)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    ┌──────────────────────────┐                     │
│                    │                          │                     │
│                    │      Iniciar Sesion      │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 📧 tu@email.com    │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 🔒 Contrasena   👁 │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ☐ Recordarme            │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │  Iniciar Sesion    │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  Olvidaste tu contrasena? │                     │
│                    │                          │                     │
│                    │  ────── o ──────         │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 🐙 Continuar con   │  │                     │
│                    │  │    GitHub           │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 🔵 Continuar con   │  │                     │
│                    │  │    Google           │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  No tienes cuenta?       │                     │
│                    │  Registrate              │                     │
│                    │                          │                     │
│                    └──────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Card central: glassmorphism, max-width 420px, centrado vertical y horizontal
- Boton GitHub: fondo `#24292e`, icono GitHub, texto blanco
- Boton Google: fondo blanco, icono Google, texto negro
- Link "Olvidaste tu contrasena" y "Registrate" en `--primary`

**Estados:**
- Error login: borde rojo en inputs + mensaje "Email o contrasena incorrectos" en rojo debajo
- Loading: boton con spinner + deshabilitado
- Success: redirige a pagina anterior o a `/`

---

### VISTA 10 — Registro
**Ruta:** `/registro`

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global simplificado                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    ┌──────────────────────────┐                     │
│                    │                          │                     │
│                    │      Crear Cuenta        │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 👤 Nombre completo │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 📧 tu@email.com    │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 🔒 Contrasena   👁 │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │  [░░░░░░░░░░] Debil      │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 🔒 Confirmar       │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ☑ Acepto terminos y     │                     │
│                    │    politica de privacidad │                     │
│                    │  ☑ Suscribirme al        │                     │
│                    │    newsletter             │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │   Crear Cuenta     │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ────── o ──────         │                     │
│                    │  [GitHub] [Google]       │                     │
│                    │                          │                     │
│                    │  Ya tienes cuenta?       │                     │
│                    │  Inicia sesion            │                     │
│                    │                          │                     │
│                    └──────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Indicador de fuerza de contrasena: barra con colores (rojo=debil, amarillo=media, verde=fuerte)
- Checkbox "newsletter" pre-marcado por defecto
- Validacion en tiempo real: borde verde si valido, rojo si invalido + mensaje

---

### VISTA 11 — Perfil del Usuario
**Ruta:** `/perfil`
**Acceso:** Autenticado

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌───────────────────────────────────────────┐   │
│  │               │  │                                           │   │
│  │   ┌──────┐    │  │  [Mi Perfil]  [Mis Cursos]  [Config]     │   │
│  │   │Avatar│    │  │                                           │   │
│  │   │ 80px │    │  │  ── Tab Mi Perfil ──                     │   │
│  │   └──────┘    │  │                                           │   │
│  │               │  │  ┌──────────────────────────────────────┐ │   │
│  │  Angel David  │  │  │ Nombre: [Angel David Onesto Frias ] │ │   │
│  │  Onesto Frias │  │  │ Email:  [soyangel...@gmail.com    ] │ │   │
│  │               │  │  │ Bio:    [Desarrollador Full Stack  ] │ │   │
│  │  subscriber   │  │  │         [apasionado por...         ] │ │   │
│  │               │  │  │ Avatar: [Cambiar imagen]            │ │   │
│  │  ─────────    │  │  └──────────────────────────────────────┘ │   │
│  │  Mi Perfil    │  │                                           │   │
│  │  Mis Cursos   │  │  [Guardar cambios]                       │   │
│  │  Configuracion│  │                                           │   │
│  │  ─────────    │  │  ── Tab Mis Cursos ──                    │   │
│  │  Cerrar sesion│  │                                           │   │
│  │               │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │
│  └──────────────┘  │  │  imagen  │ │  imagen  │ │  imagen  │ │   │
│                     │  │ NestJS   │ │ Docker   │ │ CI/CD    │ │   │
│                     │  │ ████ 75% │ │ ██ 30%   │ │ Completo │ │   │
│                     │  │[Continuar│ │[Continuar│ │[Certific]│ │   │
│                     │  └──────────┘ └──────────┘ └──────────┘ │   │
│                     │                                           │   │
│                     │  ── Tab Configuracion ──                  │   │
│                     │                                           │   │
│                     │  Cambiar contrasena:                      │   │
│                     │  [Contrasena actual     ]                 │   │
│                     │  [Nueva contrasena      ]                 │   │
│                     │  [Confirmar contrasena   ]                │   │
│                     │  [Cambiar contrasena]                     │   │
│                     │                                           │   │
│                     │  Notificaciones:                          │   │
│                     │  ☑ Email de nuevos posts                 │   │
│                     │  ☑ Email de nuevos cursos                │   │
│                     │                                           │   │
│                     │  Zona de peligro:                         │   │
│                     │  [Eliminar mi cuenta] (rojo)             │   │
│                     │                                           │   │
│                     └───────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Footer                                                             │
└─────────────────────────────────────────────────────────────────────┘
```
- Sidebar izquierda con avatar e info basica
- Tabs de contenido
- Mis Cursos: grid de cursos con barra de progreso + porcentaje
- Si no hay cursos: estado vacio "Aun no estas inscrito en ningun curso" + CTA "Explorar cursos"
- "Eliminar cuenta": boton rojo outline, abre modal de confirmacion con input "escribe ELIMINAR para confirmar"

**Mobile:** sidebar colapsa arriba como header del perfil, tabs debajo

---

### VISTA 12 — Certificado
**Ruta:** `/certificado/:id`
**Acceso:** Publico (verificable)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global simplificado                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│        ┌─────────────────────────────────────────────────┐         │
│        │  ╔═══════════════════════════════════════════╗   │         │
│        │  ║                                           ║   │         │
│        │  ║          CERTIFICADO DE FINALIZACION      ║   │         │
│        │  ║                                           ║   │         │
│        │  ║    Se certifica que                       ║   │         │
│        │  ║                                           ║   │         │
│        │  ║        Maria Lopez Garcia                ║   │         │
│        │  ║                                           ║   │         │
│        │  ║    ha completado satisfactoriamente       ║   │         │
│        │  ║    el curso                               ║   │         │
│        │  ║                                           ║   │         │
│        │  ║    "NestJS desde Cero: APIs REST          ║   │         │
│        │  ║     Profesionales"                        ║   │         │
│        │  ║                                           ║   │         │
│        │  ║    Duracion: 12 horas | 45 lecciones      ║   │         │
│        │  ║    Fecha: 20 de junio, 2026               ║   │         │
│        │  ║                                           ║   │         │
│        │  ║    ────────────────                        ║   │         │
│        │  ║    Angel David Onesto Frias               ║   │         │
│        │  ║    Instructor                             ║   │         │
│        │  ║                                           ║   │         │
│        │  ║    ID: CERT-2026-0620-A3F8               ║   │         │
│        │  ║    [QR Code]                              ║   │         │
│        │  ║                                           ║   │         │
│        │  ╚═══════════════════════════════════════════╝   │         │
│        └─────────────────────────────────────────────────┘         │
│                                                                     │
│           [Descargar PDF]    [Compartir en LinkedIn]                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- Diseno tipo diploma con borde decorativo cyan doble
- Fondo del certificado: `--bg-surface` con textura sutil
- QR code que apunta a esta misma URL para verificacion
- Botones: "Descargar PDF" (primario) + "Compartir en LinkedIn" (azul LinkedIn)

---

### VISTA 13 — Error 404
**Ruta:** Cualquier ruta invalida

```
┌─────────────────────────────────────────────────────────────────────┐
│  Nav global                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                                                                     │
│                           404                                       │
│                                                                     │
│                   Pagina no encontrada                               │
│                                                                     │
│         La pagina que buscas no existe o fue movida                  │
│                                                                     │
│                   [ Volver al inicio ]                               │
│                                                                     │
│           Blog  ·  Cursos  ·  Portafolio                            │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
- "404" en `--primary`, 6rem, ultra bold
- Subtitulo blanco, descripcion gris
- Fondo: Canvas 3D (si disponible) o gradiente oscuro
- Links sugeridos en `--primary`

---

## PANEL DE ADMINISTRACION

El admin panel usa un layout diferente al sitio publico: sidebar fija izquierda + contenido principal. Tema oscuro consistente con el sitio pero con fondo `--bg-admin`.

### Layout Base Admin

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐┌───────────────────────────────────────────────────┐   │
│ │           ││  Breadcrumb: Admin > Seccion                    │   │
│ │  AO       ││  ─────────────────────────────────────────────   │   │
│ │           ││                                                  │   │
│ │ ──────── ││                                                  │   │
│ │ Dashboard ││              Contenido de la vista              │   │
│ │ Blog      ││              (cambia por vista)                 │   │
│ │ Cursos    ││                                                  │   │
│ │ Proyectos ││                                                  │   │
│ │ Usuarios  ││                                                  │   │
│ │ Comentar. ││                                                  │   │
│ │ Media     ││                                                  │   │
│ │ Config    ││                                                  │   │
│ │ Analytics ││                                                  │   │
│ │ ──────── ││                                                  │   │
│ │ Ver sitio ││                                                  │   │
│ │ ──────── ││                                                  │   │
│ │ [Av] Admin││                                                  │   │
│ │ Cerrar    ││                                                  │   │
│ └──────────┘└───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```
- Sidebar: 250px ancho, fondo `--bg-surface`, fija
- Link activo: fondo `--bg-surface-2` + borde izquierdo `--primary` 3px + texto `--primary`
- Links inactivos: texto `--text-secondary`
- "Ver sitio →": abre frontend en nueva tab
- Contenido: padding 2rem, max-width 1200px

**Mobile admin:** sidebar se oculta, hamburger superior la muestra como drawer

---

### VISTA 14 — Admin: Dashboard
**Ruta:** `/admin`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Dashboard                                             │
│                                                                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │  👥 245     │ │  📝 32      │ │  📚 8       │ │  📈 1,240   │ │
│  │  Usuarios   │ │  Posts      │ │  Cursos    │ │  Inscrip.  │ │
│  │  +12 este   │ │  publicados │ │  activos   │ │  totales   │ │
│  │  mes        │ │             │ │            │ │  +45 mes   │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Visitas ultimos 30 dias                                │  │
│  │  📊 (grafica de linea)                                  │  │
│  │  ▁▂▃▅▆▇█▇▆▅▆▇█▇▅▃▂▃▅▆▇█▇▆▅▄▃▅▆                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────┐ ┌──────────────────────────────┐ │
│  │ Comentarios pendientes  │ │ Ultimos usuarios             │ │
│  │                         │ │                              │ │
│  │ User1: "Excelente..."  │ │ 👤 Maria Lopez  hace 2h     │ │
│  │   en: NestJS desde Cero │ │ 👤 Carlos Ruiz  hace 5h     │ │
│  │   [Aprobar] [Rechazar]  │ │ 👤 Ana Torres   hace 1d     │ │
│  │                         │ │ 👤 Luis Perez   hace 2d     │ │
│  │ User2: "Tengo una..."  │ │ 👤 Sofia Diaz   hace 3d     │ │
│  │   en: Docker Blog Post  │ │                              │ │
│  │   [Aprobar] [Rechazar]  │ │                              │ │
│  └─────────────────────────┘ └──────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Posts mas leidos esta semana                           │  │
│  │  1. Como deployar con Docker ···················· 342   │  │
│  │  2. React Server Components ····················· 289   │  │
│  │  3. NestJS Guards avanzados ····················· 178   │  │
│  │  4. CI/CD con GitHub Actions ···················· 145   │  │
│  │  5. MongoDB Aggregation Pipeline ················ 112   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
- Stats cards: 4 columnas, icono + numero grande + label + delta (verde si positivo, rojo si negativo)
- Grafica: Chart.js o Recharts, tema oscuro, linea `--primary`
- Listas: cards con fondo `--bg-surface`, items separados por borde `--border`

---

### VISTA 15 — Admin: Gestionar Blog
**Ruta:** `/admin/posts`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Blog                                    [+ Nuevo Post]│
│                                                                │
│  🔍 [Buscar posts...     ] Estado: [Todos ▾] Cat: [Todas ▾]  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ☐ │ Img │ Titulo            │ Cat    │Estado │Fecha│Vistas│ │
│  │───┼─────┼───────────────────┼────────┼───────┼─────┼──────│ │
│  │ ☐ │[img]│ Como deployar...  │[DevOps]│🟢 Pub │Jun15│ 342  │ │
│  │ ☐ │[img]│ React Server...   │[Front] │🟢 Pub │Jun10│ 289  │ │
│  │ ☐ │[img]│ Borrador nuevo    │[Back]  │🟡Draft│  -  │  -   │ │
│  │ ☐ │[img]│ MongoDB tips      │[Back]  │⚫ Arch│May20│ 98   │ │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Acciones masivas: [Publicar ▾]         ← 1 2 3 ... 5 →      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
- Tabla con filas hover `--bg-surface-2`
- Badge estado: verde=published, amarillo=draft, gris=archived
- Badge categoria: color de la categoria
- Click en titulo → editar post
- Acciones por fila (visibles en hover o menu "..."): Editar | Ver en sitio | Duplicar | Eliminar
- Eliminar: confirmacion modal "Seguro que deseas eliminar este post?"

---

### VISTA 16 — Admin: Editor de Post
**Ruta:** `/admin/posts/nuevo` o `/admin/posts/:id/editar`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Blog > Nuevo Post           [Guardar borrador] [Publ]│
│                                                                │
│  ┌──────────────────────────────────┐ ┌──────────────────────┐│
│  │                                  │ │                      ││
│  │  ┌────────────────────────────┐  │ │ Publicacion          ││
│  │  │ Titulo del post...        │  │ │ Estado: [Draft ▾]    ││
│  │  └────────────────────────────┘  │ │ Fecha:  [📅 picker] ││
│  │  Slug: como-deployar-con-docker  │ │                      ││
│  │                                  │ │ ──────────────────── ││
│  │  ┌────────────────────────────┐  │ │ Categoria            ││
│  │  │ B I H2 H3 🔗 📷 <> " ≡ ☰ │  │ │ [DevOps ▾]          ││
│  │  │────────────────────────────│  │ │ + Crear nueva        ││
│  │  │                            │  │ │                      ││
│  │  │  Editor de contenido       │  │ │ ──────────────────── ││
│  │  │  (WYSIWYG / Markdown)      │  │ │ Tags                 ││
│  │  │                            │  │ │ [Docker] [CI/CD] [x] ││
│  │  │  Soporta:                  │  │ │ [+ agregar tag    ]  ││
│  │  │  - Headings h2-h4         │  │ │                      ││
│  │  │  - Bold, italic           │  │ │ ──────────────────── ││
│  │  │  - Code blocks + lang     │  │ │ Imagen de portada    ││
│  │  │  - Imagenes (drag&drop)   │  │ │ ┌──────────────────┐ ││
│  │  │  - Links                  │  │ │ │  Arrastra o haz  │ ││
│  │  │  - Listas                 │  │ │ │  click para subir│ ││
│  │  │  - Blockquotes            │  │ │ └──────────────────┘ ││
│  │  │  - Tablas                 │  │ │                      ││
│  │  │                            │  │ │ ──────────────────── ││
│  │  │                            │  │ │ Excerpt (160 chars)  ││
│  │  │                            │  │ │ [Resumen del post  ] ││
│  │  │                            │  │ │ 45/160               ││
│  │  └────────────────────────────┘  │ │                      ││
│  │                                  │ │ ──────────────────── ││
│  │  [Visual] [Markdown] [Preview]   │ │ SEO                  ││
│  │                                  │ │ Meta titulo:         ││
│  └──────────────────────────────────┘ │ [Como deployar...  ] ││
│                                       │ 24/60                ││
│                                       │ Meta descripcion:    ││
│                                       │ [Aprende a deployer] ││
│                                       │ 48/160               ││
│                                       │                      ││
│                                       │ Preview Google:      ││
│                                       │ ┌──────────────────┐ ││
│                                       │ │Como deployar...  │ ││
│                                       │ │angelonesto.com/b │ ││
│                                       │ │Aprende a deploy..│ ││
│                                       │ └──────────────────┘ ││
│                                       └──────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```
- 2 columnas: editor (70%) + sidebar config (30%)
- Editor con toolbar superior y 3 modos (Visual / Markdown / Preview)
- Slug auto-generado desde titulo, editable
- Sidebar scrolleable independiente
- Contadores de caracteres en excerpt y meta fields
- Preview de Google: simulacion visual de resultado de busqueda
- Auto-guardado cada 30 segundos (indicador "Guardado automaticamente" sutil)

---

### VISTA 17 — Admin: Gestionar Cursos
**Ruta:** `/admin/cursos`

Igual que Vista 15 pero con columnas de tabla adaptadas: Titulo | Estado | Nivel | Precio | Inscritos | Rating | Lecciones | Acciones

---

### VISTA 18 — Admin: Editor de Curso
**Ruta:** `/admin/cursos/nuevo` o `/admin/cursos/:id/editar`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Cursos > Nuevo Curso        [Guardar borrador] [Publ]│
│                                                                │
│  [Info General]  [Temario]  [Publicacion]    (tabs/pasos)      │
│                                                                │
│  ── Tab Info General ──                                        │
│                                                                │
│  Titulo: [NestJS desde Cero: APIs REST Profesionales        ]  │
│  Slug:   nestjs-desde-cero-apis-rest-profesionales             │
│                                                                │
│  Descripcion corta (excerpt):                                  │
│  [Aprende a construir APIs REST escalables y profesionales   ] │
│  78/200                                                        │
│                                                                │
│  Descripcion larga:                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Editor markdown (mismo que blog)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Imagen de portada:  [Arrastra o click para subir]             │
│                                                                │
│  Nivel: ○ Principiante  ● Intermedio  ○ Avanzado               │
│                                                                │
│  Precio: ● Gratis  ○ De pago → [$499] [MXN ▾]                 │
│                                                                │
│  Categoria: [Backend ▾]        Tags: [NestJS][TypeScript][+]   │
│                                                                │
│  Lo que aprenderas:                                            │
│  [✅ Crear APIs REST con NestJS                          ] [x] │
│  [✅ Autenticacion JWT                                   ] [x] │
│  [✅ Conectar MongoDB con Mongoose                       ] [x] │
│  [+ Agregar objetivo]                                          │
│                                                                │
│  Requisitos:                                                   │
│  [• JavaScript basico                                    ] [x] │
│  [• Conocimiento de Node.js                              ] [x] │
│  [+ Agregar requisito]                                         │
│                                                                │
│  ── Tab Temario ──                                             │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ≡ Modulo 1: Introduccion                          [🗑]  │  │
│  │   ├ ≡ 📹 Bienvenida al curso       5m  ☑ Preview [🗑]  │  │
│  │   ├ ≡ 📹 Que es NestJS?           12m  ☑ Preview [🗑]  │  │
│  │   ├ ≡ 📹 Instalacion               8m  ☐ Preview [🗑]  │  │
│  │   ├ ≡ 📝 Arquitectura             10m  ☐ Preview [🗑]  │  │
│  │   └ ≡ 📹 Primer endpoint          10m  ☐ Preview [🗑]  │  │
│  │   [+ Agregar leccion]                                    │  │
│  │                                                          │  │
│  │ ≡ Modulo 2: Controllers y Rutas                   [🗑]  │  │
│  │   ├ ...                                                  │  │
│  │   [+ Agregar leccion]                                    │  │
│  │                                                          │  │
│  │ [+ Agregar modulo]                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Al expandir una leccion:                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Titulo: [Bienvenida al curso                         ]  │  │
│  │  Tipo:   [📹 Video ▾]                                    │  │
│  │  Video:  [Subir video] o [URL: https://...            ]  │  │
│  │  Duracion: [5] minutos                                   │  │
│  │  Descripcion/notas: [Editor markdown]                    │  │
│  │  ☑ Vista previa gratuita                                 │  │
│  │  Recursos: [📄 guia.pdf] [x]  [+ Agregar recurso]       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ── Tab Publicacion ──                                         │
│  Estado: [Published ▾]   Fecha: [📅 2026-06-15]               │
│  SEO: Meta titulo, Meta descripcion, Preview Google            │
│  Resumen: 3 modulos, 15 lecciones, 4.5 horas                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
- Drag & drop en modulos y lecciones (icono ≡ como handle)
- Click en leccion la expande inline para editar
- Checkbox "Vista previa gratuita" por leccion
- Calculo automatico de duracion total visible en tab Publicacion

---

### VISTA 19 — Admin: Gestionar Proyectos
**Ruta:** `/admin/proyectos`

Similar a Vista 15 pero con drag & drop para reordenar y toggle de "Destacado" (estrella)

---

### VISTA 20 — Admin: Editor de Proyecto
**Ruta:** `/admin/proyectos/nuevo` o `/admin/proyectos/:id/editar`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Proyectos > Editar             [Guardar] [Publicar]  │
│                                                                │
│  Titulo: [Clima Aula (Monitor Ambiental IoT + Analytics)   ]  │
│  Slug:   clima-aula                                            │
│  Tipo:   [IoT ▾]         Fecha: [📅 2025-03-15]              │
│  ☑ Destacado en inicio                                        │
│                                                                │
│  Descripcion corta:                                            │
│  [Sistema IoT + Web que monitorea en tiempo real...         ]  │
│                                                                │
│  Descripcion larga: [Editor markdown]                          │
│                                                                │
│  Tecnologias: [ESP32][Arduino][Node.js][React][MongoDB] [+]   │
│                                                                │
│  Repositorios:                                                 │
│  Frontend: [https://github.com/SinckCode/...              ]   │
│  Backend:  [https://github.com/SinckCode/...              ]   │
│  Hardware: [https://github.com/SinckCode/...              ]   │
│  Deploy:   [https://github.com/SinckCode/...              ]   │
│                                                                │
│  Demo:     [https://clima.angelonesto.com                 ]   │
│                                                                │
│  Media:                                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────────────┐  │
│  │ img1 │ │ img2 │ │ vid1 │ │ img3 │ │  + Agregar media   │  │
│  │  [x] │ │  [x] │ │  [x] │ │  [x] │ │  (drag & drop)     │  │
│  │  [★] │ │      │ │      │ │      │ │                     │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └────────────────────┘  │
│  (★ = thumbnail principal, drag para reordenar)               │
│                                                                │
│  Credenciales de prueba: ☐ Incluir                             │
│                                                                │
│  SEO: Meta titulo + Meta descripcion + Preview Google          │
│  Estado: [Published ▾]                                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### VISTA 21 — Admin: Gestionar Usuarios
**Ruta:** `/admin/usuarios`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Usuarios                                              │
│                                                                │
│  ┌──────┐ ┌──────┐ ┌──────┐                                  │
│  │ 245  │ │ +12  │ │ Roles│  👑2 admin  ✏3 editor  👤240 sub │
│  │Total │ │ Mes  │ │      │                                   │
│  └──────┘ └──────┘ └──────┘                                  │
│                                                                │
│  🔍 [Buscar...    ]  Rol: [Todos ▾]  Estado: [Todos ▾]       │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Av │ Nombre          │ Email              │Rol   │Fecha │  │
│  │────┼─────────────────┼────────────────────┼──────┼──────│  │
│  │[av]│ Maria Lopez     │ maria@email.com    │[sub] │Jun 20│  │
│  │[av]│ Carlos Ruiz     │ carlos@email.com   │[edit]│Jun 18│  │
│  │[av]│ Ana Torres      │ ana@email.com      │[sub] │Jun 15│  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Al hacer click en un usuario → modal lateral:                 │
│  ┌────────────────────────┐                                   │
│  │ [Avatar grande]        │                                   │
│  │ Maria Lopez            │                                   │
│  │ maria@email.com        │                                   │
│  │ Registrada: Jun 20     │                                   │
│  │ Verificada: ✅         │                                   │
│  │                        │                                   │
│  │ Rol: [subscriber ▾]   │                                   │
│  │ [Guardar cambios]     │                                   │
│  │                        │                                   │
│  │ Cursos inscritos: 3    │                                   │
│  │ - NestJS desde Cero    │                                   │
│  │ - Docker & Kubernetes  │                                   │
│  │ - CI/CD con GH Actions │                                   │
│  │                        │                                   │
│  │ Comentarios: 7         │                                   │
│  │                        │                                   │
│  │ [Desactivar usuario]   │                                   │
│  └────────────────────────┘                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### VISTA 22 — Admin: Moderar Comentarios
**Ruta:** `/admin/comentarios`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Comentarios                                           │
│                                                                │
│  [Pendientes (8)]  [Aprobados]  [Todos]                       │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ┌──┐ Maria Lopez · maria@email.com         hace 2 horas │ │
│  │ │Av│ En: "NestJS desde Cero" (Curso, Leccion 3)         │ │
│  │ └──┘                                                     │ │
│  │ "Excelente explicacion! Solo tengo una duda sobre        │ │
│  │  la configuracion de los pipes..."                       │ │
│  │                                                          │ │
│  │  [✅ Aprobar]  [❌ Rechazar]  [🗑 Eliminar]  [👁 Ver]   │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ ┌──┐ Carlos Ruiz                            hace 5 horas│ │
│  │ │Av│ En: "Como deployar con Docker" (Blog)              │ │
│  │ └──┘                                                     │ │
│  │ "Muy util, lo aplique en mi proyecto y funciono..."      │ │
│  │                                                          │ │
│  │  [✅ Aprobar]  [❌ Rechazar]  [🗑 Eliminar]  [👁 Ver]   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Seleccionar todos: ☐    [Aprobar seleccionados]              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### VISTA 23 — Admin: Biblioteca de Media
**Ruta:** `/admin/media`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Media                              [+ Subir archivo]  │
│                                                                │
│  🔍 [Buscar...  ]  Tipo: [Todos ▾]   Vista: [▦ Grid] [≡ List]│
│                                                                │
│  ── Vista Grid ──                                              │
│                                                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │  📷    │ │  📷    │ │  🎬    │ │  📷    │ │  📄    │      │
│  │ img    │ │ img    │ │ video  │ │ img    │ │ pdf    │      │
│  │        │ │        │ │        │ │        │ │        │      │
│  │hero.jpg│ │post1.  │ │intro.  │ │avatar. │ │guia.   │      │
│  │ 245KB  │ │png 1MB │ │mp4 50M │ │png 32K │ │pdf 2MB │      │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │
│                                                                │
│  Click en archivo → modal:                                     │
│  ┌───────────────────────────────────────────┐                │
│  │  [Preview de la imagen/video]             │                │
│  │                                           │                │
│  │  Nombre: hero.jpg                         │                │
│  │  Tipo: image/jpeg                         │                │
│  │  Tamano: 245 KB                           │                │
│  │  Subido: 15 Jun 2026                      │                │
│  │  URL: https://...                [Copiar] │                │
│  │                                           │                │
│  │  Usado en:                                │                │
│  │  - Post: "Como deployar con Docker"       │                │
│  │  - Curso: "NestJS desde Cero" (portada)   │                │
│  │                                           │                │
│  │  [🗑 Eliminar archivo]                    │                │
│  └───────────────────────────────────────────┘                │
│                                                                │
│  Zona de upload (drag & drop global):                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │     Arrastra archivos aqui o haz click para subir       │ │
│  │     Imagenes (10MB max) · Videos (500MB max) · PDF      │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### VISTA 24 — Admin: Configuracion del Sitio
**Ruta:** `/admin/config`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Configuracion                                         │
│                                                                │
│  [Hero]  [Sobre Mi]  [Contacto]  [SEO]  [Apariencia]         │
│                                                                │
│  ── Tab Hero ──                                                │
│  Nombre:    [Angel David Onesto Frias                      ]   │
│  Subtitulo: [Desarrollador Full Stack · Infraestructura... ]   │
│  Tagline:   [Estudiante de Ingenieria de Software...       ]   │
│  Texto CTA: [Conoceme                                      ]   │
│  [Guardar cambios]                                             │
│                                                                │
│  ── Tab Sobre Mi ──                                            │
│  Avatar: [Cambiar imagen]  [Preview circular]                  │
│  Bio: [Editor markdown]                                        │
│  Especializaciones:                                            │
│    [Frontend][icon ▾] → [React, Next.js, Electron          ]  │
│    [Backend][icon ▾]  → [Node, NestJS, FastAPI              ]  │
│    [+ Agregar]                                                 │
│  [Guardar cambios]                                             │
│                                                                │
│  ── Tab Contacto ──                                            │
│  Email:    [soyangeldavid1@gmail.com                       ]   │
│  WhatsApp: [+52 4621581879                                 ]   │
│  GitHub:   [https://github.com/SinckCode                   ]   │
│  LinkedIn: [https://linkedin.com/in/angelonesto             ]   │
│  [Guardar cambios]                                             │
│                                                                │
│  ── Tab SEO ──                                                 │
│  Titulo del sitio:     [Angel David Onesto Frias | Portfolio]  │
│  Descripcion del sitio: [Portfolio profesional de...        ]  │
│  OG Image por defecto: [Subir imagen]                          │
│  Google Analytics ID:  [G-XXXXXXXXXX                        ]  │
│  Search Console:       [Verificar propiedad]                   │
│  [Guardar cambios]                                             │
│                                                                │
│  ── Tab Apariencia ──                                          │
│  Color primario: [#00b4d8] [🎨 picker]  Preview: ████         │
│  Logo:    [Subir] [Preview]                                    │
│  Favicon: [Subir] [Preview]                                    │
│  Modelo 3D: [Subir .glb] (actual: portafolio.glb, 2.4MB)     │
│  [Guardar cambios]                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
- Cada tab tiene su propio boton "Guardar cambios"
- Los cambios se reflejan en tiempo real en el sitio publico (ISR revalida)

---

### VISTA 25 — Admin: Analytics
**Ruta:** `/admin/analytics`

```
┌────────────────────────────────────────────────────────────────┐
│  Admin > Analytics            [Ultimos 7d ▾] [30d] [90d] [📅]│
│                                                                │
│  ── Trafico ──                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│  │  4,521   │ │  2,340   │ │  8,901   │                      │
│  │ Visitas  │ │ Unicos   │ │ Paginas  │                      │
│  └──────────┘ └──────────┘ └──────────┘                      │
│  [📊 Grafica de linea: visitas por dia]                       │
│                                                                │
│  ── Blog ──                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  5 nuevos│ │  1,230   │ │  342     │ │  18      │        │
│  │  posts   │ │  vistas  │ │ top post │ │ comments │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  [📊 Grafica de barras: vistas por post]                      │
│                                                                │
│  ── Cursos ──                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  45 new  │ │  12      │ │ Leccion  │ │ Distrib. │        │
│  │ inscrip. │ │ completa │ │ mas aband│ │ por nivel│        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  [📊 Grafica circular: distribucion por nivel]                │
│                                                                │
│  ── Usuarios ──                                                │
│  ┌──────────┐ ┌──────────┐                                   │
│  │  +45     │ │  Distrib │                                   │
│  │ registros│ │  por rol │                                   │
│  └──────────┘ └──────────┘                                   │
│  [📊 Grafica de linea: crecimiento de usuarios]              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
- Selector de rango de fechas en la esquina superior
- Graficas con Chart.js/Recharts, tema oscuro, colores `--primary`
- Stats cards con flechas de tendencia (verde arriba, rojo abajo)

---

### VISTA 26 — Forgot Password
**Ruta:** `/forgot-password`

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    ┌──────────────────────────┐                     │
│                    │                          │                     │
│                    │  Recuperar Contrasena    │                     │
│                    │                          │                     │
│                    │  Ingresa tu email y te   │                     │
│                    │  enviaremos un enlace    │                     │
│                    │  para restablecer tu     │                     │
│                    │  contrasena.             │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 📧 tu@email.com    │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ Enviar enlace      │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ← Volver al login       │                     │
│                    │                          │                     │
│                    └──────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Estado enviado:** Input desaparece, muestra "Si existe una cuenta con ese email, recibiras un enlace de recuperacion. Revisa tu bandeja de entrada." con icono de check.

---

### VISTA 27 — Reset Password
**Ruta:** `/reset-password?token=xxx`

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    ┌──────────────────────────┐                     │
│                    │                          │                     │
│                    │    Nueva Contrasena      │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 🔒 Nueva contrase. │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │  [████████░░] Buena      │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ 🔒 Confirmar       │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ Cambiar contrasena │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    └──────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Estado token invalido:** Muestra "El enlace ha expirado o es invalido. Solicita uno nuevo." + link a `/forgot-password`

---

## Resumen de Vistas

| # | Vista | Ruta | Acceso | Tipo |
|---|-------|------|--------|------|
| 1 | Landing (7 secciones) | `/` | Publico | Publico |
| 2 | Blog: Lista | `/blog` | Publico | Publico |
| 3 | Blog: Post | `/blog/:slug` | Publico | Publico |
| 4 | Cursos: Catalogo | `/cursos` | Publico | Publico |
| 5 | Cursos: Detalle | `/cursos/:slug` | Publico | Publico |
| 6 | Cursos: Leccion | `/cursos/:slug/leccion/:lessonSlug` | Inscrito | Publico |
| 7 | Portafolio | `/portafolio` | Publico | Publico |
| 8 | Portafolio: Proyecto | `/portafolio/:slug` | Publico | Publico |
| 9 | Login | `/login` | Publico | Auth |
| 10 | Registro | `/registro` | Publico | Auth |
| 11 | Perfil | `/perfil` | Autenticado | Auth |
| 12 | Certificado | `/certificado/:id` | Publico | Publico |
| 13 | Error 404 | `*` | Publico | Publico |
| 14 | Admin: Dashboard | `/admin` | Admin | Admin |
| 15 | Admin: Blog lista | `/admin/posts` | Admin/Editor | Admin |
| 16 | Admin: Blog editor | `/admin/posts/nuevo` | Admin/Editor | Admin |
| 17 | Admin: Cursos lista | `/admin/cursos` | Admin | Admin |
| 18 | Admin: Curso editor | `/admin/cursos/nuevo` | Admin | Admin |
| 19 | Admin: Proyectos lista | `/admin/proyectos` | Admin | Admin |
| 20 | Admin: Proyecto editor | `/admin/proyectos/nuevo` | Admin | Admin |
| 21 | Admin: Usuarios | `/admin/usuarios` | Admin | Admin |
| 22 | Admin: Comentarios | `/admin/comentarios` | Admin/Editor | Admin |
| 23 | Admin: Media | `/admin/media` | Admin/Editor | Admin |
| 24 | Admin: Configuracion | `/admin/config` | Admin | Admin |
| 25 | Admin: Analytics | `/admin/analytics` | Admin | Admin |
| 26 | Forgot Password | `/forgot-password` | Publico | Auth |
| 27 | Reset Password | `/reset-password` | Publico | Auth |

**Total: 27 vistas** (13 publicas + 3 auth + 11 admin)



