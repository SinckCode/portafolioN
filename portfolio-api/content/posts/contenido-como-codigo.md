---
title: "Mis 17 proyectos tenían la descripción vacía en producción y nadie lo notó"
slug: contenido-como-codigo
category: desarrollo-web
tags: ["MongoDB", "NestJS", "Contenido", "Git", "Deploy", "Debugging"]
status: published
publishedAt: 2026-09-30
contentFormat: markdown
excerpt: "El fallback que puse para que la página nunca se viera vacía fue exactamente lo que escondió el bug durante meses. Así convertí el contenido en código versionado."
metaTitle: "Contenido como código: git como fuente de verdad de tu CMS"
metaDescription: "Un campo vacío en producción tapado por un fallback estático. Cómo publicar contenido versionado en git a la base en cada deploy, con upsert idempotente que preserva métricas."
metaKeywords: ["contenido versionado git", "seed idempotente mongodb", "fallback estatico oculta bug", "upsert preserva views", "content as code", "nestjs seed deploy"]
---

Mi portafolio muestra 17 proyectos, cada uno con su página de detalle y una
descripción larga. Un día fui a mirar la base de datos de producción:

```
projects: 17 | details min: 0 | max: 0
vacios: optistock, cata-outlet, mi-app-electron, ... (los 17)
```

Los diecisiete con el campo `details` vacío. En producción. Desde siempre.

Y el sitio se veía **bien**. Ahí está lo interesante.

## El fallback que tapó el bug

Cuando construí la capa de datos hice algo que me pareció muy sensato: si la API
no responde, caer a los datos estáticos versionados en el repositorio, para que un
crawler nunca reciba una página vacía.

