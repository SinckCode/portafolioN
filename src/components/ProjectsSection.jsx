import React, { useState, useRef, useMemo } from "react";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import FilterPanel from "./FilterPanel";
import projects from "../projects";
import "../estilos/ProjectsSection.css";

const ProjectsSection = () => {
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [activeProject, setActiveProject] = useState(null);
  const [showOnlyWithDemo, setShowOnlyWithDemo] = useState(false);

  const carouselRef = useRef(null);
  const allTechs = [...new Set(projects.flatMap((p) => p.technologies))];

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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handleToggleDemoFilter = () => {
    setShowOnlyWithDemo((prev) => !prev);
  };

  const handleOpenModal = (project) => {
    setActiveProject(project);
  };

  const handleCloseModal = () => {
    setActiveProject(null);
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

  return (
    <section className="projects-section" id="portfolio">
      <div className="section-header">
        <h2>🎮 Mi trayectoria en código</h2>
        <p>Cada proyecto aquí es una historia: algunas nacieron por curiosidad, otras para resolver problemas reales. Son fragmentos de mi crecimiento como desarrollador, donde la lógica se cruza con la pasión por crear.</p>
      </div>

      <FilterPanel
        allTechs={allTechs}
        selectedTechs={selectedTechs}
        onToggle={handleTechToggle}
        onClear={handleClearFilters}
        onSearch={handleSearch}
        onSort={handleSort}
        showOnlyWithDemo={showOnlyWithDemo}
        onToggleDemoFilter={handleToggleDemoFilter}
      />

      <div className="carousel-wrapper">
        <div className="projects-grid" ref={carouselRef}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleOpenModal}
            />
          ))}
        </div>
      </div>

      {activeProject && (
        <ProjectModal project={activeProject} onClose={handleCloseModal} />
      )}
    </section>
  );
};

export default ProjectsSection;
