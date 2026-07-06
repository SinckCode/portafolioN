import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Icon from "./ui/Icon";
import useFocusTrap from "../hooks/useFocusTrap";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import "../estilos/BlogModal.css";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Renderiza los bloques de contenido estructurado de blog.js
const ContentBlock = ({ block }) => {
  switch (block.type) {
    case "h3":
      return <h3>{block.value}</h3>;
    case "code":
      return (
        <pre className="blog-modal__code" data-lang={block.lang}>
          <code>{block.value}</code>
        </pre>
      );
    case "img":
      return <img src={block.src} alt={block.alt || ""} loading="lazy" />;
    case "p":
    default:
      return <p>{block.value}</p>;
  }
};

const BlogModal = ({ post, onClose }) => {
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);

  useBodyScrollLock(true);
  useFocusTrap(contentRef, true);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  return (
    <motion.div
      className="blog-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        ref={contentRef}
        className="blog-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-modal-title"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="blog-modal__header">
          <div className="blog-modal__meta">
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="blog-tag">
                  {tag}
                </span>
              ))}
            </div>
            <span className="blog-modal__date">
              <Icon name="calendar" size={13} />
              {formatDate(post.date)} · {post.readingTime} min
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="blog-modal__close"
            aria-label="Cerrar artículo"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="blog-modal__body">
          <h2 id="blog-modal-title">{post.title}</h2>
          {post.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlogModal;
