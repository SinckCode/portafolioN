'use client';

import Image from 'next/image';
import { getTypeColor } from '@/lib/techColors';
import { estadoDe } from '@/lib/projectStatus';
import { useProjectModal } from './ProjectModalProvider';
import { Project } from '@/types';

// Tarjeta del catálogo: la captura manda y el texto va sobrepuesto, con los
// datos secundarios (estado, año, stack) en monoespaciada.
//
// Sigue siendo un <a> real a /portafolio/<slug>: así el HTML del listado trae
// los enlaces que necesita un crawler, el proyecto se puede compartir, y
// ctrl+clic o rueda del ratón abren en otra pestaña como en cualquier enlace.
// Lo único que se intercepta es el clic izquierdo simple, que abre el modal.
//
// Es un <a> y no un <Link> a propósito: nunca navegamos desde aquí, así que el
// prefetch de Next solo añadiría tráfico por cada tarjeta en pantalla. Y si el
// JavaScript falla, el enlace sigue llevando a la página completa.
//
// El estado online/local sale de lib/projectStatus: es una etiqueta derivada de
// si el proyecto publica demo, no telemetría del servidor.

const anio = (fecha: string) => (fecha ? fecha.slice(0, 4) : '');

interface ProjectCardProps {
  project: Project;
  /** La primera del listado ocupa el ancho completo. */
  destacada?: boolean;
}

export default function ProjectCard({ project, destacada }: ProjectCardProps) {
  const { abrir } = useProjectModal();
  const estado = estadoDe(project);
  const tieneVideo = Boolean(project.video) || (project.videos?.length ?? 0) > 0;

  const alHacerClic = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Respetar los gestos que el usuario espera de un enlace: abrir en pestaña
    // nueva, en ventana nueva o descargar. Solo el clic simple abre el modal.
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    abrir(project);
  };

  return (
    <a
      href={`/portafolio/${project.slug}`}
      onClick={alHacerClic}
      className={`pc ${destacada ? 'pc--hero' : ''}`}
      aria-label={`Ver ${project.title}`}
    >
      <Image
        src={project.images[0] || '/placeholder.png'}
        alt={`Captura de ${project.title}`}
        fill
        className="pc__img"
        sizes={destacada ? '100vw' : '(max-width: 900px) 100vw, 50vw'}
        priority={destacada}
      />
      <span className="pc__veil" />

      <span className="pc__top">
        <span className={`pc__estado pc__estado--${estado}`}>
          <span className="pc__dot" />
          {estado}
        </span>
        {tieneVideo && <span className="pc__video">video</span>}
      </span>

      <span className="pc__body">
        <span className="pc__linea">
          <span
            className="pc__tipo"
            style={{ '--c': getTypeColor(project.type) } as React.CSSProperties}
          >
            {project.type}
          </span>
          <span className="pc__anio">{anio(project.date)}</span>
        </span>

        <h3 className="pc__name">{project.title}</h3>
        <p className="pc__desc">{project.description}</p>

        <span className="pc__stack">
          {project.technologies.slice(0, 5).map((t) => t.toLowerCase()).join(' · ')}
          {project.technologies.length > 5 && ` · +${project.technologies.length - 5}`}
        </span>
      </span>
    </a>
  );
}
