import React from "react";
import "../estilos/ProjectCard.css";

// Función auxiliar para formatear la fecha a "día mes año"
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("es-MX", options);
};

const ProjectCard = ({ project, onClick }) => {
  return (
    <div className="project-card" onClick={() => onClick(project)}>
      <div className="project-thumb">
        <img src={project.images[0]} alt={project.title} loading="lazy" />
        <div className="overlay">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </div>
      </div>
      <div className="project-meta">
        <div className="tags">
          {project.technologies.map((tech) => (
            <span key={tech} className="tag">
              {tech}
            </span>
          ))}
        </div>
        <span className="project-type">{project.type}</span>
        <span className="project-year">{formatDate(project.date)}</span>
      </div>
    </div>
  );
};

export default ProjectCard;
