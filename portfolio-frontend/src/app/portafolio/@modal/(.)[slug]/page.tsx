import { notFound } from 'next/navigation';
import ProjectModalShell from '@/components/ProjectModalShell';
import ProjectDetailContent from '@/components/ProjectDetailContent';
import { getProjectBySlug } from '@/lib/projects';

// Ruta interceptora: al hacer clic en una tarjeta desde /portafolio, Next
// intercepta la navegacion a /portafolio/<slug> y renderiza esto en el slot
// @modal, sin descartar el listado que quedo debajo.
//
// La URL si cambia, asi que el enlace se puede copiar y compartir; quien lo abra
// en frio (o un crawler) recibe la pagina completa de [slug], no el modal.

export default async function ModalDeProyecto({
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
