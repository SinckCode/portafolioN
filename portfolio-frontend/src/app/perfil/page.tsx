'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const tabs = ['Mis Cursos', 'Comentarios', 'Certificados'];

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

interface UserComment {
  _id: string;
  content: string;
  targetType: string;
  targetId: string;
  isApproved: boolean;
  createdAt: string;
}

interface Certificate {
  _id: string;
  course: { title: string; slug: string } | null;
  certificateNumber: string;
  issuedAt: string;
  verificationUrl?: string;
}

export default function PerfilPage() {
  const { user, isLoading, isAuthenticated, accessToken } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Mis Cursos');

  // Tab data states
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Loading / error per tab
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState('');

  // Track which tabs have already been fetched
  const [fetched, setFetched] = useState<Record<string, boolean>>({});

  const fetchTabData = useCallback(async (tab: string) => {
    if (!accessToken || fetched[tab]) return;
    setTabLoading(true);
    setTabError('');
    try {
      if (tab === 'Mis Cursos') {
        const data = await api.getMyEnrollments(accessToken);
        setEnrollments((data as Enrollment[]) || []);
      } else if (tab === 'Comentarios') {
        const data = await api.getMyComments(accessToken);
        const list = Array.isArray(data) ? data : (data as { data: UserComment[] }).data || [];
        setComments(list as UserComment[]);
      } else if (tab === 'Certificados') {
        const data = await api.getMyCertificates(accessToken);
        const list = Array.isArray(data) ? data : (data as { data: Certificate[] }).data || [];
        setCertificates(list as Certificate[]);
      }
      setFetched((prev) => ({ ...prev, [tab]: true }));
    } catch {
      setTabError('No se pudieron cargar los datos.');
    } finally {
      setTabLoading(false);
    }
  }, [accessToken, fetched]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchTabData(activeTab);
    }
  }, [activeTab, isAuthenticated, accessToken, fetchTabData]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-on-surface-variant">Cargando...</p></div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setTabError('');
  };

  const renderEmptyState = (label: string) => (
    <>
      <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-outline">No hay {label} todavia</p>
    </>
  );

  const renderTabContent = () => {
    if (tabLoading) {
      return <p className="text-on-surface-variant">Cargando...</p>;
    }

    if (tabError) {
      return <p className="text-red-400 text-sm">{tabError}</p>;
    }

    if (activeTab === 'Mis Cursos') {
      if (enrollments.length === 0) {
        return (
          <>
            {renderEmptyState('cursos')}
            <Link href="/cursos" className="inline-block mt-4 text-primary-container hover:underline text-sm">
              Explorar cursos
            </Link>
          </>
        );
      }
      return (
        <div className="space-y-4 text-left">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;
            const progress = Math.min(Math.round(enrollment.overallProgress || 0), 100);
            return (
              <Link
                key={enrollment._id}
                href={`/cursos/${course.slug}`}
                className="block bg-surface border border-border rounded-lg p-4 hover:border-primary-container/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="font-medium text-on-surface">{course.title}</h3>
                  <span className={`chip chip--sm ${progress >= 100 ? 'chip--beginner' : 'chip--intermediate'}`}>
                    {progress >= 100 ? 'Completado' : `${progress}%`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'Comentarios') {
      if (comments.length === 0) {
        return renderEmptyState('comentarios');
      }
      return (
        <div className="space-y-4 text-left">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-surface border border-border rounded-lg p-4"
            >
              <p className="text-on-surface text-sm">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                <span>{new Date(comment.createdAt).toLocaleDateString('es-MX')}</span>
                <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
                <span>{comment.targetType === 'post' ? 'Blog' : 'Curso'}</span>
                {!comment.isApproved && (
                  <span className="text-yellow-500">Pendiente</span>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'Certificados') {
      if (certificates.length === 0) {
        return renderEmptyState('certificados');
      }
      return (
        <div className="space-y-4 text-left">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <h3 className="font-medium text-on-surface">{cert.course?.title || 'Curso'}</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Emitido: {new Date(cert.issuedAt).toLocaleDateString('es-MX')} &middot; #{cert.certificateNumber}
                </p>
              </div>
              {cert.verificationUrl && (
                <a
                  href={cert.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-container hover:underline text-sm whitespace-nowrap"
                >
                  Verificar
                </a>
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Profile Card */}
          <div className="profile__card bg-surface-card border border-border rounded-2xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="profile__avatar w-24 h-24 bg-primary-container rounded-full flex items-center justify-center text-black text-3xl font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="profile__name">{user?.name || 'Usuario'}</h1>
                <p className="profile__role">{user?.role || 'subscriber'}</p>
                <p className="profile__bio">
                  {user?.bio || 'Sin biografia'}
                </p>
                <div className="profile__links flex gap-4 mt-3 justify-center sm:justify-start">
                  <a href="https://github.com/SinckCode" target="_blank" rel="noopener noreferrer" className="profile__link">GitHub</a>
                  <a href="mailto:soyangeldavid1@gmail.com" className="profile__link">Email</a>
                </div>
              </div>
              <Link href="/perfil/editar" className="profile__edit-btn">
                Editar perfil
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile__tabs flex gap-1 bg-surface-card border border-border rounded-xl p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`profile__tab ${activeTab === tab ? 'profile__tab--active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-surface-card border border-border rounded-xl p-8 text-center">
            {renderTabContent()}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
