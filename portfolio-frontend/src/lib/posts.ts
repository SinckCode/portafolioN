import { unwrapList } from './envelope';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// El listado pagina en 10 por defecto; sin esto se perderian articulos.
const MAX_POSTS = 100;

export interface PostListado {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readingTime: number;
  coverImage?: string;
  tags: string[];
  category: { name: string } | string | null;
}

/** El nombre de la categoria, que el API devuelve poblado o como cadena. */
export function nombreCategoria(post: PostListado): string {
  if (!post.category) return '';
  return typeof post.category === 'string' ? post.category : post.category.name;
}

const aTexto = (v: unknown): string => (typeof v === 'string' ? v : '');

function normalizar(crudo: unknown): PostListado {
  const p = (crudo ?? {}) as Record<string, unknown>;
  return {
    _id: aTexto(p._id),
    title: aTexto(p.title),
    slug: aTexto(p.slug),
    excerpt: aTexto(p.excerpt),
    publishedAt: aTexto(p.publishedAt),
    readingTime: typeof p.readingTime === 'number' ? p.readingTime : 0,
    coverImage: aTexto(p.coverImage) || undefined,
    tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === 'string') : [],
    category: (p.category ?? null) as PostListado['category'],
  };
}

/**
 * Articulos publicados, traidos en el servidor.
 *
 * Existe porque /blog se renderizaba entero en el cliente: un crawler recibia la
 * pagina sin un solo enlace a un articulo, y esa es la pagina de la que Google
 * deberia descubrirlos todos. Con esto las tarjetas viajan ya en el HTML.
 *
 * Si el API no responde devuelve una lista vacia en vez de reventar la pagina:
 * el resto del blog (cabecera, newsletter) sigue siendo util.
 */
export async function getPublishedPosts(): Promise<PostListado[]> {
  try {
    const res = await fetch(
      `${API_URL}/posts?status=published&limit=${MAX_POSTS}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return unwrapList<unknown>(await res.json()).map(normalizar);
  } catch {
    return [];
  }
}

/** Categorias presentes, para no ofrecer filtros que no devuelven nada. */
export function categoriasDe(posts: PostListado[]): string[] {
  const vistas = new Set<string>();
  for (const p of posts) {
    const n = nombreCategoria(p);
    if (n) vistas.add(n);
  }
  return Array.from(vistas).sort((a, b) => a.localeCompare(b, 'es'));
}

/** Aplica busqueda y categoria; ambas vienen de la URL. */
export function filtrar(
  posts: PostListado[],
  busqueda: string,
  categoria: string,
): PostListado[] {
  const q = busqueda.trim().toLowerCase();
  return posts.filter((p) => {
    const coincideTexto =
      q === '' ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q);
    const coincideCategoria =
      categoria === '' || nombreCategoria(p) === categoria;
    return coincideTexto && coincideCategoria;
  });
}
