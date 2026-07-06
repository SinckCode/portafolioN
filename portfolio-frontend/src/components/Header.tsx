'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingMenu from '@/components/FloatingMenu';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { NAV_LINKS } from '@/lib/navigation';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

// Header premium: monograma AO. + subrayado animado + glass on scroll
// + sesión (Iniciar sesión / chip de usuario con menú).
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fuera del home el navbar siempre lleva fondo glass (no hay hero detrás)
  const isHome = pathname === '/';

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return undefined;
    }
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  // Cierra el menú de usuario al hacer clic fuera o con Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeHref =
    NAV_LINKS.find((l) => !l.href.startsWith('/#') && isActive(l.href))?.href ??
    (pathname === '/' ? '/#home' : null);

  const avatarSrc = user?.avatar
    ? user.avatar.startsWith('/uploads')
      ? `${API_ORIGIN}${user.avatar}`
      : user.avatar
    : null;

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push('/');
  };

  return (
    <>
      {/* Menú móvil disponible en TODAS las páginas */}
      <FloatingMenu useSections={isHome} />
      <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="navbar__container">
          <Link href="/" className="navbar__logo">
            AO<span className="navbar__logo-dot">.</span>
          </Link>

          <nav className="navbar__nav" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => {
              const active = link.href === activeHref;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`navbar__link${active ? ' navbar__link--active' : ''}`}
                  aria-current={active ? 'true' : undefined}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      className="navbar__underline"
                      layoutId="nav-underline"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sesión */}
          <div className="navbar__auth" ref={menuRef}>
            {!isAuthenticated ? (
              <Link href="/login" className="navbar__login-btn">
                Iniciar sesión
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className="user-chip"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarSrc} alt="" className="user-chip__avatar" />
                  ) : (
                    <span className="user-chip__initials" aria-hidden="true">
                      {initials}
                    </span>
                  )}
                  <span className="user-chip__name">{user?.name}</span>
                  <Icon name="chevron-down" size={14} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      className="user-menu"
                      role="menu"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="user-menu__header">
                        <span className="user-menu__name">{user?.name}</span>
                        <span className="user-menu__email">{user?.email}</span>
                      </div>
                      <Link href="/perfil" role="menuitem" onClick={() => setMenuOpen(false)}>
                        <Icon name="user" size={16} />
                        Mi perfil
                      </Link>
                      <Link href="/perfil/cursos" role="menuitem" onClick={() => setMenuOpen(false)}>
                        <Icon name="layers" size={16} />
                        Mis cursos
                      </Link>
                      {isStaff && (
                        <Link href="/admin" role="menuitem" onClick={() => setMenuOpen(false)}>
                          <Icon name="monitor" size={16} />
                          Panel
                        </Link>
                      )}
                      <button type="button" role="menuitem" onClick={handleLogout}>
                        <Icon name="arrow-left" size={16} />
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
