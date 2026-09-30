// Renderiza la descripcion larga de un proyecto.
//
// El texto viene de content/projects.json con parrafos separados por linea en
// blanco y listas con vinetas. Antes se volcaba entero dentro de un solo <p>,
// asi que los saltos se colapsaban y quedaba un muro de texto ilegible.
//
// El formato es deliberadamente minimo, no markdown: parrafos, vinetas, y una
// linea que termina en ":" o empieza con una palabra seguida de "." se trata
// como subtitulo del bloque.

interface ProjectDetailsProps {
  details: string;
}

const esVineta = (linea: string) => /^[•\-*]\s+/.test(linea.trim());

/** Un parrafo corto que termina en ":" funciona como encabezado de bloque. */
const esSubtitulo = (bloque: string) =>
  !bloque.includes('\n') && bloque.trim().endsWith(':') && bloque.trim().length < 80;

export default function ProjectDetails({ details }: ProjectDetailsProps) {
  const bloques = details
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="project-details">
      {bloques.map((bloque, i) => {
        const lineas = bloque.split('\n').map((l) => l.trim()).filter(Boolean);
        const vinetas = lineas.filter(esVineta);

        // Bloque de lista: puede traer una linea de introduccion antes.
        if (vinetas.length > 0) {
          const intro = lineas.filter((l) => !esVineta(l));
          return (
            <div key={i}>
              {intro.map((linea, j) => (
                <p key={j} className="project-details__lead">
                  {linea}
                </p>
              ))}
              <ul className="project-details__list">
                {vinetas.map((linea, j) => (
                  <li key={j}>{linea.replace(/^[•\-*]\s+/, '')}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (esSubtitulo(bloque)) {
          return (
            <p key={i} className="project-details__lead">
              {bloque}
            </p>
          );
        }

        return (
          <p key={i} className="project-details__p">
            {bloque}
          </p>
        );
      })}
    </div>
  );
}
