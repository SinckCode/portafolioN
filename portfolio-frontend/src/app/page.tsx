import type { Metadata } from 'next';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import ProjectsSection from '@/components/ProjectsSection';
import BlogPreviewSection from '@/components/BlogPreviewSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import DotNavigation from '@/components/DotNavigation';
import HomeCanvas from '@/components/HomeCanvas';
import ScrollProgress from '@/components/ScrollProgress';
import { getAllProjects, pickFeatured } from '@/lib/projects';

// Cuantos proyectos se muestran en el home. El catalogo completo, con filtros,
// vive en /portafolio; subir esto a 17 replica el comportamiento anterior.
const HOME_PROJECT_COUNT = 6;

// El layout raiz define metadataBase pero no `alternates`, asi que cada pagina
// tiene que declarar su canonical o no emite ninguno. Sin el, Google trata
// angelonesto.com, angelonesto.com/ y cualquier variante con parametros como
// candidatas distintas para la misma pagina, y ninguna gana: es el estado
// "Descubierta: actualmente sin indexar" que reportaba Search Console.
// La barra final importa — tiene que coincidir con el <loc> del sitemap.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Angel David Onesto Frias',
      url: 'https://angelonesto.com',
      description: 'Desarrollador Full Stack & DevOps. Portfolio de proyectos web, IoT, mobile y mas.',
    },
    {
      '@type': 'Person',
      name: 'Angel David Onesto Frias',
      url: 'https://angelonesto.com',
      jobTitle: 'Full Stack Developer & DevOps',
      knowsAbout: ['React', 'Next.js', 'NestJS', 'Node.js', 'TypeScript', 'Docker', 'IoT', 'MongoDB'],
      sameAs: [
        'https://github.com/SinckCode',
        'https://linkedin.com/in/angel-onesto',
      ],
    },
  ],
};

export default async function Home() {
  const projects = await getAllProjects();
  const featured = pickFeatured(projects, HOME_PROJECT_COUNT);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeCanvas />
      <ScrollProgress />
      <Header />
      <DotNavigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection projects={featured} totalCount={projects.length} />
        <BlogPreviewSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
