// Fuente única de las secciones del sitio, compartida por
// Header, DotNavigation, FloatingMenu y Footer.

export const SECTIONS = [
  { id: "home", label: "Inicio", icon: "monitor" },
  { id: "about", label: "Sobre mí", icon: "user" },
  { id: "services", label: "Servicios", icon: "zap" },
  { id: "portfolio", label: "Portafolio", icon: "layers" },
  { id: "blog", label: "Blog", icon: "pen" },
  { id: "contact", label: "Contacto", icon: "mail" },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);
