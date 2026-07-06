'use client';

import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { getTechColor, getTypeColor } from '@/lib/techColors';
import { Project } from '@/types';

// Card de proyecto con el diseño de la SPA: media 16:9, badge de tipo
// coloreado, fecha mono, tags por categoría y CTA "Ver detalles".

const formatDate = (dateStr: string): string =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
  });

const MAX_VISIBLE_TAGS = 4;

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const thumbnail = project.images[0] || '/placeholder.png';
  const hasVideo = !!project.video || (project.videos && project.videos.length > 0);
  const visibleTags = project.technologies.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = project.technologies.length - visibleTags.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className="project-card"
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${project.title}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="project-card__media">
        <Image
          src={thumbnail}
          alt={`Captura del proyecto ${project.title}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {hasVideo && (
          <span className="project-card__play-badge" title="Incluye video demo">
            <Icon name="play" size={12} />
            <span>Video</span>
          </span>
        )}
      </div>

      <div className="project-card__body">
        <div className="project-card__top">
          <span
            className="project-card__type"
            style={{ '--badge-color': getTypeColor(project.type) } as React.CSSProperties}
          >
            {project.type}
          </span>
          <span className="project-card__date">
            <Icon name="calendar" size={12} />
            {formatDate(project.date)}
          </span>
        </div>

        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__description">{project.description}</p>

        <div className="project-card__tags">
          {visibleTags.map((tech) => (
            <span
              key={tech}
              className="tag-chip"
              style={{ '--tag-color': getTechColor(tech) } as React.CSSProperties}
            >
              {tech}
            </span>
          ))}
          {hiddenCount > 0 && <span className="tag-chip tag-chip--more">+{hiddenCount}</span>}
        </div>

        <div className="project-card__footer">
          <span className="project-card__cta" aria-hidden="true">
            Ver detalles
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}
