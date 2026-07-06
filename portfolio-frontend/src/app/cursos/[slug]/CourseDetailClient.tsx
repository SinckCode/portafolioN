'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

interface Lesson {
  title: string;
  slug: string;
  type: string;
  duration: number;
  isFree: boolean;
}

interface CourseModule {
  title: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  tags: string[];
  requirements: string[];
  whatYouLearn: string[];
  modules: CourseModule[];
  instructor?: { name: string; avatar?: string };
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="star-rating">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${i < Math.round(rating) ? 'star-rating__star--filled' : 'star-rating__star--empty'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CourseDetailClient({ initialCourse }: { initialCourse?: Course | null }) {
  const params = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(initialCourse ?? null);
  const [loading, setLoading] = useState(!initialCourse);
  const [notFound, setNotFound] = useState(false);
  const [openModule, setOpenModule] = useState<number | null>(0);

  useEffect(() => {
    // El server component ya trajo el curso
    if (initialCourse || !params?.slug) return;
    api
      .getCourse(params.slug)
      .then((data) => setCourse(data as Course))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params?.slug, initialCourse]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <p className="text-on-surface-variant">Cargando curso…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !course) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-on-surface">Curso no encontrado</h1>
          <Link href="/cursos" className="btn btn--primary">
            Volver a cursos
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const modules = course.modules || [];
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const freeLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.filter((l) => l.isFree).length || 0),
    0
  );
  const firstLesson = modules.flatMap((m) => m.lessons || [])[0];

  const includes = [
    `${totalLessons} lecciones en ${modules.length} módulos`,
    course.duration ? `${course.duration} de contenido` : null,
    freeLessons > 0 ? `${freeLessons} lecciones gratis de muestra` : null,
    'Acceso desde cualquier dispositivo',
    'Actualizaciones del contenido',
  ].filter(Boolean) as string[];

  const instructorName = course.instructor?.name || 'Angel Onesto';

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-container/10 to-transparent pb-16">
          <div className="max-w-6xl mx-auto px-6 pt-8">
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 text-primary-container hover:text-primary-container/80 text-sm mb-8 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a cursos
            </Link>

            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1">
                <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 mb-4 inline-block">
                  {LEVEL_LABELS[course.level] || course.level}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-on-surface-variant text-lg mb-6">{course.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {course.reviewCount > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={course.rating} size="lg" />
                      <span className="text-yellow-400 font-medium">{course.rating}</span>
                      <span className="text-on-surface-variant">({course.reviewCount} reseñas)</span>
                    </div>
                  )}
                  <span className="text-on-surface-variant">
                    {course.enrollmentCount || 0} estudiantes
                  </span>
                  {course.duration && (
                    <span className="text-on-surface-variant">{course.duration}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-on-surface font-bold text-sm">
                    {instructorName
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <span className="text-on-surface">{instructorName}</span>
                </div>
              </div>

              {/* Enrollment Card (Desktop) */}
              <div className="hidden lg:block w-80 shrink-0">
                <div className="course-detail__enrollment">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-on-surface">
                      {course.price === 0 ? 'Gratis' : `$${course.price}`}
                    </span>
                  </div>
                  {firstLesson ? (
                    <Link
                      href={`/cursos/${course.slug}/${firstLesson.slug}`}
                      className="btn btn--primary btn--full mb-4 text-center block"
                    >
                      Comenzar curso
                    </Link>
                  ) : (
                    <button className="btn btn--primary btn--full mb-4" disabled>
                      Próximamente
                    </button>
                  )}
                  <div className="space-y-3 pt-4 border-t border-outline-variant">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-3">
                      Este curso incluye
                    </p>
                    {includes.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-on-surface">
                        <svg className="w-4 h-4 text-primary-container shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 space-y-10">
              {/* What you'll learn */}
              {course.whatYouLearn?.length > 0 && (
                <section className="glass-card p-6 md:p-8">
                  <h2 className="text-xl font-bold text-on-surface mb-6">Lo que aprenderás</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.whatYouLearn.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary-container shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-on-surface">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Requirements */}
              {course.requirements?.length > 0 && (
                <section className="glass-card p-6 md:p-8">
                  <h2 className="text-xl font-bold text-on-surface mb-6">Requisitos</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2 text-sm text-on-surface">
                        <span className="text-primary-container mt-0.5">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Modules */}
              <section>
                <h2 className="text-xl font-bold text-on-surface mb-6">Contenido del curso</h2>
                <div className="space-y-3">
                  {modules.map((mod, idx) => (
                    <div key={idx} className="course-detail__module">
                      <button
                        onClick={() => setOpenModule(openModule === idx ? null : idx)}
                        className="course-detail__module-header"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-primary-container font-mono">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-on-surface font-medium">{mod.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant">
                            {mod.lessons?.length || 0} lecciones
                          </span>
                          <svg
                            className={`w-4 h-4 text-on-surface-variant transition-transform ${openModule === idx ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {openModule === idx && (
                        <div className="course-detail__module-lessons">
                          {(mod.lessons || []).map((lesson, li) => (
                            <Link
                              key={li}
                              href={`/cursos/${course.slug}/${lesson.slug}`}
                              className="course-detail__module-lesson"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {lesson.type === 'text' ? (
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  ) : (
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                  )}
                                </svg>
                                <span className="text-sm text-on-surface">{lesson.title}</span>
                                {lesson.isFree && (
                                  <span className="chip chip--sm chip--primary">Gratis</span>
                                )}
                              </div>
                              <span className="text-xs text-on-surface-variant">
                                {lesson.duration ? `${lesson.duration} min` : ''}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Mobile enrollment card */}
            <div className="lg:hidden">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-on-surface">
                    {course.price === 0 ? 'Gratis' : `$${course.price}`}
                  </span>
                  <span className="text-sm text-on-surface-variant">{course.duration}</span>
                </div>
                {firstLesson ? (
                  <Link
                    href={`/cursos/${course.slug}/${firstLesson.slug}`}
                    className="btn btn--primary btn--full text-center block"
                  >
                    Comenzar curso
                  </Link>
                ) : (
                  <button className="btn btn--primary btn--full" disabled>
                    Próximamente
                  </button>
                )}
              </div>
            </div>

            {/* Desktop sidebar placeholder (the sticky card is in the hero) */}
            <div className="hidden lg:block w-80 shrink-0" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