```ts
export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  try {
    const res = await fetch(`${API_URL}/projects/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // ...
  } catch {
    const fallback = staticProjects.find((p) => p.slug === slug);
    return fallback ? normalizeProject(fallback) : undefined;
  }
}
```

La idea sigue siendo buena. El problema es lo que pasa cuando la API **sí**
responde, pero responde incompleto.

El `catch` nunca se disparó: la API devolvía `200` con un documento válido en el
que `details` era `""`. Así que la página renderizaba el proyecto con su título,
sus imágenes y sus tecnologías, y simplemente no mostraba la descripción larga
porque el componente tiene un guardia razonable:

```tsx
{project.details && (
  <ProjectDetails details={project.details} />
)}
```

Nada falló. No hubo error, ni excepción, ni 500. Un visitante veía una página de
proyecto correcta pero pobre, y yo veía una página que funcionaba.

**Un fallback protege contra la caída total y, al hacerlo, te ciega a la
degradación parcial.** Esa es la lección que me llevo.

## Por qué estaba vacío

El campo existía en el schema y en el seed. Lo que faltaba era que el seed se
ejecutara: mi pipeline de despliegue hacía `git pull → npm ci → build → reload` y
ningún paso publicaba contenido a la base.

O sea: el contenido vivía en el repositorio, escrito y commiteado, y nunca viajaba
a producción. Yo lo daba por hecho.

## Contenido como código

La solución fue tratar el contenido como lo que es: parte del repositorio, con su
historial, y con un paso de publicación explícito en el despliegue.

Dos fuentes:

- `content/projects.json` — las descripciones largas de los proyectos
- `content/posts/*.md` — los artículos del blog, con frontmatter

Y dos pasos nuevos en el pipeline de la API:

```
sync-repo → deps → build → seed-proyectos → sync-posts → reload
```

Lo que más me gustó de esto fue un detalle de implementación. El seed corre con
`ts-node` en desarrollo, lo que en producción obligaría a instalar
devDependencies. Pero el build ya genera `dist/seeds/seed.js`, y resulta que la
ruta al contenido funciona igual desde ahí:

```ts
const ruta = join(__dirname, '..', '..', 'content', 'projects.json');
```

Desde `src/seeds/` y desde `dist/seeds/` son los mismos dos niveles hacia arriba.
Así que en producción corre `node dist/seeds/seed.js --only=projects`, sin
`ts-node`, sin devDependencies, sin sorpresas.

Efecto inmediato: los 17 proyectos pasaron de `details` vacío a entre 844 y 1661
caracteres, y la página de detalle empezó a servir el texto real.

## El bug que introduje al arreglarlo

Aquí viene la parte que no había previsto, y que me parece la más instructiva.

El seed hacía esto:

```ts
await projectModel.updateOne({ slug }, { $set: documento }, { upsert: true });
```

Correcto, idempotente en cuanto al resultado, y **no idempotente en cuanto a los
efectos**. Mongo no compara antes de escribir: un `$set` con valores idénticos
igual actualiza el documento y por tanto **mueve `updatedAt`**.

Mi sitemap usa `updatedAt` como `lastmod`. Así que al poner el seed en cada
despliegue, empecé a decirle a Google que mis 17 proyectos y mis 4 artículos
acababan de cambiar, cada vez que desplegaba cualquier cosa. Google ignora el
`lastmod` cuando detecta que es inexacto — y para un dominio joven esa es
justamente la señal que decide a qué URLs les dedica rastreo.

Arreglé un bug de contenido y me creé uno de SEO.

La corrección es comparar antes de escribir:

```ts
function yaEstaIgual(existente, deseado) {
  if (!existente) return false;
  return Object.keys(deseado).every((clave) => {
    const actual = existente[clave];
    const nuevo = deseado[clave];
    // El schema guarda `date` como Date y el seed lo trae como 'YYYY-MM-DD';
    // sin esto, la fecha pareceria distinta siempre.
    if (actual instanceof Date && typeof nuevo === 'string') {
      return actual.toISOString().slice(0, 10) === nuevo.slice(0, 10);
    }
    return serializar(actual) === serializar(nuevo);
  });
}
```

Ese caso de la fecha es el que casi me hace tirar la idea: el schema guarda un
`Date`, el seed trae un string `YYYY-MM-DD`, y una comparación ingenua los declara
distintos **siempre**. La consecuencia habría sido que el guardia nunca acertara y
todo se reescribiera igual, con la sensación de haberlo resuelto.

Ahora el despliegue reporta:

```
projects: 0 escritos, 17 sin cambios
Listo: 0 creado(s), 0 actualizado(s), 4 sin cambios.
```

## Preservar lo que la base sabe y el repositorio no

Un detalle que hay que diseñar desde el principio: la base tiene datos que el
repositorio no puede tener. Vistas, likes, quién dio like. Si el sync escribe el
documento completo, los borra.

Por eso los scripts hacen `$set` de los campos de contenido y **nunca tocan**
`views`, `likes` ni `likesBy`. Y nunca borran nada: un artículo que exista en la
base y no en `content/posts/` se queda donde está.

En el mismo repaso encontré otro caso del mismo error:

```js
publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
```

Si un artículo no declaraba `publishedAt` en su frontmatter, **cada sync le
reescribía la fecha de publicación a "ahora"**. Un artículo de junio se volvía de
hoy en cada despliegue. Ahora conserva la que ya tenía.

## La contrapartida honesta

Esto tiene un precio que hay que aceptar a la cara: **git gana sobre el panel de
administración**. Si edito un proyecto en `/admin`, el siguiente despliegue de la
API lo revierte a lo que diga el repositorio.

Para mí es la decisión correcta, porque el contenido que me importa es contenido
que quiero revisar en un diff, versionar y poder recuperar. Pero es una decisión,
no una consecuencia técnica inevitable, y quien la tome tiene que saberlo antes de
perder una edición.

## Lo que me llevo

**Los fallbacks esconden degradación.** El mío hizo su trabajo —nunca una página
vacía— y por eso nadie notó durante meses que el contenido real no llegaba. Si
tienes un fallback, necesitas una forma independiente de saber si está actuando.

**Un campo vacío no es un error.** No hay excepción, no hay 500, no hay alerta.
Los bugs de datos no se detectan con monitoreo de errores; se detectan mirando los
datos.

**"Está commiteado" no es "está publicado".** Entre el repositorio y la base tiene
que haber un paso explícito, y si no existe, nadie lo va a echar de menos hasta que
mires.

**Idempotencia no es solo el resultado, también los efectos.** Un `$set` idéntico
parece inofensivo y mueve un timestamp del que dependen otras cosas.
