import { MetadataRoute } from 'next';
import staticProjects from '@/data/projects';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://angelonesto.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface SlugItem {
  slug: string;
  updatedAt?: string;
  publishedAt?: string;
}

// Trae slugs del CMS; si el API no responde, el sitemap sigue funcionando
async function fetchSlugs(path: string): Promise<SlugItem[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * `lastmod` solo se emite cuando hay una fecha real detras.
 *
 * Antes cada ruta llevaba `lastModified: new Date()`, asi que con
 * `force-dynamic` las 28 URLs declaraban haberse modificado en el instante en
 * que Google pedia el sitemap — todas con el mismo timestamp. Google documenta
 * que ignora `lastmod` cuando detecta que es inexacto, y para un dominio joven
 * esa es justo la señal que decide a que URLs les dedica presupuesto de rastreo.
 *
 * `lastmod` es opcional: es mejor no mandarlo que mandarlo mintiendo.
 */
const conFecha = (valor?: string) => {
  if (!valor) return {};
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? {} : { lastModified: fecha };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // El home va sin barra final para coincidir con el canonical que emite
  // page.tsx: Next normaliza `alternates: { canonical: '/' }` a la raiz desnuda
  // (`https://angelonesto.com`), no a `.../`. Para el root las dos formas son
  // equivalentes, pero declarar la misma URL de dos maneras distintas en el
  // sitemap y en el canonical solo invita a confusion.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/portafolio`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/cursos`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/contacto`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Proyectos, posts y cursos: dinámicos desde el CMS, con fallback estático para proyectos
  const [apiProjects, posts, courses] = await Promise.all([
    fetchSlugs('/projects?limit=100'),
    fetchSlugs('/posts?status=published&limit=100'),
    fetchSlugs('/courses?limit=100'),
  ]);

  const projectSlugs: SlugItem[] = apiProjects.length > 0
    ? apiProjects
    : staticProjects.filter((p) => p.slug).map((p) => ({ slug: p.slug! }));

  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((p) => ({
    url: `${BASE_URL}/portafolio/${p.slug}`,
    ...conFecha(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    ...conFecha(p.updatedAt ?? p.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/cursos/${c.slug}`,
    ...conFecha(c.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...courseRoutes];
}
