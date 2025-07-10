import React, { useState } from "react";
import "../estilos/FilterPanel.css";

const FilterPanel = ({
  allTechs,
  selectedTechs,
  onToggle,
  onClear,
  onSearch,
  onSort,
  showOnlyWithDemo,
  onToggleDemoFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    onSort(value);
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>🎯 Filtro</h3>
        <div className="sort-demo-wrapper">
          <select
            className="sort-select"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="recent">📅 Más recientes</option>
            <option value="oldest">📂 Más antiguos</option>
          </select>
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

      <input
        type="text"
        placeholder="🔍 Buscar por nombre, descripción o tecnología..."
        className="search-input"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className="filter-tags-wrapper">
        <div className="filter-tags-scroll">
          {allTechs.map((tech) => (
            <button
              key={tech}
              className={`filter-tag ${selectedTechs.includes(tech) ? "active" : ""}`}
              onClick={() => onToggle(tech)}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {selectedTechs.length > 0 && (
        <div className="clear-filters-container">
          <button className="clear-filters" onClick={onClear}>
            ✖ Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
