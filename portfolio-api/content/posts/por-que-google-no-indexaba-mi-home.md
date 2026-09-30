---
title: "Por qué Google no indexaba mi página de inicio (y no era el render)"
slug: por-que-google-no-indexaba-mi-home
category: desarrollo-web
tags: ["SEO", "Next.js", "Search Console", "Sitemap", "Canonical"]
status: published
publishedAt: 2026-09-30
contentFormat: markdown
excerpt: "Search Console decía 1 página indexada y 26 descubiertas sin indexar. Arreglé el render, pedí reindexación a mano y no pasó nada. Faltaban dos señales que no tienen nada que ver con el contenido."
metaTitle: "Descubierta: actualmente sin indexar — dos causas en Next.js"
metaDescription: "Caso real de SEO en Next.js: el canonical que los componentes de cliente no pueden declarar y un lastmod que miente en cada request. Por qué pedir reindexación no servía."
metaKeywords: ["descubierta actualmente sin indexar", "canonical next js app router", "lastmod sitemap google", "metadata use client", "alternates canonical", "search console no indexa", "sitemap next js"]
---

Search Console llevaba meses diciendo lo mismo: **1 página indexada, 26
descubiertas pero sin indexar**. De un sitio con 28 URLs, Google conocía casi
todas y no había decidido indexar ninguna.

La primera causa la encontré y la arreglé: mi página de inicio hacía *bailout* a
renderizado en cliente, así que Googlebot recibía un cascarón con `opacity: 0` en
el HTML del servidor. Google no indexa una página vacía, y con razón.

Lo verifiqué pidiendo el home como Googlebot: 61 KB de HTML, el `h1` visible, cero
`opacity: 0`, `robots.txt` correcto. Pedí reindexación manual en Search Console.

Y no pasó absolutamente nada.

## Lo que un buen render no arregla

Tardé en entender que había dos problemas distintos. El render resuelto significa
que Google **puede** indexar la página. No le dice **cuál** URL indexar, ni si vale
la pena volver a mirarla.

Ahí estaban los dos fallos que quedaban, y ninguno tiene que ver con el contenido.

## Fallo 1: cuatro de cinco rutas sin canonical

Revisé qué emitía cada ruta principal:

```bash
for p in "/" "/portafolio" "/blog" "/cursos" "/contacto"; do
  echo "$p: $(curl -s "https://angelonesto.com$p" | grep -c 'rel="canonical"')"
done
```

| Ruta | canonical |
|---|:---:|
| `/` | ❌ |
| `/portafolio` | ✅ |
| `/blog` | ❌ |
| `/cursos` | ❌ |
| `/contacto` | ❌ |

Incluida la única para la que había pedido indexación.

