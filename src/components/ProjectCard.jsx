import React from "react";
import { motion } from "framer-motion";
import Icon from "./ui/Icon";
import { getTechColor, getTypeColor } from "../utils/techColors";
import "../estilos/ProjectCard.css";

// "abr 2023" — corto, en mono
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
  });
};

const MAX_VISIBLE_TAGS = 4;

const ProjectCard = ({ project, onClick, featured = false }) => {
  const hasVideo = !!project.video || (project.videos && project.videos.length > 0);
  const demoUrl = project.demo || project.demos?.[0];
  const repoUrl = project.repos?.frontend || project.repos?.backend;
  const visibleTags = project.technologies.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = project.technologies.length - visibleTags.length;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(project);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`project-card${featured ? " project-card--featured" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${project.title}`}
      onClick={() => onClick(project)}
      onKeyDown={handleKeyDown}
    >
      <div className="project-card__media">
        <img
          src={project.images[0]}
          alt={`Captura del proyecto ${project.title}`}
          loading="lazy"
        />
        {hasVideo && (
          <span className="project-card__play-badge" title="Incluye video demo">
            <Icon name="play" size={12} />
            <span>Video</span>
          </span>
        )}
      </div>

      <div className="project-card__body">
        <div className="project-card__top">
          <span
            className="project-card__type"
            style={{ "--badge-color": getTypeColor(project.type) }}
          >
            {project.type}
          </span>
          <span className="project-card__date">
            <Icon name="calendar" size={12} />
            {formatDate(project.date)}
          </span>
        </div>

        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__description">{project.description}</p>

        <div className="project-card__tags">
          {visibleTags.map((tech) => (
            <span
              key={tech}
              className="project-card__tag"
              style={{ "--tag-color": getTechColor(tech) }}
            >
              {tech}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="project-card__tag project-card__tag--more">
              +{hiddenCount}
            </span>
          )}
        </div>

        <div className="project-card__footer">
          <div className="project-card__links">
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Repositorio de ${project.title} en GitHub`}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon name="github" size={17} />
              </a>
            )}
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Demo en vivo de ${project.title}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon name="external-link" size={17} />
              </a>
            )}
          </div>
          <span className="project-card__cta" aria-hidden="true">
            Ver detalles
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
