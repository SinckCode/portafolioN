import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogFilters from '@/components/BlogFilters';
import NewsletterForm from '@/components/NewsletterForm';
import {
  getPublishedPosts,
  categoriasDe,
  filtrar,
  type PostListado,
} from '@/lib/posts';

interface BlogPageProps {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const { q = '', categoria = '' } = await searchParams;
  const filtrado = Boolean(q || categoria);

  return {
    title: 'Blog',
    description:
      'Artículos sobre desarrollo web, infraestructura, DevOps e IoT, escritos desde la práctica.',
    alternates: { canonical: '/blog' },
    // Una búsqueda o un filtro no son páginas propias: apuntan al mismo
    // contenido con otro recorte. Se dejan fuera del índice pero se siguen sus
    // enlaces, para que los artículos se descubran igual.
    ...(filtrado ? { robots: { index: false, follow: true } } : {}),
  };
}

function TarjetaPost({ post }: { post: PostListado }) {
  return (
    <a href={`/blog/${post.slug}`} className="card group">
      {/* Portada. Se usa <img> y no next/image porque coverImage puede ser una
          URL externa arbitraria, y el optimizador exige declarar cada dominio en
          next.config. Sin portada, se conserva el degradado de siempre. */}
      <div className="card__image">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="h-48 bg-gradient-to-br from-primary-container/30 via-surface-card to-primary-container/10 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary-container/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="card__content">
        <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
          <span>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('es-MX')
              : ''}
          </span>
          <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
          <span>{post.readingTime} min lectura</span>
        </div>
        <h2 className="card__title text-lg line-clamp-2">{post.title}</h2>
        <p className="card__description text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="card__chips">
          {post.tags.map((tag) => (
            <span key={tag} className="chip chip--sm chip--primary">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

/**
 * Listado del blog, renderizado en el servidor.
 *
 * Antes era un componente de cliente que pedia los articulos con useEffect: un
 * crawler recibia la pagina sin un solo enlace a un articulo, y esta es
 * justamente la pagina de la que Google deberia descubrirlos todos. Ahora las
 * tarjetas viajan en el HTML y solo la busqueda y el newsletter son cliente.
 */
export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { q = '', categoria = '' } = await searchParams;
  const posts = await getPublishedPosts();
  const categorias = categoriasDe(posts);
  const visibles = filtrar(posts, q, categoria);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <section className="max-w-6xl mx-auto px-6 mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-on-surface mb-4">
            Blog
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Artículos sobre desarrollo web, infraestructura, DevOps e IoT,
            escritos desde la práctica.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-12">
          <BlogFilters
            categorias={categorias}
            busquedaActual={q}
            categoriaActual={categoria}
          />
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibles.map((post) => (
              <TarjetaPost key={post._id} post={post} />
            ))}
          </div>

          {visibles.length === 0 && (
            <div className="empty-state">
              <p className="empty-state__text">
                {posts.length === 0
                  ? 'No se pudieron cargar los artículos. Intenta de nuevo en un momento.'
                  : 'No se encontraron artículos con ese filtro.'}
              </p>
            </div>
          )}
        </section>

        <section className="max-w-4xl mx-auto px-6">
          <div className="newsletter">
            <h2 className="newsletter__title">Suscríbete al newsletter</h2>
            <p className="newsletter__text">
              Recibe los últimos artículos y novedades directamente en tu bandeja
              de entrada.
            </p>
            <NewsletterForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
