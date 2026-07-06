import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./ui/Icon";
import SectionHeading from "./ui/SectionHeading";
import BlogModal from "./BlogModal";
import posts from "../blog";
import "../estilos/BlogSection.css";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const PostMeta = ({ post }) => (
  <div className="blog-meta">
    <span>
      <Icon name="calendar" size={13} />
      {formatDate(post.date)}
    </span>
    <span>
      <Icon name="clock" size={13} />
      {post.readingTime} min de lectura
    </span>
  </div>
);

const PostCover = ({ post, className }) =>
  post.cover ? (
    <img src={post.cover} alt="" className={className} loading="lazy" />
  ) : (
    <div className={`${className} blog-cover--placeholder`} aria-hidden="true">
      <Icon name="pen" size={28} strokeWidth={1.5} />
    </div>
  );

const BlogSection = () => {
  const [activePost, setActivePost] = useState(null);
  const published = posts.filter((p) => p.status === "published");
  const [featured, ...rest] = published;

  const openPost = (post) => setActivePost(post);

  const cardKeyDown = (post) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPost(post);
    }
  };

  return (
    <section id="blog" className="blog-section">
      <div className="blog-inner">
        <SectionHeading
          kicker="Blog"
          title="Notas desde la terminal"
          subtitle="Lo que voy aprendiendo construyendo proyectos reales: DevOps, infraestructura y desarrollo."
        />

        {published.length === 0 ? (
          // Estado "próximamente": se muestra si todos los posts son draft
          <div className="blog-coming-soon" role="status">
            <span className="blog-coming-soon__icon" aria-hidden="true">
              <Icon name="pen" size={36} strokeWidth={1.5} />
            </span>
            <h3>Próximamente</h3>
            <p>
              Estoy escribiendo los primeros artículos. Mientras tanto, puedes
              ver en qué estoy trabajando en GitHub.
            </p>
            <a
              href="https://github.com/SinckCode"
              target="_blank"
              rel="noopener noreferrer"
              className="blog-coming-soon__cta"
            >
              <Icon name="github" size={16} />
              Ver GitHub
            </a>
          </div>
        ) : (
          <motion.div
            className="blog-layout"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.article
              className="blog-featured"
              variants={item}
              role="button"
              tabIndex={0}
              aria-label={`Leer artículo: ${featured.title}`}
              onClick={() => openPost(featured)}
              onKeyDown={cardKeyDown(featured)}
            >
              <PostCover post={featured} className="blog-featured__cover" />
              <div className="blog-featured__body">
                <div className="blog-tags">
                  {featured.tags.map((tag) => (
                    <span key={tag} className="blog-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3>{featured.title}</h3>
                <p>{featured.excerpt}</p>
                <PostMeta post={featured} />
                <span className="blog-read-more" aria-hidden="true">
                  Leer artículo
                  <Icon name="arrow-right" size={14} />
                </span>
              </div>
            </motion.article>

            {rest.length > 0 && (
              <div className="blog-grid">
                {rest.map((post) => (
                  <motion.article
                    key={post.id}
                    className="blog-card"
                    variants={item}
                    role="button"
                    tabIndex={0}
                    aria-label={`Leer artículo: ${post.title}`}
                    onClick={() => openPost(post)}
                    onKeyDown={cardKeyDown(post)}
                  >
                    <PostCover post={post} className="blog-card__cover" />
                    <div className="blog-card__body">
                      <div className="blog-tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="blog-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <PostMeta post={post} />
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {activePost && (
          <BlogModal post={activePost} onClose={() => setActivePost(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default BlogSection;
