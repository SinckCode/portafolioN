'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import useActiveSection from '@/hooks/useActiveSection';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
import useFocusTrap from '@/hooks/useFocusTrap';
import { HOME_SECTIONS, HOME_SECTION_IDS, NAV_LINKS } from '@/lib/navigation';

// Menú móvil como bottom sheet glass (port de la SPA).

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { y: '100%', transition: { duration: 0.25, ease: 'easeIn' as const } },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface FloatingMenuProps {
  // En el home usa las secciones; en otras páginas usa rutas
  useSections?: boolean;
}

export default function FloatingMenu({ useSections = true }: FloatingMenuProps) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(HOME_SECTION_IDS);
  const sheetRef = useRef<HTMLElement>(null);

  useBodyScrollLock(open);
  useFocusTrap(sheetRef, open);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const items = useSections
    ? HOME_SECTIONS.map((s) => ({ label: s.label, href: `#${s.id}`, icon: s.icon, id: s.id }))
    : NAV_LINKS.map((l) => ({ label: l.label, href: l.href, icon: 'chevron-right', id: l.href }));

  return (
    <>
      <button
        type="button"
        className={`floating-btn${open ? ' open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="floating-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              ref={sheetRef}
              className="floating-sheet"
              aria-label="Menú de navegación"
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <span className="floating-sheet__handle" aria-hidden="true" />
              <motion.ul variants={listVariants} initial="hidden" animate="visible">
                {items.map((item) => (
                  <motion.li key={item.id} variants={itemVariants}>
                    <Link
                      href={item.href}
                      className={useSections && active === item.id ? 'active' : ''}
                      aria-current={useSections && active === item.id ? 'true' : undefined}
                      onClick={() => setOpen(false)}
                    >
                      <Icon name={item.icon} size={18} />
                      <span>{item.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
