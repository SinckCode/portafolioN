'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import ProjectsSection from '@/components/ProjectsSection';
import BlogPreviewSection from '@/components/BlogPreviewSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import DotNavigation from '@/components/DotNavigation';
import Preloader from '@/components/Preloader';
import CanvasFallback from '@/components/CanvasFallback';
import ScrollProgress from '@/components/ScrollProgress';

const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false });

export default function Home() {
  const [modelState, setModelState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback((pct: number) => setProgress(pct), []);
  const handleLoaded = useCallback(() => {
    setProgress(100);
    setModelState('ready');
  }, []);
  const handleError = useCallback(() => setModelState('error'), []);

  // Fallback: si Canvas3D no dispara onLoaded en 3s, forzar ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setModelState((prev) => (prev === 'loading' ? 'ready' : prev));
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const showPreloader = modelState === 'loading';

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {modelState === 'error' ? (
        <CanvasFallback />
      ) : (
        <Canvas3D
          onProgress={handleProgress}
          onLoaded={handleLoaded}
          onError={handleError}
        />
      )}
      <Preloader visible={showPreloader} progress={progress} />
      <ScrollProgress />
      <Header />
      <DotNavigation />
      <main>
        <HeroSection modelState={modelState} />
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
