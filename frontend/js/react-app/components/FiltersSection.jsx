import React, { useState } from 'react';

function FiltersSection({ onSearch }) {
  const [filters, setFilters] = useState({
    origen: '',
    cupos: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      ...filters,
      estado: 'activo'
    });
  };

  const handleReset = () => {
    setFilters({
      origen: '',
      cupos: ''
    });
    onSearch({
      origen: '',
      cupos: '',
      estado: 'activo'
    });
  };

  return (
    <section className="filters-section">
      <div className="filters-container">
        <h2 className="section-title">Buscar Viajes</h2>
        <form className="filters-form" onSubmit={handleSubmit}>
          <div className="filter-group">
            <label htmlFor="filterOrigen">Punto de Salida</label>
            <input
              type="text"
              id="filterOrigen"
              name="origen"
              className="input-field"
              placeholder="Bogotá, Colombia"
              value={filters.origen}
              onChange={handleChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="filterCupos">Cupos Disponibles</label>
            <select
              id="filterCupos"
              name="cupos"
              className="input-field"
              value={filters.cupos}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="1">1 cupo</option>
              <option value="2">2 cupos</option>
              <option value="3">3 cupos</option>
              <option value="4">4+ cupos</option>
            </select>
          </div>
          
          <button type="submit" className="btn-search">
            Buscar
          </button>
          
          <button type="button" className="btn-reset" onClick={handleReset}>
            Limpiar
          </button>
        </form>
      </div>
    </section>
  );
}

export default FiltersSection;