'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const STAT_ICONS = {
  Proyectos: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  Posts: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  Cursos: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  Usuarios: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
};

const DEFAULT_STATS = [
  { label: 'Proyectos', value: '17', change: '+2 este mes' },
  { label: 'Posts', value: '0', change: 'Sin publicaciones' },
  { label: 'Cursos', value: '0', change: 'Sin cursos' },
  { label: 'Usuarios', value: '1', change: 'Admin' },
];

const quickActions = [
  { label: 'Nuevo Post', href: '/admin/posts?new=true', color: 'status-badge status-badge--info' },
  { label: 'Nuevo Curso', href: '/admin/cursos?new=true', color: 'status-badge status-badge--success' },
  { label: 'Nuevo Proyecto', href: '/admin/proyectos?new=true', color: 'status-badge status-badge--info' },
  { label: 'Ver Sitio', href: '/', color: 'status-badge status-badge--info' },
];

export default function AdminDashboard() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getAnalyticsStats(accessToken!) as any;
        setStats([
          { label: 'Proyectos', value: String(data.totalProjects ?? DEFAULT_STATS[0].value), change: DEFAULT_STATS[0].change },
          { label: 'Posts', value: String(data.totalPosts ?? DEFAULT_STATS[1].value), change: DEFAULT_STATS[1].change },
          { label: 'Cursos', value: String(data.totalCourses ?? DEFAULT_STATS[2].value), change: DEFAULT_STATS[2].change },
          { label: 'Usuarios', value: String(data.totalUsers ?? DEFAULT_STATS[3].value), change: DEFAULT_STATS[3].change },
        ]);
      } catch { /* keep defaults */ }
    }
    if (accessToken) fetchStats();
  }, [accessToken]);

  return (
    <div>
      <h1 className="admin-page__title mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="admin-form__label">{stat.label}</span>
              <svg className="w-5 h-5 text-[#00b4d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={STAT_ICONS[stat.label as keyof typeof STAT_ICONS]} />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="admin-table__cell--muted mt-1" style={{ fontSize: '0.75rem' }}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="admin-page__title mb-3" style={{ fontSize: '1.125rem' }}>Acciones rapidas</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickActions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className={`${action.color} rounded-lg px-4 py-3 text-center hover:opacity-80 transition-opacity`}
          >
            {action.label}
          </a>
        ))}
      </div>

      {/* Recent Activity */}
      <h2 className="admin-page__title mb-3" style={{ fontSize: '1.125rem' }}>Actividad reciente</h2>
      <div className="admin-card p-6">
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-[#2a2d35] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="admin-table__cell--muted">No hay actividad reciente</p>
          <p className="admin-table__cell--muted mt-1" style={{ fontSize: '0.875rem' }}>Crea tu primer post o curso para empezar</p>
        </div>
      </div>
    </div>
  );
}
