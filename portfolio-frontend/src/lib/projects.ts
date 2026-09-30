import staticProjects from '@/data/projects';
import { Project } from '@/types';
import { unwrapList } from './envelope';
export { projectKey } from './projectFilters';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// El API pagina en 10 por defecto; sin esto se perdian 7 de los 17 proyectos.
const MAX_PROJECTS = 100;

/**
 * El card formatea la fecha con `new Date(date + 'T00:00:00')`, asi que un
 * datetime ISO completo del API ('2023-04-12T00:00:00.000Z') producia
 * "Invalid Date". Normalizamos todo a 'YYYY-MM-DD'.
 */
const toDateOnly = (value: unknown): string => {
  if (typeof value !== 'string' || value === '') return '';
  return value.slice(0, 10);
};

/**
 * Los repos deberian ser `{ frontend, backend, ... }`, pero en la base hay
 * documentos sembrados con un schema viejo que los guardo como array de
 * subdocumentos. Aceptamos las dos formas para no renderizar objetos como href.
 */
const toRepos = (value: unknown): Record<string, string> => {
  if (Array.isArray(value)) {
    const entries = value
      .filter((item): item is { label?: unknown; url?: unknown } =>
        typeof item === 'object' && item !== null,
      )
      .map((item) => [item.label, item.url])
      .filter(([label, url]) => typeof label === 'string' && typeof url === 'string');
    return Object.fromEntries(entries as [string, string][]);
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([key, url]) => key !== '_id' && typeof url === 'string' && url !== '',
    );
    return Object.fromEntries(entries as [string, string][]);
  }
  return {};
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

/**
 * Deja un documento del API con la misma forma que los datos estaticos, para
 * que los componentes no tengan que defenderse campo por campo.
 */
export function normalizeProject(raw: unknown): Project {
  const p = (raw ?? {}) as Record<string, unknown>;
  return {
    ...(p as unknown as Project),
    title: typeof p.title === 'string' ? p.title : '',
    slug: typeof p.slug === 'string' ? p.slug : undefined,
    description: typeof p.description === 'string' ? p.description : '',
    details: typeof p.details === 'string' ? p.details : '',
    type: typeof p.type === 'string' && p.type !== '' ? p.type : 'Otro',
    date: toDateOnly(p.date),
    technologies: toStringArray(p.technologies),
    images: toStringArray(p.images),
    videos: toStringArray(p.videos),
    demos: toStringArray(p.demos),
    video: typeof p.video === 'string' ? p.video : undefined,
    demo: typeof p.demo === 'string' ? p.demo : undefined,
    repos: toRepos(p.repos),
  };
}

/**
 * Fuente unica de proyectos para el render de servidor. Cae a los datos
 * estaticos versionados si el API no responde, asi que la pagina nunca
 * queda vacia para un crawler.
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_URL}/projects?limit=${MAX_PROJECTS}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = unwrapList<unknown>(await res.json());
    if (items.length === 0) throw new Error('respuesta vacia');
    return items.map(normalizeProject);
  } catch {
    return staticProjects.map(normalizeProject);
  }
}

/** Un proyecto por slug, con el mismo fallback estatico. */
export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  try {
    const res = await fetch(`${API_URL}/projects/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    const project = (raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw) as unknown;
    if (!project) throw new Error('respuesta vacia');
    return normalizeProject(project);
  } catch {
    const fallback = staticProjects.find((p) => p.slug === slug);
    return fallback ? normalizeProject(fallback) : undefined;
  }
}

/**
 * Seleccion para el home: primero los marcados como destacados, luego los mas
 * recientes. El catalogo completo con filtros vive en /portafolio.
 */
export function pickFeatured(projects: Project[], count: number): Project[] {
  const byDateDesc = [...projects].sort(
    (a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0),
  );
  const featured = byDateDesc.filter((p) => p.featured);
  const rest = byDateDesc.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, count);
}
