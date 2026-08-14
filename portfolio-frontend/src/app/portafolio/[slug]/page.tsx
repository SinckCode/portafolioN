import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import staticProjects from '@/data/projects';
import { Project } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://angelonesto.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getProject(slug: string): Promise<Project | undefined> {
  try {
    const res = await fetch(`${API_URL}/projects/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return staticProjects.find((p) => p.slug === slug);
    const json = await res.json();
    return (json.data || json) as Project;
  } catch {
    return staticProjects.find((p) => p.slug === slug);
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
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
  return staticProjects
    .filter((p) => p.slug)
    .map((project) => ({ slug: project.slug! }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const repos = Object.entries(project.repos).filter(([, url]) => url);
  const allImages = project.images || [];
  const allVideos = project.videos || (project.video ? [project.video] : []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    author: {
      '@type': 'Person',
      name: 'Angel David Onesto Frias',
    },
    dateCreated: project.date,
    url: `${SITE_URL}/portafolio/${slug}`,
    ...(allImages[0] ? { image: allImages[0] } : {}),
    keywords: project.technologies.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-container/10 to-transparent pb-12">
          <div className="max-w-6xl mx-auto px-6 pt-8">
            <Link
              href="/portafolio"
              className="inline-flex items-center gap-2 text-primary-container hover:text-primary-container/80 text-sm mb-8 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver al portafolio
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="chip chip--primary">
                {project.type}
              </span>
              <span className="text-sm text-on-surface-variant">{project.date}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-4">
              {project.title}
            </h1>
            <p className="text-lg text-on-surface-variant max-w-3xl">
              {project.description}
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 space-y-10">
          {/* Media Gallery */}
          {(allVideos.length > 0 || allImages.length > 0) && (
            <section>
              <h2 className="text-xl font-bold text-on-surface mb-6">
                Galeria
              </h2>

              {/* Videos */}
              {allVideos.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {allVideos.map((video, i) => (
                    <div
                      key={i}
                      className="glass-card overflow-hidden aspect-video"
                    >
                      <video
                        src={video}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Images */}
              {allImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allImages.map((img, i) => (
                    <div
                      key={i}
                      className="glass-card overflow-hidden aspect-video relative"
                    >
                      <Image
                        src={img}
                        alt={`${project.title} screenshot ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Details */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-on-surface mb-4">
              Descripcion del proyecto
            </h2>
            <p className="text-on-surface leading-relaxed">{project.details}</p>
          </section>

          {/* Tech Stack */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-on-surface mb-4">
              Tecnologias
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="chip chip--primary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Links */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-on-surface mb-4">Enlaces</h2>
            <div className="flex flex-wrap gap-3">
              {repos.map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--ghost"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </a>
              ))}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Demo en vivo
                </a>
              )}
              {project.demos?.map((demoUrl, i) => (
                <a
                  key={i}
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Demo {i + 1}
                </a>
              ))}
            </div>

            {project.credentials && (
              <div className="mt-4 glass p-4 rounded-xl">
                <p className="text-xs text-on-surface-variant mb-2 uppercase tracking-wider font-semibold">
                  Credenciales de prueba
                </p>
                <p className="text-sm text-on-surface">
                  Email: {project.credentials.email}
                </p>
                <p className="text-sm text-on-surface">
                  Password: {project.credentials.password}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
