'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ETIQUETA_NIVEL, type NivelCurso } from '@/lib/courses';

interface CourseFiltersProps {
  niveles: NivelCurso[];
  categorias: string[];
  busquedaActual: string;
  nivelActual: string;
  categoriaActual: string;
}

/**
 * Busqueda, nivel y categoria de /cursos.
 *
 * Mismo patron que BlogFilters: los filtros viven en la URL y no en estado
 * local, porque el listado se renderiza en el servidor y un crawler tiene que
 * recibir las tarjetas ya escritas en el HTML. De paso, un filtro se puede
 * compartir o recargar sin perderlo.
 *
 * Los niveles y las categorias llegan desde el servidor derivados de los cursos
 * que existen: antes estaban escritos a mano en la pagina ('Desarrollo Web',
 * 'DevOps', 'IoT') y ofrecian filtros que no devolvian nada.
 */
export default function CourseFilters({
  niveles,
  categorias,
  busquedaActual,
  nivelActual,
  categoriaActual,
}: CourseFiltersProps) {
  const router = useRouter();
  const [texto, setTexto] = useState(busquedaActual);

  // Si se navega atras o adelante, el input debe seguir a la URL.
  useEffect(() => {
    setTexto(busquedaActual);
  }, [busquedaActual]);

  const navegar = (busqueda: string, nivel: string, categoria: string) => {
    const qs = new URLSearchParams();
    if (busqueda.trim()) qs.set('q', busqueda.trim());
    if (nivel) qs.set('nivel', nivel);
    if (categoria) qs.set('categoria', categoria);
    const cadena = qs.toString();
    router.push(cadena ? `/cursos?${cadena}` : '/cursos', { scroll: false });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <form
          className="input__wrapper w-full lg:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            navegar(texto, nivelActual, categoriaActual);
          }}
          role="search"
        >
          <svg
            className="input__icon w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Buscar cursos..."
            aria-label="Buscar cursos"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="input input--with-icon"
          />
        </form>

        {niveles.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-on-surface-variant self-center mr-1">
              Nivel:
            </span>
            <button
              type="button"
              onClick={() => navegar(texto, '', categoriaActual)}
              className={`chip chip--clickable chip--sm ${nivelActual === '' ? 'chip--active' : ''}`}
            >
              Todos
            </button>
            {niveles.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => navegar(texto, n, categoriaActual)}
                className={`chip chip--clickable chip--sm ${nivelActual === n ? 'chip--active' : ''}`}
              >
                {ETIQUETA_NIVEL[n]}
              </button>
            ))}
          </div>
        )}

        {categorias.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-on-surface-variant self-center mr-1">
              Categoría:
            </span>
            <button
              type="button"
              onClick={() => navegar(texto, nivelActual, '')}
              className={`chip chip--clickable chip--sm ${categoriaActual === '' ? 'chip--active' : ''}`}
            >
              Todos
            </button>
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => navegar(texto, nivelActual, c)}
                className={`chip chip--clickable chip--sm ${categoriaActual === c ? 'chip--active' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
