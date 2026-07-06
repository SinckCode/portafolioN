# Descripcion del Diseno - Portfolio Angel David Onesto Frias

## 1. Vision General

Portfolio personal de una sola pagina (SPA) con tema **dark mode** y estetica futurista/tech. Construido con **React 19** + **Three.js** para un fondo 3D interactivo. La paleta se basa en un unico color acento **cyan (#00b4d8)** sobre fondos negros puros, creando alto contraste y aspecto profesional.

---

## 2. Estructura de Secciones (4 paneles full-height)

| # | Seccion | ID | Contenido principal |
|---|---------|-----|---------------------|
| 1 | **Hero / Inicio** | `home` | Nombre, titulo profesional, CTA |
| 2 | **Sobre Mi** | `about` | Avatar pixel-art, bio, especializaciones |
| 3 | **Portafolio** | `portfolio` | Filtros + carrusel horizontal de 17 proyectos |
| 4 | **Contacto** | `contact` | Info de contacto + formulario EmailJS |

---

## 3. Seccion por Seccion

### 3.1 Hero (Inicio)

- **Layout:** Centrado vertical y horizontal, `min-height: 100vh`
- **Fondo:** Canvas 3D fijo (modelo `.glb` con rotacion continua en eje Y) + gradiente oscuro superpuesto
- **Tipografia:**
  - Nombre: `Inter`, blanco puro, ~3rem, bold, `letter-spacing: -1px`
  - Subtitulo: Cyan `#00b4d8`, ~1.3rem, peso medio
  - Descripcion: Gris claro `#aaa`, texto centrado, max-width limitado
- **CTA:** Boton "Conoceme" con borde cyan, fondo transparente, hover con fondo cyan solido
- **Animacion:** `react-awesome-reveal` Fade con delay escalonado en cada elemento

### 3.2 Sobre Mi

- **Layout:** Contenido centrado, `max-width: 900px`
- **Avatar:** Imagen pixel-art circular con `image-rendering: pixelated`, centrada arriba
- **Titulo:** "Sobre Mi" en cyan, centrado
- **Texto:** 3 parrafos con `text-align: justify`, color `#ccc`
- **Elemento 3D:** Esfera/planeta (parte del canvas de fondo) visible a la derecha
- **Animacion:** Framer Motion `whileInView` con fade + slide desde abajo

### 3.3 Portafolio

- **Titulo:** "Mi trayectoria en codigo" con emoji de gamepad, cyan
- **Subtitulo:** Texto descriptivo en gris
- **Panel de Filtros** (contenedor con fondo `#1a1c22`, bordes redondeados `12px`):
  - Barra de busqueda con icono de lupa
  - Dropdown "Mas recientes" / "Mas antiguos"
  - Checkbox "Solo con demo"
  - Tags de tecnologias en chips con borde gris, scroll horizontal con flechas
  - Barra de scroll personalizada en cyan
- **Carrusel de Proyectos:**
  - Cards horizontales con scroll-snap
  - Cada card: imagen de fondo con overlay gradiente, titulo en cyan bold, descripcion blanca, tags de tecnologias en la parte inferior
  - Hover: elevacion con sombra cyan `0 0 30px rgba(0,180,216,0.3)`
- **Modal de Proyecto:** Pantalla completa con galeria de medios (video + imagenes), thumbnails, enlaces a repos/demos/APIs

### 3.4 Contacto

- **Layout:** 2 columnas (izquierda: info, derecha: formulario)
- **Tarjetas de Info** (izquierda):
  - Correo + WhatsApp en cards con efecto **glassmorphism** (`backdrop-filter: blur(10px)`)
  - Borde izquierdo cyan solido (3px)
  - Enlaces en cyan con hover underline
- **Formulario** (derecha):
  - Contenedor con borde cyan y esquinas redondeadas
  - Titulo "Contactame" en cyan
  - 3 campos: Nombre, Email, Mensaje con bordes cyan sutiles
  - Boton "Enviar Mensaje" con fondo cyan solido, texto oscuro, `border-radius: 8px`
  - Integracion EmailJS para envio real

---

## 4. Navegacion

### Desktop

- Header fijo superior izquierdo: 4 links en blanco, hover cyan
- Dot Navigation derecha: 4 puntos verticales, el activo es cyan (detectado via `IntersectionObserver` al 50%)

### Mobile (<=768px)

- Header y dots ocultos
- Boton flotante circular cyan (72px) en esquina inferior izquierda
- Menu desplegable con glassmorphism

---

## 5. Sistema de Diseno

### Paleta de Colores

| Token | Valor | Uso |
|-------|-------|-----|
| **Primario** | `#00b4d8` | Titulos, enlaces, bordes activos, CTAs |
| **Fondo base** | `#000000` | Body |
| **Superficie** | `#0f1115` / `#1a1c22` | Cards, paneles |
| **Texto primario** | `#ffffff` | Titulos, nombres |
| **Texto secundario** | `#aaaaaa` / `#cccccc` | Descripciones |

### Tipografia

| Propiedad | Valor |
|-----------|-------|
| **Fuente principal** | `Inter` |
| **Fallback** | `Segoe UI`, sans-serif |
| **Peso titulos** | 700 (bold) |
| **Peso cuerpo** | 400 (regular) |
| **Tamano hero** | ~3rem |
| **Tamano subtitulos** | ~1.3rem |
| **Tamano cuerpo** | 1rem (desktop), 0.75-0.9rem (mobile) |

### Espaciado

| Propiedad | Valores |
|-----------|---------|
| **Gap** | `0.5rem`, `1rem`, `1.5rem`, `2rem`, `2.5rem`, `3rem` |
| **Padding** | `1rem`, `1.5rem`, `2rem`, `2.5rem` |
| **Border radius** | `8px` (botones), `12px` (cards), `20px` (pills), `50%` (circulos) |

### Efectos Visuales

| Efecto | Implementacion |
|--------|---------------|
| **Glassmorphism** | `backdrop-filter: blur(6-14px)` + `rgba` con opacidad baja |
| **Glow cyan** | `box-shadow: 0 0 10-30px rgba(0,180,216,0.3-0.6)` |
| **Transicion base** | `all 0.3s ease` |
| **Sombras** | `0 4px 10px`, `0 6px 20px` en rgba negro |

---

## 6. Elemento 3D de Fondo

| Propiedad | Detalle |
|-----------|---------|
| **Motor** | Three.js via `@react-three/fiber` + `@react-three/drei` |
| **Modelo** | `portafolio.glb` cargado con GLTFLoader, auto-centrado y escalado |
| **Camara** | Perspectiva FOV 50, posicion `(0, 1, 5)` |
| **Iluminacion** | Ambient (intensidad 0.6) + Directional (intensidad 0.8) |
| **Interaccion** | OrbitControls con damping habilitado |
| **Rotacion** | Continua `+0.0015 rad/frame` en eje Y |
| **Capa** | `z-index: -1`, posicion fija detras del contenido |

---

## 7. Responsividad

| Breakpoint | Cambios |
|------------|---------|
| **>= 769px (Desktop)** | Header + Dot nav visibles, contacto en 2 columnas, fuentes completas |
| **<= 768px (Mobile)** | Menu flotante, contacto apilado, fuentes reducidas 10-20%, carrusel adapta ancho |

---

## 8. Animaciones

| Libreria | Uso |
|----------|-----|
| **Framer Motion** | Entrada de secciones con `whileInView`, fade + slide |
| **React Awesome Reveal** | Fade escalonado en Hero |
| **GSAP** | Animaciones de alto rendimiento (complementario) |
| **CSS Keyframes** | `fadeIn` (proyectos/modal), `fadeInScale` (menu flotante) |
| **Three.js** | Rotacion continua del modelo 3D + OrbitControls |

---

## 9. Arquitectura de Componentes

```
App.jsx
├── Canvas3D.jsx          (fondo 3D fijo)
├── Header.jsx            (nav desktop)
├── FloatingMenu.jsx      (nav mobile)
├── DotNavigation.jsx     (indicador de seccion)
├── HeroSection.jsx       (id="home")
├── AboutSection.jsx      (id="about")
├── ProjectsSection.jsx   (id="portfolio")
│   ├── FilterPanel.jsx
│   ├── ProjectCard.jsx   (x17 cards)
│   └── ProjectModal.jsx  (overlay detalle)
└── ContactSection.jsx    (id="contact")
```

---

## 10. Stack Tecnico

| Categoria | Tecnologias |
|-----------|-------------|
| **Framework** | React 19.1.0 (Create React App) |
| **3D** | Three.js 0.178, @react-three/fiber 9.1, @react-three/drei 10.3 |
| **Animacion** | Framer Motion 12.20, GSAP 3.13, React Awesome Reveal 4.3 |
| **Navegacion** | React Scroll 1.9 |
| **Email** | EmailJS 4.4 |
| **Estilos** | CSS puro (archivos en `src/estilos/`) |

---

## 11. Archivos de Estilos

```
src/estilos/
├── Header.css
├── HeroSection.css
├── FloatingMenu.css
├── DotNavigation.css
├── AboutSection.css
├── ProjectsSection.css
├── ProjectCard.css
├── ProjectModal.css
├── FilterPanel.css
├── ContactSection.css
└── Canvas3D.css
```
