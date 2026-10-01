import { unwrapList } from './envelope';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// El listado pagina en 10 por defecto; sin esto se perderian cursos.
const MAX_CURSOS = 100;

export type NivelCurso = 'beginner' | 'intermediate' | 'advanced';

export interface CursoListado {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  instructor: string;
  level: NivelCurso;
  duration: string;
  rating: number;
  enrollmentCount: number;
  price: number;
  categoria: string;
  tags: string[];
}

export const ETIQUETA_NIVEL: Record<NivelCurso, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export const CLASE_NIVEL: Record<NivelCurso, string> = {
  beginner: 'chip--beginner',
  intermediate: 'chip--intermediate',
  advanced: 'chip--advanced',
};

/** Los niveles son ordinales: se ordenan por dificultad, no alfabeticamente. */
const ORDEN_NIVELES: NivelCurso[] = ['beginner', 'intermediate', 'advanced'];

const aTexto = (v: unknown): string => (typeof v === 'string' ? v : '');
const aNumero = (v: unknown): number => (typeof v === 'number' ? v : 0);

/** El API devuelve instructor y categoria poblados o como cadena. */
function nombreDe(valor: unknown): string {
  if (typeof valor === 'string') return valor;
  if (valor && typeof valor === 'object' && 'name' in valor) {
    return aTexto((valor as { name: unknown }).name);
  }
  return '';
}

function esNivel(v: unknown): v is NivelCurso {
  return v === 'beginner' || v === 'intermediate' || v === 'advanced';
}

function normalizar(crudo: unknown): CursoListado {
  const c = (crudo ?? {}) as Record<string, unknown>;
  return {
    _id: aTexto(c._id),
    title: aTexto(c.title),
    slug: aTexto(c.slug),
    coverImage: aTexto(c.coverImage) || undefined,
    instructor: nombreDe(c.instructor),
    level: esNivel(c.level) ? c.level : 'beginner',
    duration: aTexto(c.duration),
    rating: aNumero(c.rating),
    enrollmentCount: aNumero(c.enrollmentCount),
    price: aNumero(c.price),
    categoria: nombreDe(c.category),
    tags: Array.isArray(c.tags)
      ? c.tags.filter((t): t is string => typeof t === 'string')
      : [],
  };
}

/**
 * Cursos publicados, traidos en el servidor.
 *
 * Existe por lo mismo que lib/posts.ts: /cursos se renderizaba entero en el
 * cliente y Googlebot recibia 476 caracteres sin un solo enlace a un curso.
 * Google la rastreo el 1 de octubre y la dejo en "Rastreada: actualmente sin
 * indexar", que es exactamente lo que cabe esperar de una pagina vacia.
 *
 * Si el API no responde devuelve lista vacia en vez de reventar la pagina.
 */
export async function getCursosPublicados(): Promise<CursoListado[]> {
  try {
    const res = await fetch(
      `${API_URL}/courses?status=published&limit=${MAX_CURSOS}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return unwrapList<unknown>(await res.json()).map(normalizar);
  } catch {
    return [];
  }
}

/** Niveles presentes, en orden de dificultad. */
export function nivelesDe(cursos: CursoListado[]): NivelCurso[] {
  const vistos = new Set(cursos.map((c) => c.level));
  return ORDEN_NIVELES.filter((n) => vistos.has(n));
}

/** Categorias presentes, para no ofrecer filtros que no devuelven nada. */
export function categoriasDe(cursos: CursoListado[]): string[] {
  const vistas = new Set<string>();
  for (const c of cursos) {
    if (c.categoria) vistas.add(c.categoria);
  }
  return Array.from(vistas).sort((a, b) => a.localeCompare(b, 'es'));
}

/** Aplica busqueda, nivel y categoria; los tres vienen de la URL. */
export function filtrar(
  cursos: CursoListado[],
  busqueda: string,
  nivel: string,
  categoria: string,
): CursoListado[] {
  const q = busqueda.trim().toLowerCase();
  return cursos.filter((c) => {
    const coincideTexto =
      q === '' ||
      c.title.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q));
    const coincideNivel = nivel === '' || c.level === nivel;
    const coincideCategoria = categoria === '' || c.categoria === categoria;
    return coincideTexto && coincideNivel && coincideCategoria;
  });
}
