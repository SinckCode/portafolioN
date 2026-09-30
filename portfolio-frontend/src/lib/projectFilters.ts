import { Project } from '@/types';

export type SortOrder = 'newest' | 'oldest';

/** Clave estable de un proyecto: los documentos de Mongo no traen `id` numerico. */
export const projectKey = (project: Project): string =>
  project.slug || project._id || String(project.id ?? project.title);

export interface ProjectFilters {
  techs: string[];
  type: string | null;
  query: string;
  onlyWithDemo: boolean;
  sort: SortOrder;
}

export const EMPTY_FILTERS: ProjectFilters = {
  techs: [],
  type: null,
  query: '',
  onlyWithDemo: false,
  sort: 'newest',
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? '';

/**
 * Lee los filtros de la URL. Es la unica fuente de verdad del estado de
 * filtrado: el servidor la usa para renderizar y el panel para pintarse.
 */
export function parseFilters(params: RawSearchParams | URLSearchParams): ProjectFilters {
  const get = (key: string): string =>
    params instanceof URLSearchParams ? params.get(key) ?? '' : firstValue(params[key]);

  const techs = get('tech')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    techs,
    type: get('type') || null,
    query: get('q'),
    onlyWithDemo: get('demo') === '1',
    sort: get('sort') === 'oldest' ? 'oldest' : 'newest',
  };
}

/** Serializa los filtros a query string, omitiendo todo lo que este en su default. */
export function buildQuery(filters: ProjectFilters): string {
  const params = new URLSearchParams();
  if (filters.techs.length > 0) params.set('tech', filters.techs.join(','));
  if (filters.type) params.set('type', filters.type);
  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.onlyWithDemo) params.set('demo', '1');
  if (filters.sort !== 'newest') params.set('sort', filters.sort);
  return params.toString();
}

export const hasActiveFilters = (filters: ProjectFilters): boolean =>
  filters.techs.length > 0 ||
  filters.type !== null ||
  filters.query.trim() !== '' ||
  filters.onlyWithDemo;

const hasDemo = (project: Project): boolean =>
  Boolean(project.demo) || (project.demos?.length ?? 0) > 0;

const matchesQuery = (project: Project, query: string): boolean => {
  const q = query.toLowerCase();
  return (
    project.title.toLowerCase().includes(q) ||
    project.description.toLowerCase().includes(q) ||
    project.details.toLowerCase().includes(q) ||
    project.technologies.some((t) => t.toLowerCase().includes(q))
  );
};

/**
 * Aplica los filtros. Funcion pura: el mismo resultado en servidor y cliente,
 * sin depender de ningun useMemo.
 */
export function applyFilters(projects: Project[], filters: ProjectFilters): Project[] {
  let result = projects;

  if (filters.techs.length > 0) {
    result = result.filter((p) => filters.techs.every((tech) => p.technologies.includes(tech)));
  }
  if (filters.type) {
    result = result.filter((p) => p.type === filters.type);
  }
  if (filters.query.trim()) {
    result = result.filter((p) => matchesQuery(p, filters.query.trim()));
  }
  if (filters.onlyWithDemo) {
    result = result.filter(hasDemo);
  }

  return [...result].sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return filters.sort === 'newest' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Facetas del catalogo completo (no del resultado filtrado), para que los
 * chips no desaparezcan al aplicar un filtro y dejar al usuario sin salida.
 */
export function collectTechs(projects: Project[]): string[] {
  const set = new Set<string>();
  projects.forEach((p) => p.technologies.forEach((t) => set.add(t)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}

export function collectTypes(projects: Project[]): string[] {
  const set = new Set<string>();
  projects.forEach((p) => set.add(p.type));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}
