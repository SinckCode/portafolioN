'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BlogFiltersProps {
  categorias: string[];
  busquedaActual: string;
  categoriaActual: string;
}

/**
 * Busqueda y categorias del blog.
 *
 * Los filtros viven en la URL, no en estado local, por dos razones: el listado
 * se renderiza en el servidor (un crawler tiene que recibir las tarjetas ya
 * escritas en el HTML) y asi una busqueda se puede compartir o recargar sin
 * perderla, igual que en /portafolio.
 */
export default function BlogFilters({
  categorias,
  busquedaActual,
  categoriaActual,
}: BlogFiltersProps) {
  const router = useRouter();
  const [texto, setTexto] = useState(busquedaActual);

  // Si se navega atras o adelante, el input debe seguir a la URL.
  useEffect(() => {
    setTexto(busquedaActual);
  }, [busquedaActual]);

  const navegar = (busqueda: string, categoria: string) => {
    const qs = new URLSearchParams();
    if (busqueda.trim()) qs.set('q', busqueda.trim());
    if (categoria) qs.set('categoria', categoria);
    const cadena = qs.toString();
    router.push(cadena ? `/blog?${cadena}` : '/blog', { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <form
        className="input__wrapper w-full md:w-80"
        onSubmit={(e) => {
          e.preventDefault();
          navegar(texto, categoriaActual);
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
          placeholder="Buscar artículos..."
          aria-label="Buscar artículos"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="input input--with-icon"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navegar(texto, '')}
          className={`chip chip--clickable ${categoriaActual === '' ? 'chip--active' : ''}`}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => navegar(texto, cat)}
            className={`chip chip--clickable ${categoriaActual === cat ? 'chip--active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
