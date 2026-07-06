import React, { useState, useMemo, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import FilterPanel from "./FilterPanel";
import EmptyState from "./ui/EmptyState";
import SectionHeading from "./ui/SectionHeading";
import projects from "../projects";
import "../estilos/ProjectsSection.css";

const ProjectsSection = () => {
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [showOnlyWithDemo, setShowOnlyWithDemo] = useState(false);
  // Índice dentro de filteredProjects (no el objeto) para poder navegar prev/next
  const [activeIndex, setActiveIndex] = useState(null);

  const allTechs = useMemo(
    () => [...new Set(projects.flatMap((p) => p.technologies))],
    []
  );

  const handleTechToggle = (tech) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleClearFilters = () => {
    setSelectedTechs([]);
    setSearchQuery("");
    setSortOrder("recent");
    setShowOnlyWithDemo(false);
  };

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (selectedTechs.length > 0) {
      result = result.filter((project) =>
        selectedTechs.every((tech) => project.technologies.includes(tech))
      );
    }

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.details?.toLowerCase().includes(lower) ||
          p.technologies.some((t) => t.toLowerCase().includes(lower))
      );
    }

    if (showOnlyWithDemo) {
      result = result.filter((p) => !!p.demo || (p.demos && p.demos.length > 0));
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date || "1900-01-01");
      const dateB = new Date(b.date || "1900-01-01");
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [selectedTechs, searchQuery, sortOrder, showOnlyWithDemo]);

  const handleOpenModal = useCallback(
    (project) => {
      const index = filteredProjects.findIndex((p) => p.id === project.id);
      setActiveIndex(index >= 0 ? index : null);
    },
    [filteredProjects]
  );

  const handleCloseModal = useCallback(() => setActiveIndex(null), []);

  // Navegación entre proyectos dentro de la lista filtrada, con wrap-around
  const handleNavigate = useCallback(
    (delta) => {
      setActiveIndex((prev) => {
        if (prev === null || filteredProjects.length === 0) return prev;
        return (prev + delta + filteredProjects.length) % filteredProjects.length;
      });
    },
    [filteredProjects.length]
  );

  const activeProject =
    activeIndex !== null ? filteredProjects[activeIndex] : null;

  return (
    <section className="projects-section" id="portfolio">
      <div className="projects-inner">
        <SectionHeading
          kicker="Portafolio"
          title="Mi trayectoria en código"
          subtitle="Cada proyecto aquí es una historia: algunas nacieron por curiosidad, otras para resolver problemas reales. Son fragmentos de mi crecimiento como desarrollador, donde la lógica se cruza con la pasión por crear."
        />

        <FilterPanel
          allTechs={allTechs}
          selectedTechs={selectedTechs}
          onToggle={handleTechToggle}
          onClear={handleClearFilters}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          sortOrder={sortOrder}
          onSort={setSortOrder}
          showOnlyWithDemo={showOnlyWithDemo}
          onToggleDemoFilter={() => setShowOnlyWithDemo((prev) => !prev)}
          resultsCount={filteredProjects.length}
          totalCount={projects.length}
        />

        {filteredProjects.length === 0 ? (
          <EmptyState
            title="No encontré proyectos con esos filtros"
            description="Prueba con otra búsqueda o quita algunos filtros para volver a ver todos los proyectos."
            actionLabel="Limpiar filtros"
            onAction={handleClearFilters}
          />
        ) : (
          <div className="projects-grid">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  featured={index === 0}
                  onClick={handleOpenModal}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeProject && (
          <ProjectModal
            project={activeProject}
            index={activeIndex}
            total={filteredProjects.length}
            prevProject={
              filteredProjects[
                (activeIndex - 1 + filteredProjects.length) %
                  filteredProjects.length
              ]
            }
            nextProject={
              filteredProjects[(activeIndex + 1) % filteredProjects.length]
            }
            onClose={handleCloseModal}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsSection;
