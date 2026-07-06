import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Icon from "./ui/Icon";
import { getTechColor } from "../utils/techColors";
import useFocusTrap from "../hooks/useFocusTrap";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import "../estilos/ProjectModal.css";

const ProjectModal = ({
  project,
  index,
  total,
  prevProject,
  nextProject,
  onClose,
  onNavigate,
}) => {
  const [activeMedia, setActiveMedia] = useState(0);
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);

  useBodyScrollLock(true);
  useFocusTrap(contentRef, true);

  // Galería unificada: videos primero, luego imágenes
  const media = useMemo(() => {
    if (!project) return [];
    const combined = [];
    const videoSources = [
      ...(project.video ? [project.video] : []),
      ...(Array.isArray(project.videos) ? project.videos : []),
    ];
    videoSources.forEach((src) => combined.push({ type: "video", src }));
    if (Array.isArray(project.images)) {
      project.images.forEach((img) => combined.push({ type: "image", src: img }));
    }
    return combined;
  }, [project]);

  useEffect(() => {
    setActiveMedia(0);
  }, [project]);

  // Foco inicial al botón de cerrar; el trap devuelve el foco a la card al salir
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (media.length > 1 && e.key === "ArrowLeft") {
        setActiveMedia((prev) => (prev - 1 + media.length) % media.length);
      } else if (media.length > 1 && e.key === "ArrowRight") {
        setActiveMedia((prev) => (prev + 1) % media.length);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [media.length, onClose]);

  if (!project) return null;

  // El campo api existe en dos formas: string o { videojuegos, empresas }
  const apiLinks = [];
  if (typeof project.api === "string" && project.api) {
    apiLinks.push({ label: "API", url: project.api, icon: "server" });
  } else if (project.api && typeof project.api === "object") {
    if (project.api.videojuegos) {
      apiLinks.push({ label: "API Juegos", url: project.api.videojuegos, icon: "play" });
    }
    if (project.api.empresas) {
      apiLinks.push({ label: "API Empresas", url: project.api.empresas, icon: "box" });
    }
  }

  const links = [
    project.demo && { label: "Demo", url: project.demo, icon: "globe" },
    ...(project.demos || []).map((url, i) => ({
      label: `Demo ${i + 1}`,
      url,
      icon: "globe",
    })),
    project.repos?.frontend && {
      label: "Frontend",
      url: project.repos.frontend,
      icon: "code",
    },
    project.repos?.backend && {
      label: "Backend",
      url: project.repos.backend,
      icon: "server",
    },
    project.repos?.hardware && {
      label: "Sketch",
      url: project.repos.hardware,
      icon: "cpu",
    },
    ...apiLinks,
    project.repos?.deploy && {
      label: "Deploy",
      url: project.repos.deploy,
      icon: "cloud",
    },
  ].filter(Boolean);

  const current = media[activeMedia];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        ref={contentRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div className="modal-header__text">
            <h2 id="project-modal-title" className="modal-title">
              {project.title}
            </h2>
            <span className="modal-position">
              Proyecto {index + 1} de {total}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close"
            aria-label="Cerrar detalle del proyecto"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="modal-body">
          <div className="modal-gallery">
            <div className="main-media-wrapper">
              {current &&
                (current.type === "video" ? (
                  <video
                    key={current.src}
                    className="main-media"
                    controls
                    autoPlay
                    muted
                    preload="metadata"
                  >
                    <source src={current.src} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    key={current.src}
                    src={current.src}
                    alt={`${project.title} — captura ${activeMedia + 1}`}
                    className="main-media"
                    loading="lazy"
                  />
                ))}
              {media.length > 1 && (
                <span className="media-counter" aria-live="polite">
                  {activeMedia + 1} / {media.length}
                </span>
              )}
            </div>

            {media.length > 1 && (
              <div className="thumbnail-row" role="group" aria-label="Galería de medios">
                {media.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`thumb-wrapper${i === activeMedia ? " active" : ""}`}
                    aria-label={`Ver ${item.type === "video" ? "video" : "imagen"} ${i + 1} de ${media.length}`}
                    aria-current={i === activeMedia}
                    onClick={() => setActiveMedia(i)}
                  >
                    {item.type === "video" ? (
                      <>
                        <video className="thumb" muted preload="metadata">
                          <source src={item.src} type="video/mp4" />
                        </video>
                        <span className="thumb-play" aria-hidden="true">
                          <Icon name="play" size={14} />
                        </span>
                      </>
                    ) : (
                      <img
                        src={item.src}
                        alt=""
                        className="thumb"
                        loading="lazy"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="modal-info">
            {links.length > 0 && (
              <div className="modal-links">
                {links.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-link"
                  >
                    <Icon name={link.icon} size={15} />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            )}

            {project.credentials && (
              <div className="modal-credentials">
                <span className="modal-credentials__title">
                  <Icon name="key" size={14} />
                  Credenciales de prueba
                </span>
                {project.credentials.email && (
                  <code>{project.credentials.email}</code>
                )}
                {project.credentials.password && (
                  <code>{project.credentials.password}</code>
                )}
              </div>
            )}

            <p className="modal-description">{project.details}</p>

            {project.technologies?.length > 0 && (
              <div className="modal-tags">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="modal-tag"
                    style={{ "--tag-color": getTechColor(tech) }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {total > 1 && (
          <footer className="modal-footer">
            <button
              type="button"
              className="modal-nav-btn"
              aria-label={`Proyecto anterior: ${prevProject?.title || ""}`}
              onClick={() => onNavigate(-1)}
            >
              <Icon name="chevron-left" size={16} />
              <span className="modal-nav-btn__text">
                <small>Anterior</small>
                {prevProject?.title}
              </span>
            </button>
            <button
              type="button"
              className="modal-nav-btn modal-nav-btn--next"
              aria-label={`Proyecto siguiente: ${nextProject?.title || ""}`}
              onClick={() => onNavigate(1)}
            >
              <span className="modal-nav-btn__text">
                <small>Siguiente</small>
                {nextProject?.title}
              </span>
              <Icon name="chevron-right" size={16} />
            </button>
          </footer>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProjectModal;
