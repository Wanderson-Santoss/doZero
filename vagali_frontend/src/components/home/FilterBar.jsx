// src/components/home/FilterBar.jsx
import React from "react";
import "./filterbar.css";

const FilterBar = ({ filters, onChange }) => {
  const handleChange = (field, value) => {
    if (!onChange) return;
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="filterbar-wrapper">
      <div className="filterbar-inner">
        {/* CIDADE / REGIÃO */}
        <div className="filter-group">
          <label className="filter-label">Cidade / Região</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Ex: Rio de Janeiro, Centro..."
            value={filters.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>

        {/* NOTA MÍNIMA */}
        <div className="filter-group">
          <label className="filter-label">Nota mínima</label>
          <select
            className="filter-input"
            value={filters.ratingMin?.toString() ?? "0"}
            onChange={(e) => handleChange("ratingMin", parseFloat(e.target.value))}
          >
            <option value="0">Qualquer</option>
            <option value="3">3.0+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>

        {/* ORDENAÇÃO */}
        <div className="filter-group">
          <label className="filter-label">Ordenar por</label>
          <select
            className="filter-input"
            value={filters.sort || "relevance"}
            onChange={(e) => handleChange("sort", e.target.value)}
          >
            <option value="relevance">Relevância</option>
            <option value="rating">Melhor avaliados</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