La causa en el App Router de Next es sutil. Mi layout raíz define `metadataBase`
pero nunca `alternates`:

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://angelonesto.com'),
  title: { default: '...', template: '%s | ...' },
  // ...nunca alternates
};
```

`metadataBase` solo dice contra qué resolver las URLs relativas. **No genera
ningún canonical.** Si una página no declara `alternates.canonical`, no emite la
etiqueta. `/portafolio` la tenía porque la declaraba en su propio
`generateMetadata`; las otras no.

Y aquí está la trampa que explica por qué eran justo esas tres: `/blog`, `/cursos`
y `/contacto` empiezan con `'use client'`.

**Un componente de cliente no puede exportar `metadata`.** No es un descuido que
se arregle añadiendo el campo: Next simplemente no lo lee. La salida es un layout
de servidor que lo aporte:

```tsx
// app/blog/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: '...',
  alternates: { canonical: '/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

Un layout que solo devuelve `children` y existe únicamente para llevar metadata.
Se ve raro; es el patrón correcto.

Para el home, que sí era componente de servidor, bastó su propio export:

```ts
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};
```

### El detalle de la barra final

Un cuidado: mi sitemap listaba `https://angelonesto.com` sin barra, y yo asumí que
Next resolvería `canonical: '/'` a `https://angelonesto.com/` **con** barra. No lo
hace: normaliza a la raíz desnuda.

Para el root las dos formas son equivalentes y no rompe nada, pero declarar la
misma página de dos maneras en dos archivos distintos es justo la ambigüedad que
estaba intentando quitar. Los dejé iguales.

## Fallo 2: el sitemap decía que todo cambió hace un segundo

Este me gustó más, porque el bug estaba en mi propio código y llevaba meses
sabotéandome sin dejar rastro.

```ts
export const dynamic = 'force-dynamic';

const staticRoutes = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
  { url: `${BASE_URL}/portafolio`, lastModified: new Date(), /* ... */ },
  // ...
];
```

`new Date()` en cada ruta, con `force-dynamic`. Resultado: **cada vez que Google
pedía el sitemap, las 28 URLs declaraban haberse modificado en ese instante**, y
todas con el mismo timestamp al milisegundo.

Google documenta que ignora `lastmod` cuando detecta que es inexacto. Y no es una
penalización arbitraria: si todo cambió siempre, el campo no aporta información
para priorizar. Para un dominio joven, sin autoridad acumulada, esa es justo la
señal que decide a qué URLs les dedica presupuesto de rastreo.

`lastmod` es opcional. **Es mejor no mandarlo que mandarlo mintiendo:**

```ts
const conFecha = (valor?: string) => {
  if (!valor) return {};
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? {} : { lastModified: fecha };
};
```

Las rutas estáticas ya no declaran `lastmod`; las dinámicas usan el `updatedAt`
real de cada documento. De 28 URLs, 23 tienen fecha y son 23 fechas verdaderas.

## La causa de la causa

Y aquí la parte que no habría encontrado si no hubiera tirado del hilo.

Las rutas dinámicas sí usaban `p.updatedAt` de la base de datos. Debería haber
sido honesto. No lo era, porque mi despliegue publica el contenido versionado en
git a la base en cada deploy, y lo hacía así:

```ts
await projectModel.updateOne({ slug }, { $set: documento }, { upsert: true });
```

**Un `$set` idéntico igual mueve `updatedAt`.** Mongo no compara antes de
escribir. Así que en cada despliegue mis 17 proyectos y mis artículos quedaban con
fecha de "ahora", aunque no hubiera cambiado ni una coma. El sitemap solo estaba
reportando fielmente una mentira que yo generaba aguas arriba.

La corrección fue comparar antes de escribir:

```ts
function yaEstaIgual(existente, deseado) {
  if (!existente) return false;
  return Object.keys(deseado).every((clave) => {
    const actual = existente[clave];
    const nuevo = deseado[clave];
    // el schema guarda Date y el seed trae 'YYYY-MM-DD'
    if (actual instanceof Date && typeof nuevo === 'string') {
      return actual.toISOString().slice(0, 10) === nuevo.slice(0, 10);
    }
    return JSON.stringify(actual) === JSON.stringify(nuevo);
  });
}
```

El siguiente despliegue reportó:

```
projects: 0 escritos, 17 sin cambios
Listo: 0 creado(s), 0 actualizado(s), 4 sin cambios.
```

Además de arreglar el `lastmod`, se fueron 21 escrituras inútiles a la base por
cada deploy.

Y de paso salió un tercer defecto en el mismo sitio: el sync de artículos hacía
`publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date()`. Si un
artículo no declaraba la fecha en su frontmatter, **cada sync le reescribía la
fecha de publicación a hoy**.

## Lo que me llevo

**Pedir reindexación antes de arreglar las señales es tirar la cuota.** Google
llegó, vio dos formas de la misma URL sin nada que las desempatara y un `lastmod`
que no le creía, y se fue. La cuota de Inspección de URLs es de unas diez al día:
gástala cuando el terreno esté listo.

**`metadataBase` no es un canonical.** Es el error de lectura más fácil de cometer
en el App Router.

**Si una ruta no puede tener metadata, la culpa suele ser un `'use client'` en lo
alto del archivo.** Y la solución no es quitarlo: es un layout de servidor arriba.

**Desconfía de las fechas que genera tu propio pipeline.** Mi sitemap no mentía
por su cuenta; repetía una fecha falsa que mi despliegue fabricaba. Cuando una
señal automática parece mal, sigue el hilo hasta quién la escribe.
