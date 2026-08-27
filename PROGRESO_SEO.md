# SEO Indexación Fix — angelonesto.com

**Fecha inicio:** 2026-08-20
**Problema:** GSC reporta 1 página indexada, 28 sin indexar (26 descubiertas sin indexar, 1 404, 1 redirección)

---

## P0 — BAILOUT_TO_CLIENT_SIDE_RENDERING ✅ COMPLETO

`page.tsx` era `'use client'` con Canvas3D cargado con `ssr: false`. Next.js abandonaba el server rendering completo. Google veía metadata + JSON-LD pero cero contenido visible.

### Cambios
- `src/app/page.tsx` → convertido a Server Component (sin `'use client'`)
- `src/components/HomeCanvas.tsx` → **nuevo**, aísla Canvas3D + Preloader + estado del modelo (`'use client'`)
- `src/components/HeroSection.tsx` → `initial={false}` elimina `opacity:0` del SSR; prop `modelState` removida

### Resultado
- Home es ○ (Static) en el build
- BAILOUT solo en Canvas3D (decorativo, antes de `<main>`)
- Hero renderiza con `opacity:1;transform:none`

---

## P1 — opacity:0 en secciones below-the-fold ✅ COMPLETO

Framer-motion inyectaba `style="opacity:0;transform:translateY(...)` en 15 elementos del SSR. Google puede ignorar contenido invisible.

### Cambios
- `src/hooks/useScrollReveal.ts` → **nuevo**, hook reutilizable:
  - SSR: sin `initial` ni `animate` inline → no inyecta `opacity:0`
  - Hydration: `controls.set('hidden')` oculta al instante (sin flash)
  - Scroll: `controls.start('visible')` anima la entrada normalmente
- Aplicado en:
  - `src/components/ui/SectionHeading.tsx`
  - `src/components/AboutSection.tsx`
  - `src/components/ProjectsSection.tsx`
  - `src/components/BlogPreviewSection.tsx`
  - `src/components/ContactSection.tsx`

### Resultado
- 0 instancias de `opacity:0` en SSR (antes 15)
- Todas las secciones renderizan contenido visible para Google

---

## P2 — 404 y redirección en GSC ✅ COMPLETO

### Diagnóstico
- **404** = `/favicon.ico` — no existía el archivo, `manifest.json` lo referenciaba
- **Redirección** = trailing slash (`/blog/` → 308 → `/blog`) — comportamiento estándar de Next.js, no requiere fix

### Cambios aplicados
- `public/favicon.svg` → **nuevo** (SVG con "AO" en cyan sobre fondo oscuro)
- `src/app/layout.tsx` → agregado `icons: { icon, shortcut, apple }` apuntando a `/favicon.svg`
- `public/manifest.json` → cambiado de `/favicon.ico` a `/favicon.svg`
- `next.config.ts` → rewrite `/favicon.ico` → `/favicon.svg` para compatibilidad

### Verificación (build local, `next start -p 3099`, 2026-08-27)
- [x] `curl /favicon.ico` → **200**, `content-type: image/svg+xml`, 259 bytes
- [x] `curl /favicon.svg` → **200**
- [x] HTML del servidor incluye `<link rel="icon">`, `<link rel="shortcut icon">` y `<link rel="apple-touch-icon">` apuntando a `/favicon.svg`
- [x] `<link rel="manifest" href="/manifest.json">` presente

También se verificó P0 y P1 en el mismo build:
- [x] Home compila como `○ (Static)` — sin bailout en la ruta
- [x] `BAILOUT_TO_CLIENT_SIDE_RENDERING` aparece en el byte 3491, antes de `<main>` (byte 5898) → solo el Canvas3D decorativo
- [x] **0** ocurrencias de `opacity:0` en el SSR (producción actual: 22)
- [x] `<h1 class="hero-title" style="opacity:1;transform:none">` (producción actual: `opacity:0;transform:translateY(28px)`)
- [x] Jerarquía de headings servida: 1×h1, 5×h2, 18×h3; JSON-LD presente

---

## P3 — Conflicto robots.txt con Cloudflare ❌ PENDIENTE

El `robots.txt` en producción tiene dos bloques `User-agent: *`:

```
# Cloudflare Managed Content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

# App (robots.ts)
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /perfil/
Disallow: /api/
```

Dos bloques `User-agent: *` es ambiguo según la spec. Además Cloudflare bloquea varios crawlers AI (ClaudeBot, GPTBot, etc.).

### Opciones
- (a) Desactivar Cloudflare managed content en el dashboard de CF
- (b) Unificar en un solo bloque desde `robots.ts`
- (c) Aceptar la ambigüedad (Google toma el más específico)

---

## Archivos modificados (sin commit)

| Archivo | Tipo | Prioridad |
|---|---|---|
| `src/app/page.tsx` | Modificado | P0 |
| `src/components/HomeCanvas.tsx` | Nuevo | P0 |
| `src/components/HeroSection.tsx` | Modificado | P0 |
| `src/hooks/useScrollReveal.ts` | Nuevo | P1 |
| `src/components/ui/SectionHeading.tsx` | Modificado | P1 |
| `src/components/AboutSection.tsx` | Modificado | P1 |
| `src/components/ProjectsSection.tsx` | Modificado | P1 |
| `src/components/BlogPreviewSection.tsx` | Modificado | P1 |
| `src/components/ContactSection.tsx` | Modificado | P1 |
| `src/app/layout.tsx` | Modificado | P2 |
| `public/favicon.svg` | Nuevo | P2 |
| `public/manifest.json` | Modificado | P2 |
| `next.config.ts` | Modificado | P2 |
