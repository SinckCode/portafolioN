import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectDetailContent from '@/components/ProjectDetailContent';
import staticProjects from '@/data/projects';
import { getProjectBySlug } from '@/lib/projects';

// Página completa del proyecto. Es lo que reciben un crawler, un enlace
// compartido o quien recarga estando en el modal. El cuerpo es el mismo
// componente que usa el modal, así que ambas vistas no pueden divergir.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://angelonesto.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Proyecto no encontrado' };

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `${SITE_URL}/portafolio/${slug}` },
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'website',
      url: `${SITE_URL}/portafolio/${slug}`,
      ...(project.images?.[0] ? { images: [project.images[0]] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      ...(project.images?.[0] ? { images: [project.images[0]] } : {}),
    },
  };
}

export function generateStaticParams() {
  return staticProjects.filter((p) => p.slug).map((p) => ({ slug: p.slug! }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    author: { '@type': 'Person', name: 'Angel David Onesto Frias' },
    dateCreated: project.date,
    url: `${SITE_URL}/portafolio/${slug}`,
    ...(project.images[0] ? { image: project.images[0] } : {}),
    keywords: project.technologies.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="pd-page">
        <div className="pd-page__wrap">
          <Link href="/portafolio" className="pd-page__volver">
            ← Volver al portafolio
          </Link>
          <ProjectDetailContent project={project} />
        </div>
      </main>
      <Footer />
    </>
  );
}
