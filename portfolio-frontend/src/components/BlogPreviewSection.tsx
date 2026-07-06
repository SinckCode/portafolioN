'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { api } from '@/lib/api';

// Preview del blog en el home (diseño de la SPA + posts del CMS):
// 1 destacado + grid, con rama "Próximamente" si no hay publicados.

interface PostPreview {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  readingTime: number;
  publishedAt?: string;
  createdAt: string;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const PostMeta = ({ post }: { post: PostPreview }) => (
  <div className="blog-meta">
    <span>
      <Icon name="calendar" size={13} />
      {formatDate(post.publishedAt || post.createdAt)}
    </span>
    <span>
      <Icon name="clock" size={13} />
      {post.readingTime} min de lectura
    </span>
  </div>
);

const PostCover = ({ post, className }: { post: PostPreview; className: string }) =>
  post.coverImage ? (
    <div className={`${className} blog-cover--image`}>
      <Image src={post.coverImage} alt="" fill className="object-cover" />
    </div>
  ) : (
    <div className={`${className} blog-cover--placeholder`} aria-hidden="true">
      <Icon name="pen" size={28} strokeWidth={1.5} />
    </div>
  );

export default function BlogPreviewSection() {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .getPosts({ limit: '3', status: 'published' })
      .then((data) => {
        const items = ((data as { data: PostPreview[] }).data || []) as PostPreview[];
        setPosts(items);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const [featured, ...rest] = posts;

  return (
    <section id="blog" className="blog-section">
      <div className="blog-inner">
        <SectionHeading
          kicker="Blog"
          title="Notas desde la terminal"
          subtitle="Lo que voy aprendiendo construyendo proyectos reales: DevOps, infraestructura y desarrollo."
        />

        {loaded && posts.length === 0 ? (
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
          featured && (
            <motion.div
              className="blog-layout"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.article className="blog-featured" variants={item}>
                <Link href={`/blog/${featured.slug}`} className="blog-featured__link">
                  <PostCover post={featured} className="blog-featured__cover" />
                  <div className="blog-featured__body">
                    <div className="blog-tags">
                      {featured.tags?.map((tag) => (
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
                </Link>
              </motion.article>

              {rest.length > 0 && (
                <div className="blog-grid">
                  {rest.map((post) => (
                    <motion.article key={post._id} className="blog-card" variants={item}>
                      <Link href={`/blog/${post.slug}`} className="blog-card__link">
                        <PostCover post={post} className="blog-card__cover" />
                        <div className="blog-card__body">
                          <div className="blog-tags">
                            {post.tags?.map((tag) => (
                              <span key={tag} className="blog-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3>{post.title}</h3>
                          <p>{post.excerpt}</p>
                          <PostMeta post={post} />
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}

              <motion.div className="blog-all-link" variants={item}>
                <Link href="/blog" className="hero-btn hero-btn--ghost">
                  Ver todos los artículos
                  <Icon name="arrow-right" size={15} />
                </Link>
              </motion.div>
            </motion.div>
          )
        )}
      </div>
    </section>
  );
}
