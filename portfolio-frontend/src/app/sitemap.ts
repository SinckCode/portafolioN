import { MetadataRoute } from 'next';
import staticProjects from '@/data/projects';

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
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []) as SlugItem[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/portafolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/cursos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/contacto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
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
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/cursos/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...courseRoutes];
}
