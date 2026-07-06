'use client';

interface FilterPanelProps {
  allTechs: string[];
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOrder: 'newest' | 'oldest';
  onSortChange: (order: 'newest' | 'oldest') => void;
  showOnlyWithDemo: boolean;
  onDemoFilterChange: (checked: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterPanel({
  allTechs, selectedTechs, onToggleTech, searchQuery, onSearchChange,
  sortOrder, onSortChange, showOnlyWithDemo, onDemoFilterChange,
  onClearFilters, hasActiveFilters,
}: FilterPanelProps) {
  return (
    <div className="filter-panel">
      <input
        type="text"
        placeholder="Buscar proyectos..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input"
      />

      <div className="filter-panel__row">
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
          className="select"
          style={{ width: 'auto' }}
        >
          <option value="newest">Mas recientes</option>
          <option value="oldest">Mas antiguos</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dee3e6', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showOnlyWithDemo}
            onChange={(e) => onDemoFilterChange(e.target.checked)}
            style={{ accentColor: '#00b4d8', width: '16px', height: '16px' }}
          />
          Solo con demo
        </label>

        {hasActiveFilters && (
          <button onClick={onClearFilters} className="filter-panel__clear">
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="filter-panel__chips">
        {allTechs.map((tech) => {
          const isActive = selectedTechs.includes(tech);
          return (
            <button
              key={tech}
              onClick={() => onToggleTech(tech)}
              className={`chip chip--clickable ${isActive ? 'chip--active' : ''}`}
            >
              {tech}
            </button>
          );
        })}
      </div>
    </div>
  );
}
