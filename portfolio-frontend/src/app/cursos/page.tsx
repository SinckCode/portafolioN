'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

interface CourseItem {
  _id: string;
  title: string;
  slug: string;
  instructor: { name: string } | string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  rating: number;
  enrollmentCount: number;
  price: number;
  category: { name: string } | string;
  tags: string[];
}

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const levelChipClass: Record<string, string> = {
  beginner: 'chip--beginner',
  intermediate: 'chip--intermediate',
  advanced: 'chip--advanced',
};

const levels = ['Todos', 'beginner', 'intermediate', 'advanced'];
const categoriesFilter = ['Todos', 'Desarrollo Web', 'DevOps', 'IoT'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`star-rating__star ${i < Math.round(rating) ? 'star-rating__star--filled' : 'star-rating__star--empty'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="star-rating__value">{rating}</span>
    </div>
  );
}

export default function CursosPage() {
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState('Todos');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses()
      .then((data) => setCourses((data as { data: CourseItem[] }).data || data as CourseItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLevel =
      activeLevel === 'Todos' || course.level === activeLevel;
    const catName = typeof course.category === 'string' ? course.category : course.category?.name;
    const matchesCategory =
      activeCategory === 'Todos' || catName === activeCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-on-surface mb-4">
            Cursos
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Aprende desarrollo web, DevOps, IoT y mas con cursos practicos y
            proyectos reales.
          </p>
        </section>

        {/* Filters */}
        <section className="max-w-6xl mx-auto px-6 mb-12">
          <div className="glass-card p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search */}
              <div className="input__wrapper w-full lg:w-72">
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
                  placeholder="Buscar cursos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input input--with-icon"
                />
              </div>

              {/* Level filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-on-surface-variant self-center mr-1">
                  Nivel:
                </span>
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevel(lvl)}
                    className={`chip chip--clickable chip--sm ${
                      activeLevel === lvl ? 'chip--active' : ''
                    }`}
                  >
                    {lvl === 'Todos' ? 'Todos' : levelLabels[lvl]}
                  </button>
                ))}
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-on-surface-variant self-center mr-1">
                  Categoria:
                </span>
                {categoriesFilter.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`chip chip--clickable chip--sm ${
                      activeCategory === cat ? 'chip--active' : ''
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Course Grid */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading && <p className="text-center text-on-surface-variant col-span-full">Cargando...</p>}
            {filtered.map((course) => (
              <a
                key={course._id}
                href={`/cursos/${course.slug}`}
                className="card group"
              >
                {/* Cover */}
                <div className="card__image">
                  <div className="h-44 bg-gradient-to-br from-primary-container/20 via-surface-card to-primary-container/10 relative">
                    <div className="absolute top-3 right-3">
                      <span
                        className={`chip chip--sm ${levelChipClass[course.level]}`}
                      >
                        {levelLabels[course.level]}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-primary-container/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card__content">
                  <h3 className="card__title text-lg line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-3">
                    {typeof course.instructor === 'string' ? course.instructor : course.instructor?.name}
                  </p>

                  <StarRating rating={course.rating} />

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {course.enrollmentCount}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-primary-container">
                      {course.price === 0
                        ? 'Gratis'
                        : `$${course.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <p className="empty-state__text">
                No se encontraron cursos.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
