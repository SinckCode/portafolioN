'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Course, Lesson, CourseModule } from '@/types';

interface FlatLesson {
  lesson: Lesson;
  moduleIndex: number;
  lessonIndex: number;
}

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();

  const courseSlug = params.slug as string;
  const lessonSlug = params.lesson as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch course data
  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const data = await api.getCourse(courseSlug) as Course;
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseSlug]);

  // Flatten all lessons for prev/next navigation
  const flatLessons = useMemo<FlatLesson[]>(() => {
    if (!course) return [];
    return course.modules.flatMap((mod, mi) =>
      mod.lessons.map((lesson, li) => ({
        lesson,
        moduleIndex: mi,
        lessonIndex: li,
      }))
    );
  }, [course]);

  // Find current lesson position
  const currentIndex = useMemo(() => {
    return flatLessons.findIndex((fl) => fl.lesson.slug === lessonSlug);
  }, [flatLessons, lessonSlug]);

  const currentLesson = currentIndex >= 0 ? flatLessons[currentIndex].lesson : null;
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  // Track progress when lesson is viewed
  useEffect(() => {
    if (!currentLesson || !accessToken || !course) return;
    api.trackPageview(`/cursos/${courseSlug}/${lessonSlug}`).catch(() => {});
  }, [currentLesson, accessToken, course, courseSlug, lessonSlug]);

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-on-surface-variant text-lg">Cargando leccion...</div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <p className="text-on-surface-variant text-lg">
                {error || 'Curso no encontrado'}
              </p>
              <Link href="/cursos" className="btn btn--primary">
                Volver a cursos
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Lesson not found
  if (!currentLesson) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <p className="text-on-surface-variant text-lg">Leccion no encontrada</p>
              <Link href={`/cursos/${courseSlug}`} className="btn btn--primary">
                Volver al curso
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-6">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Link
              href="/cursos"
              className="hover:text-primary-container transition-colors"
            >
              Cursos
            </Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link
              href={`/cursos/${courseSlug}`}
              className="hover:text-primary-container transition-colors"
            >
              {course.title}
            </Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-on-surface">{currentLesson.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Video or Text Content */}
              <div className="glass-card overflow-hidden mb-6">
                {currentLesson.videoUrl ? (
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <video
                      key={currentLesson.videoUrl}
                      className="w-full h-full object-contain bg-black"
                      controls
                      autoPlay={false}
                      preload="metadata"
                    >
                      <source src={currentLesson.videoUrl} />
                      Tu navegador no soporta la reproduccion de video.
                    </video>
                  </div>
                ) : (
                  <div className="p-6 md:p-8 min-h-[300px]">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-primary-container" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="chip chip--sm chip--primary">Lectura</span>
                    </div>
                    <div
                      className="prose prose-invert max-w-none text-on-surface leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    />
                  </div>
                )}
              </div>

              {/* Lesson Info */}
              <div className="glass-card p-6 md:p-8 mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-on-surface mb-2">
                      {currentLesson.title}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      {currentLesson.duration && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {currentLesson.duration} min
                        </span>
                      )}
                      <span className="chip chip--sm chip--primary">
                        {currentLesson.type === 'video' ? 'Video' : currentLesson.type === 'quiz' ? 'Quiz' : 'Texto'}
                      </span>
                      {currentLesson.isFree && (
                        <span className="chip chip--sm chip--active">Gratis</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-on-surface-variant font-mono whitespace-nowrap">
                    {currentIndex + 1} / {flatLessons.length}
                  </span>
                </div>

                {/* Show text content below video if lesson has both */}
                {currentLesson.videoUrl && currentLesson.content && (
                  <div
                    className="prose prose-invert max-w-none text-on-surface leading-relaxed mt-4 pt-4 border-t border-outline-variant"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                )}
              </div>

              {/* Previous / Next Navigation */}
              <div className="flex items-center justify-between gap-4">
                {prevLesson ? (
                  <Link
                    href={`/cursos/${courseSlug}/${prevLesson.lesson.slug}`}
                    className="btn btn--primary flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Anterior:</span>
                    <span className="max-w-[150px] truncate">{prevLesson.lesson.title}</span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Link
                    href={`/cursos/${courseSlug}/${nextLesson.lesson.slug}`}
                    className="btn btn--primary flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Siguiente:</span>
                    <span className="max-w-[150px] truncate">{nextLesson.lesson.title}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    href={`/cursos/${courseSlug}`}
                    className="btn btn--primary flex items-center gap-2"
                  >
                    Finalizar curso
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* Sidebar - Module/Lesson list */}
            <aside className="w-full lg:w-80 shrink-0">
              <div className="glass-card sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">
                {/* Sidebar header */}
                <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-on-surface">
                    Contenido del curso
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={sidebarOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                      />
                    </svg>
                  </button>
                </div>

                {/* Sidebar content */}
                <div
                  className={`overflow-y-auto flex-1 ${sidebarOpen ? '' : 'hidden lg:block'}`}
                >
                  {course.modules.map((mod, mi) => (
                    <div key={mi}>
                      {/* Module header */}
                      <div className="px-4 py-3 bg-[rgba(15,17,21,0.5)] border-b border-[#2a2d35]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-primary-container font-mono">
                            {String(mi + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-medium text-on-surface">
                            {mod.title}
                          </span>
                        </div>
                        <span className="text-xs text-on-surface-variant ml-6">
                          {mod.lessons.length} lecciones
                        </span>
                      </div>

                      {/* Lessons list */}
                      {mod.lessons.map((lesson, li) => {
                        const isActive = lesson.slug === lessonSlug;
                        return (
                          <Link
                            key={li}
                            href={`/cursos/${courseSlug}/${lesson.slug}`}
                            className={`
                              flex items-center justify-between px-4 py-3 text-sm
                              border-b border-[rgba(42,45,53,0.5)] transition-colors
                              ${isActive
                                ? 'bg-primary-container/10 border-l-2 border-l-primary-container'
                                : 'hover:bg-[rgba(26,28,34,0.5)]'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Play/text icon */}
                              <svg
                                className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-container' : 'text-on-surface-variant'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {lesson.type === 'video' ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                )}
                              </svg>
                              <span
                                className={`truncate ${isActive ? 'text-primary-container font-medium' : 'text-on-surface'}`}
                              >
                                {lesson.title}
                              </span>
                              {isActive && (
                                <span className="chip chip--sm chip--active">Actual</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {lesson.isFree && !isActive && (
                                <span className="chip chip--sm chip--primary">Gratis</span>
                              )}
                              {lesson.duration && (
                                <span className="text-xs text-on-surface-variant whitespace-nowrap">
                                  {lesson.duration} min
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
