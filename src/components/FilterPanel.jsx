import React from "react";
import Icon from "./ui/Icon";
import { getTechColor } from "../utils/techColors";
import "../estilos/FilterPanel.css";

// Panel de filtros totalmente controlado por ProjectsSection:
// así "Limpiar filtros" también resetea la búsqueda y el orden.
const FilterPanel = ({
  allTechs,
  selectedTechs,
  onToggle,
  onClear,
  searchQuery,
  onSearch,
  sortOrder,
  onSort,
  showOnlyWithDemo,
  onToggleDemoFilter,
  resultsCount,
  totalCount,
}) => {
  const hasActiveFilters =
    selectedTechs.length > 0 || searchQuery.trim() !== "" || showOnlyWithDemo;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3 className="filter-title">Filtrar proyectos</h3>
        <div className="sort-demo-wrapper">
          <label className="sort-label">
            <span className="visually-hidden">Ordenar por</span>
            <select
              className="sort-select"
              value={sortOrder}
              onChange={(e) => onSort(e.target.value)}
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
          </label>
          <label className="demo-checkbox">
            <input
              type="checkbox"
              checked={showOnlyWithDemo}
              onChange={onToggleDemoFilter}
            />
            <span>Solo con demo</span>
          </label>
        </div>
      </div>

      <div className="search-wrapper">
        <Icon name="search" size={16} className="search-icon" />
        <input
          type="text"
          id="project-search"
          placeholder="Buscar por nombre o tecnología…"
          aria-label="Buscar proyectos por nombre, descripción o tecnología"
          className="search-input"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear"
            aria-label="Borrar búsqueda"
            onClick={() => onSearch("")}
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <div className="filter-tags-wrapper">
        <div className="filter-tags-scroll" role="group" aria-label="Filtrar por tecnología">
          {allTechs.map((tech) => (
            <button
              key={tech}
              type="button"
              className={`filter-tag${selectedTechs.includes(tech) ? " active" : ""}`}
              style={{ "--tag-color": getTechColor(tech) }}
              aria-pressed={selectedTechs.includes(tech)}
              onClick={() => onToggle(tech)}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-footer">
        <span className="results-count" aria-live="polite">
          {resultsCount} de {totalCount} proyectos
        </span>
        {hasActiveFilters && (
          <button type="button" className="clear-filters" onClick={onClear}>
            <Icon name="close" size={13} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
