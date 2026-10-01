import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseFilters from '@/components/CourseFilters';
import {
  getCursosPublicados,
  nivelesDe,
  categoriasDe,
  filtrar,
  ETIQUETA_NIVEL,
  CLASE_NIVEL,
  type CursoListado,
} from '@/lib/courses';

interface CursosPageProps {
  searchParams: Promise<{ q?: string; nivel?: string; categoria?: string }>;
}

export async function generateMetadata({
  searchParams,
}: CursosPageProps): Promise<Metadata> {
  const { q = '', nivel = '', categoria = '' } = await searchParams;
  const filtrado = Boolean(q || nivel || categoria);

  return {
    title: 'Cursos',
    description:
      'Cursos prácticos de desarrollo web, DevOps e IoT, con proyectos reales de principio a fin.',
    alternates: { canonical: '/cursos' },
    // Un filtro no es una pagina propia: es el mismo contenido recortado. Se
    // deja fuera del indice pero se siguen sus enlaces, para que los cursos se
    // descubran igual. Mismo criterio que /blog.
    ...(filtrado ? { robots: { index: false, follow: true } } : {}),
  };
}

function TarjetaCurso({ curso }: { curso: CursoListado }) {
  return (
    <a href={`/cursos/${curso.slug}`} className="card group">
      {/* Portada. <img> y no next/image: coverImage puede ser una URL externa
          y el optimizador exige declarar cada dominio en next.config. Sin
          portada se conserva el degradado. */}
      <div className="card__image">
        <div className="h-44 relative">
          {curso.coverImage ? (
            <img
              src={curso.coverImage}
              alt=""
              loading="lazy"
              className="h-44 w-full object-cover"
            />
          ) : (
            <div className="h-44 bg-gradient-to-br from-primary-container/20 via-surface-card to-primary-container/10 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary-container/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`chip chip--sm ${CLASE_NIVEL[curso.level]}`}>
              {ETIQUETA_NIVEL[curso.level]}
            </span>
          </div>
        </div>
      </div>

      <div className="card__content">
        <h2 className="card__title text-lg line-clamp-2">{curso.title}</h2>
        <p className="text-sm text-on-surface-variant mb-3">
          {curso.instructor}
        </p>

        <div className="card__chips">
          {curso.tags.slice(0, 4).map((t) => (
            <span key={t} className="chip chip--sm chip--primary">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {curso.duration}
            </span>
            {/* Matriculados y valoracion solo cuando hay algo que contar: un
                curso recien publicado marcando "0 estudiantes / 0 estrellas"
                resta mas de lo que informa. */}
            {curso.enrollmentCount > 0 && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {curso.enrollmentCount}
              </span>
            )}
            {curso.rating > 0 && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5 text-primary-container"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {curso.rating.toFixed(1)}
              </span>
            )}
          </div>
          <span className="text-lg font-bold text-primary-container">
            {curso.price === 0 ? 'Gratis' : `$${curso.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </a>
  );
}

/**
 * Listado de cursos, renderizado en el servidor.
 *
 * Antes era un componente de cliente que pedia los cursos con useEffect:
 * Googlebot recibia 476 caracteres y cero enlaces a cursos, y la rastreo el 1
 * de octubre de 2026 dejandola en "Rastreada: actualmente sin indexar". Es el
 * mismo defecto que ya se corrigio en /blog, que paso de 0 a 13 enlaces.
 *
 * Ahora las tarjetas viajan en el HTML y solo los filtros son cliente.
 */
export default async function CursosPage({ searchParams }: CursosPageProps) {
  const { q = '', nivel = '', categoria = '' } = await searchParams;
  const cursos = await getCursosPublicados();
  const niveles = nivelesDe(cursos);
  const categorias = categoriasDe(cursos);
  const visibles = filtrar(cursos, q, nivel, categoria);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <section className="max-w-6xl mx-auto px-6 mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-on-surface mb-4">
            Cursos
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Cursos prácticos de desarrollo web, DevOps e IoT, con proyectos
            reales de principio a fin.
          </p>
        </section>

        {cursos.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 mb-12">
            <CourseFilters
              niveles={niveles}
              categorias={categorias}
              busquedaActual={q}
              nivelActual={nivel}
              categoriaActual={categoria}
            />
          </section>
        )}

        <section className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibles.map((curso) => (
              <TarjetaCurso key={curso._id} curso={curso} />
            ))}
          </div>

          {visibles.length === 0 && (
            <div className="empty-state">
              <p className="empty-state__text">
                {cursos.length === 0
                  ? 'No se pudieron cargar los cursos. Intenta de nuevo en un momento.'
                  : 'No se encontraron cursos con ese filtro.'}
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
