'use client';

import Header from '@/components/Header';
import ProjectsSection from '@/components/ProjectsSection';
import Footer from '@/components/Footer';

export default function PortafolioPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <ProjectsSection />
      </main>
      <Footer />
    </>
  );
}
