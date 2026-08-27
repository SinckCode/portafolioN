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

## P3 — Conflicto robots.txt con Cloudflare ✅ RESUELTO (sin cambios de código)

### Qué pasa realmente

El feature **"Managed robots.txt"** de Cloudflare (Security Settings → filtro *Bot traffic* → *Set your preference to block training in robots.txt*) **antepone** su bloque al `robots.txt` de la app. No sustituye ni edita el nuestro: concatena ambos en una sola respuesta. Por eso `robots.ts` no puede resolverlo — el bloque de CF se inyecta en el edge, después de que Next.js sirvió el suyo.

### Por qué NO era un problema de indexación

1. **Googlebot no está bloqueado.** La lista de CF cubre solo bots de *entrenamiento*: Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, Google-Extended, GPTBot, meta-externalagent. `Googlebot` no aparece — y `Google-Extended` es Gemini training, no la búsqueda.
2. **Los dos bloques `User-agent: *` no son ambiguos para Google.** Según la spec, los grupos con el mismo token se fusionan internamente. El resultado efectivo es exactamente lo que queríamos:
   - `Allow: /`
   - `Disallow: /admin/`, `/perfil/`, `/api/`
   Y para `/admin/` gana el `Disallow` porque la regla más larga (más específica) tiene precedencia sobre `Allow: /`.
3. **Los crawlers de *respuesta* de IA no están bloqueados.** `OAI-SearchBot`, `PerplexityBot` y `Claude-SearchBot` no están en la lista de CF, así que el contenido sí puede citarse en respuestas de IA.

Neto: la configuración actual equivale a `search=yes, ai-train=no` — se indexa y se puede citar, pero no se usa para entrenar. Es una postura razonable para una marca personal.

### Decisión: opción (c) — dejarlo como está

No requiere cambio de código. `robots.ts` se queda igual.

### Si en el futuro se quiere permitir también el entrenamiento

Es un toggle de dashboard, no automatizable desde este repo (solo hay `cloudflared` en Ansible; Terraform no tiene provider de Cloudflare):

> Cloudflare dashboard → zona `angelonesto.com` → **Security Settings** → filtrar por **Bot traffic** → **Set your preference to block training in robots.txt** → apagar.

Al apagarlo, `robots.txt` pasa a servir únicamente lo que genera `src/app/robots.ts`.

---

## Archivos modificados (commit `a27947e`)

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

---

## Estado final

| Prioridad | Estado | Dónde |
|---|---|---|
| P0 — bailout a CSR | ✅ Resuelto y verificado | commit `a27947e` |
| P1 — `opacity:0` en SSR | ✅ Resuelto y verificado | commit `a27947e` |
| P2 — 404 de favicon | ✅ Resuelto y verificado | commit `a27947e` |
| P3 — robots.txt / Cloudflare | ✅ Resuelto (no requería cambios) | decisión documentada |

### Pendiente de operación

- [ ] `git push` → dispara el CI/CD y despliega el fix
- [ ] Verificar en producción: `curl -s https://angelonesto.com/ | grep -c 'opacity:0'` debe dar **0**, y `/favicon.ico` debe dar **200**
- [ ] Solo **después** de confirmar el despliegue: pedir reindexación en GSC (URL Inspection → Request Indexing) para `https://angelonesto.com/` y reenviar el sitemap

> Pedir reindexación antes del despliegue es contraproducente: Google recrawlearía la versión rota, reconfirmaría "descubierta sin indexar" y se gastaría la cuota diaria de solicitudes manuales.
