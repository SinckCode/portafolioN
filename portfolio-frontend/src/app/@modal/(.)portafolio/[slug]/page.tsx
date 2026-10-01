import { notFound } from 'next/navigation';
import ProjectModalShell from '@/components/ProjectModalShell';
import ProjectDetailContent from '@/components/ProjectDetailContent';
import { getProjectBySlug } from '@/lib/projects';

// Ruta interceptora a nivel raiz.
//
// La que vive en portafolio/@modal solo actua cuando la navegacion sale de
// /portafolio: asi funcionan las interceptoras, cubren su propio segmento. Desde
// el home el mismo clic hacia /portafolio/<slug> no se interceptaba y daba
// pagina completa, con lo que el detalle se comportaba distinto segun de donde
// vinieras.
//
// Esta cubre el resto del sitio y reutiliza el mismo contenido, asi que las dos
// vistas no pueden divergir. La URL cambia igual, de modo que el enlace se puede
// compartir, y quien lo abra en frio —o un crawler— recibe la pagina completa.

export default async function ModalDeProyectoGlobal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <ProjectModalShell titulo={project.title}>
      <ProjectDetailContent project={project} />
    </ProjectModalShell>
  );
}
