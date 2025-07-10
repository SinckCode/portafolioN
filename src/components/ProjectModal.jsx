import React, { useState, useEffect } from "react";
import "../estilos/ProjectModal.css";

const ProjectModal = ({ project, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [media, setMedia] = useState([]);

  // Combina videos + imágenes en una galería unificada
  useEffect(() => {
    const combined = [];

    const videoSources = [
      ...(project?.video ? [project.video] : []),
      ...(Array.isArray(project?.videos) ? project.videos : []),
    ];

    videoSources.forEach((src) => combined.push({ type: "video", src }));

    if (Array.isArray(project?.images)) {
      project.images.forEach((img) =>
        combined.push({ type: "image", src: img })
      );
    }

    setMedia(combined);
    setActiveIndex(0);
  }, [project]);

  const renderMainMedia = () => {
    const current = media[activeIndex];
    if (!current) return null;

    return current.type === "video" ? (
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
        alt={`media-${activeIndex}`}
        className="main-media"
        loading="lazy"
      />
    );
  };

  if (!project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖ Cerrar</button>

        <h2 className="modal-title">{project.title}</h2>

        {/* 🖼 Galería de medios */}
        <div className="modal-carousel">
          <div className="main-media-wrapper">
            {renderMainMedia()}
          </div>

          <div className="thumbnail-row scroll-x">
            {media.map((item, index) => (
              <div
                key={index}
                className={`thumb-wrapper ${index === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                {item.type === "video" ? (
                  <video className="thumb" muted preload="metadata">
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={item.src}
                    alt={`thumb-${index}`}
                    className="thumb"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🔗 Enlaces */}
        <div className="modal-links">
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer">🌐 Demo</a>
          )}
          {project.demos?.map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noopener noreferrer">🌐 Demo {idx + 1}</a>
          ))}
          {project.repos?.frontend && (
            <a href={project.repos.frontend} target="_blank" rel="noopener noreferrer">💻 Frontend</a>
          )}
          {project.repos?.backend && (
            <a href={project.repos.backend} target="_blank" rel="noopener noreferrer">🧠 Backend</a>
          )}
          {project.repos?.hardware && (
            <a href={project.repos.hardware} target="_blank" rel="noopener noreferrer">🔌 Sketch</a>
          )}
          {project.api?.videojuegos && (
            <a href={project.api.videojuegos} target="_blank" rel="noopener noreferrer">🎮 API Juegos</a>
          )}
          {project.api?.empresas && (
            <a href={project.api.empresas} target="_blank" rel="noopener noreferrer">🏢 API Empresas</a>
          )}
        </div>

        {/* 🧾 Descripción */}
        <p className="modal-description">{project.details}</p>

        {/* 🏷️ Etiquetas */}
        {project.technologies?.length > 0 && (
          <div className="modal-tags">
            {project.technologies.map((tech, index) => (
              <span key={index} className="tag">{tech}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;
