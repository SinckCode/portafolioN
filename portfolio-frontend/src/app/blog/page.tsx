'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  category: { name: string } | string;
}

const categories = ['Todos', 'Desarrollo Web', 'DevOps', 'IoT', 'Mobile'];

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Newsletter form state
  const [nlEmail, setNlEmail] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlSuccess, setNlSuccess] = useState('');
  const [nlError, setNlError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail) return;
    setNlLoading(true);
    setNlError('');
    setNlSuccess('');
    try {
      await api.subscribe(nlEmail);
      setNlSuccess('Te has suscrito correctamente.');
      setNlEmail('');
    } catch (err) {
      setNlError(err instanceof Error ? err.message : 'Error al suscribirse');
    } finally {
      setNlLoading(false);
    }
  };

  useEffect(() => {
    api.getPosts({ status: 'published' })
      .then((data) => setPosts((data as { data: Post[] }).data || data as Post[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const catName = typeof post.category === 'string' ? post.category : post.category?.name;
    const matchesCategory =
      activeCategory === 'Todos' || catName === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-on-surface mb-4">
            Blog
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Articulos sobre desarrollo web, DevOps, IoT y tecnologia en
            general.
          </p>
        </section>

        {/* Filters */}
        <section className="max-w-6xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="input__wrapper w-full md:w-80">
              <svg
                className="input__icon w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar articulos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input--with-icon"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`chip chip--clickable ${
                    activeCategory === cat ? 'chip--active' : ''
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading && <p className="text-center text-on-surface-variant col-span-full">Cargando...</p>}
            {filtered.map((post) => (
              <a
                key={post._id}
                href={`/blog/${post.slug}`}
                className="card group"
              >
                {/* Cover gradient placeholder */}
                <div className="card__image">
                  <div className="h-48 bg-gradient-to-br from-primary-container/30 via-surface-card to-primary-container/10 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-primary-container/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card__content">
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('es-MX') : ''}</span>
                    <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
                    <span>{post.readingTime} min lectura</span>
                  </div>
                  <h3 className="card__title text-lg line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="card__description text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="card__chips">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="chip chip--sm chip--primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <p className="empty-state__text">
                No se encontraron articulos.
              </p>
            </div>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="max-w-4xl mx-auto px-6">
          <div className="newsletter">
            <h2 className="newsletter__title">
              Suscribete al newsletter
            </h2>
            <p className="newsletter__text">
              Recibe los ultimos articulos y novedades directamente en tu
              bandeja de entrada.
            </p>
            <form className="newsletter__form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                className="input flex-1"
                required
              />
              <button
                type="submit"
                className="btn btn--primary whitespace-nowrap"
                disabled={nlLoading}
              >
                {nlLoading ? 'Enviando...' : 'Suscribirme'}
              </button>
            </form>
            {nlSuccess && (
              <p className="text-green-400 text-sm mt-3">{nlSuccess}</p>
            )}
            {nlError && (
              <p className="text-red-400 text-sm mt-3">{nlError}</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
