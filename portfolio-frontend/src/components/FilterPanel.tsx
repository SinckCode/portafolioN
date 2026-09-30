'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  buildQuery,
  hasActiveFilters,
  ProjectFilters,
  SortOrder,
} from '@/lib/projectFilters';

// El estado de los filtros vive en la URL, no en este componente: el listado
// se renderiza en el servidor a partir de los searchParams. Aquí solo se
// traduce la interacción a una navegación.

const SEARCH_DEBOUNCE_MS = 300;

interface FilterPanelProps {
  allTechs: string[];
  allTypes: string[];
  filters: ProjectFilters;
  resultCount: number;
  totalCount: number;
}

export default function FilterPanel({
  allTechs,
  allTypes,
  filters,
  resultCount,
  totalCount,
}: FilterPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // El input se mantiene local para que escribir no espere al servidor.
  const [searchDraft, setSearchDraft] = useState(filters.query);
  const lastPushedQuery = useRef(filters.query);

  const navigate = (next: ProjectFilters) => {
    const qs = buildQuery(next);
    startTransition(() => {
      router.push(qs ? `/portafolio?${qs}` : '/portafolio', { scroll: false });
    });
  };

  // Sincroniza el borrador si la URL cambia por fuera (atrás/adelante, limpiar).
  useEffect(() => {
    setSearchDraft(filters.query);
    lastPushedQuery.current = filters.query;
  }, [filters.query]);

  useEffect(() => {
    if (searchDraft === lastPushedQuery.current) return;
    const timer = setTimeout(() => {
      lastPushedQuery.current = searchDraft;
      navigate({ ...filters, query: searchDraft });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const toggleTech = (tech: string) => {
    const techs = filters.techs.includes(tech)
      ? filters.techs.filter((t) => t !== tech)
      : [...filters.techs, tech];
    navigate({ ...filters, techs });
  };

  const showClear = hasActiveFilters(filters) || filters.sort !== 'newest';

  return (
    <div className="filter-panel" data-pending={isPending ? '' : undefined}>
      <input
        type="text"
        placeholder="Buscar proyectos..."
        value={searchDraft}
        onChange={(e) => setSearchDraft(e.target.value)}
        className="input"
        aria-label="Buscar proyectos"
      />

      <div className="filter-panel__row">
        <select
          value={filters.type ?? ''}
          onChange={(e) => navigate({ ...filters, type: e.target.value || null })}
          className="select"
          style={{ width: 'auto' }}
          aria-label="Filtrar por tipo de proyecto"
        >
          <option value="">Todos los tipos</option>
          {allTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => navigate({ ...filters, sort: e.target.value as SortOrder })}
          className="select"
          style={{ width: 'auto' }}
          aria-label="Ordenar proyectos"
        >
          <option value="newest">Mas recientes</option>
          <option value="oldest">Mas antiguos</option>
        </select>

        <label className="filter-panel__checkbox">
          <input
            type="checkbox"
            checked={filters.onlyWithDemo}
            onChange={(e) => navigate({ ...filters, onlyWithDemo: e.target.checked })}
          />
          Solo con demo
        </label>

        <span className="filter-panel__count" aria-live="polite">
          {resultCount === totalCount
            ? `${totalCount} proyectos`
            : `${resultCount} de ${totalCount}`}
        </span>

        {showClear && (
          <button
            onClick={() => router.push('/portafolio', { scroll: false })}
            className="filter-panel__clear"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="filter-panel__chips">
        {allTechs.map((tech) => {
          const isActive = filters.techs.includes(tech);
          return (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`chip chip--clickable ${isActive ? 'chip--active' : ''}`}
              aria-pressed={isActive}
            >
              {tech}
            </button>
          );
        })}
      </div>
    </div>
  );
}
