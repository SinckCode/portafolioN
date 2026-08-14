'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/Icon';
import { api } from '@/lib/api';

// Detalle de post conectado al CMS (antes era demo hardcodeada):
// contenido markdown real, meta en mono y diseño premium.

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat?: string;
  coverImage?: string;
  author?: { name: string; avatar?: string };
  category?: { name: string; slug: string };
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  readingTime: number;
  views: number;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function BlogPostClient({ initialPost }: { initialPost?: Post | null }) {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(initialPost ?? null);
  const [loading, setLoading] = useState(!initialPost);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // El server component ya trajo el post; no re-consultamos (evita doble conteo de vistas)
    if (initialPost || !params?.slug) return;
    api
      .getPost(params.slug)
      .then((data) => setPost(data as Post))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params?.slug, initialPost]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <p className="text-on-surface-variant">Cargando artículo…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-on-surface">Artículo no encontrado</h1>
          <Link href="/blog" className="hero-btn hero-btn--primary">
            Volver al blog
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const authorName = post.author?.name || 'Angel Onesto';

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <article className="blog-post">
          <div className="blog-post__inner">
            <Link href="/blog" className="blog-post__back">
              <Icon name="arrow-left" size={15} />
              Volver al blog
            </Link>

            <header className="blog-post__header">
              <div className="blog-tags">
                {post.category && (
                  <span className="blog-tag blog-tag--category">
                    {post.category.name}
                  </span>
                )}
                {post.tags?.map((tag) => (
                  <span key={tag} className="blog-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="blog-post__title">{post.title}</h1>
              {post.excerpt && <p className="blog-post__excerpt">{post.excerpt}</p>}

              <div className="blog-post__meta">
                <div className="blog-post__author">
                  <span className="blog-post__author-avatar" aria-hidden="true">
                    {authorName
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <span>{authorName}</span>
                </div>
                <span>
                  <Icon name="calendar" size={13} />
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
                <span>
                  <Icon name="clock" size={13} />
                  {post.readingTime} min de lectura
                </span>
              </div>
            </header>

            {post.coverImage && (
              <div className="blog-post__cover">
                <Image src={post.coverImage} alt="" fill className="object-cover" />
              </div>
            )}

            <div className="blog-post__content">
              {post.contentFormat === 'html' ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.content, {
                      ADD_TAGS: ['iframe'],
                      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'data-callout-type'],
                    }),
                  }}
                />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
              )}
            </div>

            <footer className="blog-post__footer">
              <Link href="/blog" className="hero-btn hero-btn--ghost">
                <Icon name="arrow-left" size={15} />
                Más artículos
              </Link>
              <Link href="/#contact" className="hero-btn hero-btn--primary">
                Hablemos de tu proyecto
              </Link>
            </footer>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
