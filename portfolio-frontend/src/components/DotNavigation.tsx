'use client';

import useActiveSection from '@/hooks/useActiveSection';
import { HOME_SECTIONS, HOME_SECTION_IDS } from '@/lib/navigation';

// Indicador de secciones del home (port de la SPA): dots con tooltip glass
// en hover/focus, hit area de 44px y hairline vertical.
export default function DotNavigation() {
  const active = useActiveSection(HOME_SECTION_IDS);

  return (
    <nav className="dot-navigation" aria-label="Progreso de secciones">
      {HOME_SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`dot${active === section.id ? ' active' : ''}`}
          aria-label={section.label}
          aria-current={active === section.id ? 'true' : undefined}
        >
          <span className="dot__circle" aria-hidden="true" />
          <span className="dot__tooltip" aria-hidden="true">
            {section.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
