import ProjectGallery, { type MedioGaleria } from './ProjectGallery';
import { Project } from '@/types';
import { estadoDe } from '@/lib/projectStatus';
import ProjectDetails from './ProjectDetails';

// Cuerpo del detalle de un proyecto. Lo comparten la pagina completa
// (/portafolio/<slug>, la que ve un crawler o quien abre el enlace directo) y el
// modal que se abre al hacer clic desde el listado. Un solo componente para que
// las dos vistas no se desincronicen.

const formatoFecha = (fecha: string): string => {
  if (!fecha) return '';
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
};

const ETIQUETA_REPO: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  hardware: 'Hardware',
  deploy: 'Deploy',
};

interface ProjectDetailContentProps {
  project: Project;
}

export default function ProjectDetailContent({ project }: ProjectDetailContentProps) {
  const repos = Object.entries(project.repos);
  const imagenes = project.images;
  const videos = project.videos?.length
    ? project.videos
    : project.video
      ? [project.video]
      : [];

  // Los videos van primero: son lo que mejor explica un proyecto en
  // movimiento, y es el orden que tenía la galería original.
  const medios: MedioGaleria[] = [
    ...videos.map((src) => ({ tipo: 'video' as const, src })),
    ...imagenes.map((src) => ({ tipo: 'imagen' as const, src })),
  ];

  const demos = [
    ...(project.demo ? [project.demo] : []),
    ...(project.demos ?? []),
  ];
  const estado = estadoDe(project);
  const apis =
    typeof project.api === 'string'
      ? [['API', project.api] as [string, string]]
      : project.api
        ? Object.entries(project.api)
        : [];

  return (
    <article className="pd">
      <header className="pd__head">
        <div className="pd__meta">
          <span className={`pd__estado pd__estado--${estado}`}>
            <span className="pd__dot" />
            {estado}
          </span>
          <span className="pd__tipo">{project.type}</span>
          <span className="pd__fecha">{formatoFecha(project.date)}</span>
        </div>

        <h1 className="pd__title">{project.title}</h1>
        <p className="pd__lead">{project.description}</p>

        <ul className="pd__stack">
          {project.technologies.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </header>

      {medios.length > 0 && (
        <section className="pd__section">
          <h2 className="pd__h2">Galería</h2>
          <ProjectGallery medios={medios} titulo={project.title} />
        </section>
      )}

      {project.details && (
        <section className="pd__section">
          <h2 className="pd__h2">Sobre el proyecto</h2>
          <ProjectDetails details={project.details} />
        </section>
      )}

      {(repos.length > 0 || demos.length > 0 || apis.length > 0 || project.credentials) && (
        <section className="pd__section">
          <h2 className="pd__h2">Enlaces</h2>

          <div className="pd__links">
            {demos.map((url, i) => (
              <a
                key={`demo-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="pd__link pd__link--primary"
              >
                {demos.length > 1 ? `Demo ${i + 1}` : 'Ver en vivo'}
              </a>
            ))}
            {repos.map(([etiqueta, url]) => (
              <a
                key={etiqueta}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="pd__link"
              >
                {ETIQUETA_REPO[etiqueta] ?? etiqueta}
              </a>
            ))}
            {apis.map(([etiqueta, url]) => (
              <a
                key={`api-${etiqueta}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="pd__link"
              >
                {etiqueta === 'API' ? 'API' : `API · ${etiqueta}`}
              </a>
            ))}
          </div>

          {project.credentials && (
            <div className="pd__creds">
              <p className="pd__creds-title">Credenciales de prueba</p>
              <p>
                <span>usuario</span> {project.credentials.email}
              </p>
              <p>
                <span>clave</span> {project.credentials.password}
              </p>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
