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

export default function Home() {
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
        <ProjectsSection />
        <BlogPreviewSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
