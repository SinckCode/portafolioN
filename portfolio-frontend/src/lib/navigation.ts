// Fuente única de navegación, compartida por Header, DotNavigation,
// FloatingMenu y Footer (port del patrón de la SPA).

export interface NavSection {
  id: string;
  label: string;
  href: string;
  icon: string;
}

// Secciones del home (para dots y scroll)
export const HOME_SECTIONS: NavSection[] = [
  { id: 'home', label: 'Inicio', href: '/#home', icon: 'monitor' },
  { id: 'about', label: 'Sobre mí', href: '/#about', icon: 'user' },
  { id: 'services', label: 'Servicios', href: '/#services', icon: 'zap' },
  { id: 'portfolio', label: 'Portafolio', href: '/#portfolio', icon: 'layers' },
  { id: 'blog', label: 'Blog', href: '/#blog', icon: 'pen' },
  { id: 'contact', label: 'Contacto', href: '/#contact', icon: 'mail' },
];

export const HOME_SECTION_IDS = HOME_SECTIONS.map((s) => s.id);

// Links del header (mezcla secciones del home y rutas)
export const NAV_LINKS = [
  { label: 'Inicio', href: '/#home' },
  { label: 'Servicios', href: '/#services' },
  { label: 'Portafolio', href: '/portafolio' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/#contact' },
];
