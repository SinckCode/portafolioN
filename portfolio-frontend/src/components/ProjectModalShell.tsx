'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Contenedor del modal de proyecto.
//
// Sólo aporta el comportamiento (cerrar con Escape, con clic en el fondo, y
// bloquear el scroll de atrás). El contenido lo renderiza el servidor, así que
// el modal y la página completa muestran exactamente lo mismo.
//
// Cerrar es router.back(): la URL ya es /portafolio/<slug>, y volver deja al
// visitante donde estaba, con sus filtros intactos.

interface ProjectModalShellProps {
  titulo: string;
  children: React.ReactNode;
}

export default function ProjectModalShell({ titulo, children }: ProjectModalShellProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const cerrar = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', onKey);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [cerrar]);

  return (
    <div
      className="pm"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={cerrar}
    >
      <div className="pm__backdrop" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="pm__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pm__bar">
          <span className="pm__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="pm__path">~/portafolio</span>
          <button onClick={cerrar} className="pm__close" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="pm__scroll">{children}</div>
      </div>
    </div>
  );
}
