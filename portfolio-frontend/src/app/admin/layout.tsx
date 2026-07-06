'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// roles: qué entradas ve cada rol (editor = "maestro": solo su contenido)
const EDITOR_ALLOWED = ['/admin', '/admin/posts', '/admin/cursos', '/admin/media'];

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/proyectos', label: 'Proyectos', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { href: '/admin/servicios', label: 'Servicios', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { href: '/admin/posts', label: 'Posts', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { href: '/admin/cursos', label: 'Cursos', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/admin/categorias', label: 'Categorias', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { href: '/admin/comentarios', label: 'Comentarios', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/admin/configuracion', label: 'Config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/admin/media', label: 'Media', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAdmin, isStaff } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // drawer móvil
  const [collapsed, setCollapsed] = useState(false); // desktop

  // Preferencia persistida del sidebar
  useEffect(() => {
    setCollapsed(localStorage.getItem('admin:sidebar') === 'collapsed');
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('admin:sidebar', prev ? 'expanded' : 'collapsed');
      return !prev;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Cargando...</p>
      </div>
    );
  }

  // admin y editor (maestro) entran; el resto al login
  if (!user || !isStaff) {
    router.push('/login');
    return null;
  }

  const visibleNavItems = isAdmin
    ? navItems
    : navItems.filter((item) => EDITOR_ALLOWED.includes(item.href));

  return (
    <div className="admin-shell">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className="sidebar__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${sidebarOpen ? ' sidebar--mobile-open' : ''}`}
      >
        <div className="sidebar__header">
          <Link href="/admin" className="sidebar__logo">
            AO<span className="sidebar__logo-dot">.</span>
            <span className="sidebar__label"> Admin</span>
          </Link>

          {/* Colapsar (desktop) */}
          <button
            onClick={toggleCollapsed}
            className="sidebar__collapse-btn"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            <svg
              className={`w-5 h-5 transition-transform${collapsed ? ' rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Cerrar (móvil) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar__close-btn"
            aria-label="Cerrar menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="sidebar__nav">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span className="sidebar__label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <Link href="/" className="sidebar__link" title={collapsed ? 'Volver al sitio' : undefined}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span className="sidebar__label">Volver al sitio</span>
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button onClick={() => setSidebarOpen(true)} className="sidebar__toggle-btn" aria-label="Abrir menú">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className="admin-topbar__user">{user.name}</span>
            <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center text-black font-bold text-sm">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
