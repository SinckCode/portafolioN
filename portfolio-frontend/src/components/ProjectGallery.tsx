'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Galeria del proyecto: un visor grande con tira de miniaturas debajo.
 *
 * Antes los videos se apilaban uno tras otro y las capturas iban en una
 * rejilla: con proyectos de doce o catorce imagenes eso obligaba a recorrer
 * media pagina para verlas, y los videos cargaban todos a la vez. Aqui solo se
 * monta el elemento activo.
 *
 * Los videos van primero porque son lo que mejor explica un proyecto en
 * movimiento, y porque es el orden que tenia la galeria original.
 */

export interface MedioGaleria {
  tipo: 'video' | 'imagen';
  src: string;
}

interface ProjectGalleryProps {
  medios: MedioGaleria[];
  titulo: string;
}

export default function ProjectGallery({ medios, titulo }: ProjectGalleryProps) {
  const [activo, setActivo] = useState(0);
  const tiraRef = useRef<HTMLDivElement>(null);

  const total = medios.length;
  const medio = medios[activo];

  const ir = useCallback(
    (delta: number) => {
      // Circular: desde la ultima, siguiente vuelve a la primera.
      setActivo((i) => (i + delta + total) % total);
    },
    [total],
  );

  // Flechas del teclado, solo cuando el foco esta dentro de la galeria: si se
  // escucharan en document, robarian las flechas al scroll de la pagina.
  const alPulsar = (e: React.KeyboardEvent) => {
    if (total < 2) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      ir(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      ir(-1);
    }
  };

  // Mantener visible la miniatura activa al navegar con flechas.
  useEffect(() => {
    const tira = tiraRef.current;
    if (!tira) return;
    const btn = tira.children[activo] as HTMLElement | undefined;
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activo]);

  if (total === 0) return null;

  return (
    <div className="pg" onKeyDown={alPulsar} tabIndex={-1}>
      <div className="pg__escena">
        {medio.tipo === 'video' ? (
          // key fuerza un <video> nuevo al cambiar de medio: sin el, React
          // reutiliza el elemento y conserva la reproduccion del anterior.
          <video
            key={medio.src}
            src={medio.src}
            controls
            preload="metadata"
            className="pg__video"
          />
        ) : (
          <Image
            key={medio.src}
            src={medio.src}
            alt={`${titulo}, captura ${activo + 1} de ${total}`}
            fill
            className="pg__img"
            sizes="(max-width: 900px) 100vw, 900px"
            priority={activo === 0}
          />
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              className="pg__flecha pg__flecha--izq"
              onClick={() => ir(-1)}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="pg__flecha pg__flecha--der"
              onClick={() => ir(1)}
              aria-label="Siguiente"
            >
              ›
            </button>
            <span className="pg__contador" aria-hidden="true">
              {activo + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="pg__tira" ref={tiraRef} role="tablist" aria-label="Medios del proyecto">
          {medios.map((m, i) => (
            <button
              key={m.src}
              type="button"
              role="tab"
              aria-selected={i === activo}
              aria-label={
                m.tipo === 'video' ? `Video ${i + 1}` : `Captura ${i + 1}`
              }
              className={`pg__miniatura ${i === activo ? 'pg__miniatura--activa' : ''}`}
              onClick={() => setActivo(i)}
            >
              {m.tipo === 'video' ? (
                <span className="pg__miniatura-video" aria-hidden="true">
                  ▶
                </span>
              ) : (
                <Image
                  src={m.src}
                  alt=""
                  fill
                  className="pg__miniatura-img"
                  loading="lazy"
                  sizes="120px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
