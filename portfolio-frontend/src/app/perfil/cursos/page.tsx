'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

type Filter = 'all' | 'in-progress' | 'completed';

interface EnrolledCourse {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  duration?: string;
  level?: string;
}

interface Enrollment {
  _id: string;
  course: EnrolledCourse | null;
  overallProgress: number;
  startedAt: string;
  completedAt?: string | null;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

// "Home" del alumno: sus cursos inscritos con progreso real.
export default function MisCursosPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, accessToken } = useAuth();
  const [filter, setFilter] = useState<Filter>('all');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!accessToken) return;
    api
      .getMyEnrollments(accessToken)
      .then((data) => setEnrollments((data as Enrollment[]) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const filtered = enrollments.filter((e) => {
    if (!e.course) return false;
    if (filter === 'completed') return e.overallProgress >= 100;
    if (filter === 'in-progress') return e.overallProgress < 100;
    return true;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="section__title">Mis Cursos</h1>

          <div className="flex gap-2 mb-8 mt-6">
            {(['all', 'in-progress', 'completed'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`chip chip--clickable ${filter === f ? 'chip--active' : ''}`}
              >
                {f === 'all' ? 'Todos' : f === 'in-progress' ? 'En progreso' : 'Completados'}
              </button>
            ))}
          </div>

          {loading || isLoading ? (
            <p className="text-on-surface-variant">Cargando tus cursos…</p>
          ) : filtered.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-outline mb-2">
                {enrollments.length === 0
                  ? 'No estás inscrito en ningún curso'
                  : 'Nada con este filtro'}
              </p>
              <p className="text-outline text-sm mb-4">
                Explora el catálogo y empieza a aprender
              </p>
              <Link href="/cursos" className="btn btn--primary inline-block">
                Explorar cursos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((enrollment) => {
                const course = enrollment.course!;
                const progress = Math.min(Math.round(enrollment.overallProgress || 0), 100);
                return (
                  <Link
                    key={enrollment._id}
                    href={`/cursos/${course.slug}`}
                    className="enrollment-card"
                  >
                    <div className="enrollment-card__body">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h3>{course.title}</h3>
                        <span
                          className={`chip chip--sm ${progress >= 100 ? 'chip--beginner' : 'chip--intermediate'}`}
                        >
                          {progress >= 100 ? 'Completado' : 'En progreso'}
                        </span>
                      </div>
                      <div className="enrollment-card__meta">
                        {course.level && <span>{LEVEL_LABELS[course.level] || course.level}</span>}
                        {course.duration && <span>{course.duration}</span>}
                        <span>{progress}%</span>
                      </div>
                      <div className="enrollment-card__track" aria-hidden="true">
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
