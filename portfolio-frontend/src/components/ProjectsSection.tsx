'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import staticProjects from '@/data/projects';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Project } from '@/types';
import { api } from '@/lib/api';
import FilterPanel from './FilterPanel';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>(staticProjects);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showOnlyWithDemo, setShowOnlyWithDemo] = useState(false);

  useEffect(() => {
    api.getProjects()
      .then((data) => {
        const items = (data as { data: Project[] }).data || data as Project[];
        if (items.length > 0) setProjects(items);
      })
      .catch(() => {});
  }, []);

  const allTechs = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((p) => p.technologies.forEach((t) => techSet.add(t)));
    return Array.from(techSet).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (selectedTechs.length > 0) {
      result = result.filter((p) => selectedTechs.every((tech) => p.technologies.includes(tech)));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) || p.details.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (showOnlyWithDemo) {
      result = result.filter((p) => p.demo || (p.demos && p.demos.length > 0));
    }
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [selectedTechs, searchQuery, sortOrder, showOnlyWithDemo]);

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) => prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]);
  };

  const clearFilters = () => {
    setSelectedTechs([]);
    setSearchQuery('');
    setSortOrder('newest');
    setShowOnlyWithDemo(false);
  };

  const hasActiveFilters = selectedTechs.length > 0 || searchQuery.trim() !== '' || showOnlyWithDemo || sortOrder !== 'newest';

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

        <FilterPanel
          allTechs={allTechs} selectedTechs={selectedTechs} onToggleTech={toggleTech}
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          sortOrder={sortOrder} onSortChange={setSortOrder}
          showOnlyWithDemo={showOnlyWithDemo} onDemoFilterChange={setShowOnlyWithDemo}
          onClearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
        />

        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__text">No se encontraron proyectos con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onClick={() => setActiveProject(project)} />
            ))}
          </div>
        )}

        {activeProject && <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />}
      </div>
    </section>
  );
}
