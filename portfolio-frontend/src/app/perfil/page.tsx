'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

const tabs = ['Mis Cursos', 'Comentarios', 'Certificados'];

export default function PerfilPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Mis Cursos');

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-on-surface-variant">Cargando...</p></div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

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
                onClick={() => setActiveTab(tab)}
                className={`profile__tab ${activeTab === tab ? 'profile__tab--active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-surface-card border border-border rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-outline">No hay {activeTab.toLowerCase()} todavia</p>
            {activeTab === 'Mis Cursos' && (
              <Link href="/cursos" className="inline-block mt-4 text-primary-container hover:underline text-sm">
                Explorar cursos
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
