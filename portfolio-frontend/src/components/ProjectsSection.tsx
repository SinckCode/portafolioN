'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Project } from '@/types';
import { projectKey } from '@/lib/projectFilters';
import ProjectCard from './ProjectCard';

// Sección de proyectos del home. Recibe los proyectos ya resueltos desde el
// servidor: antes los pedía en un useEffect, así que el HTML que veía Googlebot
// no tenía ni un enlace a /portafolio/<slug>. Sigue siendo cliente solo por la
// animación de entrada, que no afecta al HTML renderizado.

interface ProjectsSectionProps {
  projects: Project[];
  totalCount: number;
}

export default function ProjectsSection({ projects, totalCount }: ProjectsSectionProps) {
  const header = useScrollReveal({ once: true });

  return (
    <section id="portfolio" className="section">
      <div className="section__container" style={{ maxWidth: '80rem' }}>
        <motion.div
          ref={header.ref}
          animate={header.animate}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
          }}
          className="section__header"
        >
          <h2 className="section__title">Mi trayectoria en codigo</h2>
          <p className="section__subtitle">
            Cada proyecto representa un reto superado, una tecnologia aprendida y un
            paso mas en mi crecimiento como ingeniero de software.
          </p>
        </motion.div>

        <div className="pf__grid">
          {projects.map((project, i) => (
            <ProjectCard key={projectKey(project)} project={project} destacada={i === 0} />
          ))}
        </div>

        <div className="section__footer">
          <Link href="/portafolio" className="btn btn--ghost">
            Ver los {totalCount} proyectos
          </Link>
        </div>
      </div>
    </section>
  );
}
