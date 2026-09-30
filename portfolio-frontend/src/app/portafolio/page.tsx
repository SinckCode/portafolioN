import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterPanel from '@/components/FilterPanel';
import ProjectCard from '@/components/ProjectCard';
import { getAllProjects } from '@/lib/projects';
import { estadoDe } from '@/lib/projectStatus';
import {
  applyFilters,
  collectTechs,
  collectTypes,
  hasActiveFilters,
  parseFilters,
  projectKey,
} from '@/lib/projectFilters';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://angelonesto.com';

interface PortafolioPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Una vista filtrada es el mismo catálogo reordenado. Se indexa /portafolio y
 * las combinaciones de filtros quedan noindex con canonical al listado limpio,
 * para no competir contra sí mismas por contenido duplicado. `follow` se queda
 * puesto: los enlaces a los proyectos sí deben seguirse.
 */
export async function generateMetadata({
  searchParams,
}: PortafolioPageProps): Promise<Metadata> {
  const filters = parseFilters(await searchParams);
  const filtrado = hasActiveFilters(filters);

  return {
    title: 'Portafolio',
    description:
      'Proyectos de desarrollo web, IoT, mobile y networking: stack, capturas, repositorios y demos en vivo.',
    alternates: { canonical: `${SITE_URL}/portafolio` },
    ...(filtrado ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PortafolioPage({ searchParams }: PortafolioPageProps) {
  const filters = parseFilters(await searchParams);
  const projects = await getAllProjects();

  // Las facetas salen del catálogo completo, no del resultado: si salieran del
  // resultado, al filtrar desaparecerían los chips y no habría cómo volver.
  const allTechs = collectTechs(projects);
  const allTypes = collectTypes(projects);
  const filtrados = applyFilters(projects, filters);

  const online = filtrados.filter((p) => estadoDe(p) === 'online').length;
  const [principal, ...resto] = filtrados;

  return (
    <>
      <Header />
      <main className="pf">
        <div className="pf__wrap">
          <header className="pf__head">
            <p className="pf__prompt">
              <span className="pf__path">~/portafolio</span>
              <span className="pf__dollar">$</span>
              <span className="pf__cmd">
                ls{filters.techs.length > 0 && ` --tech=${filters.techs.join(',')}`}
                {filters.type && ` --tipo="${filters.type}"`}
              </span>
            </p>

            <h1 className="pf__title">Mi trayectoria en código</h1>
            <p className="pf__sub">
              Cada proyecto representa un reto superado, una tecnología aprendida y un
              paso más en mi crecimiento como ingeniero de software.
            </p>

            <p className="pf__stats">
              <span>
                <b>{filtrados.length}</b> proyectos
              </span>
              <span>
                <b>{online}</b> online
              </span>
              <span>
                <b>{collectTypes(filtrados).length}</b> categorías
              </span>
            </p>
          </header>

          <FilterPanel
            allTechs={allTechs}
            allTypes={allTypes}
            filters={filters}
            resultCount={filtrados.length}
            totalCount={projects.length}
          />

          {!principal ? (
            <div className="empty-state">
              <p className="empty-state__text">
                No se encontraron proyectos con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <>
              <ProjectCard project={principal} destacada />
              <div className="pf__grid">
                {resto.map((p) => (
                  <ProjectCard key={projectKey(p)} project={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
