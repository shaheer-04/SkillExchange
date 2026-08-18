/**
 * components/FilterBar.jsx
 * Category / Type / Mode dropdowns plus a "Clear filters" button.
 */

import { CATEGORIES, LISTING_TYPES, MODES } from '../constants';

export default function FilterBar({ filters, onChange, onClear, hasActiveFilters }) {
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="filter-bar">
      <div className="filter-field">
        <label htmlFor="filter-category">Category</label>
        <select id="filter-category" value={filters.category} onChange={update('category')}>
          <option value="All">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-type">Type</label>
        <select id="filter-type" value={filters.type} onChange={update('type')}>
          <option value="All">All</option>
          {LISTING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-mode">Mode</label>
        <select id="filter-mode" value={filters.mode} onChange={update('mode')}>
          <option value="All">All</option>
          {MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="btn btn-outline clear-btn"
        onClick={onClear}
        disabled={!hasActiveFilters}
      >
        Clear filters
      </button>
    </div>
  );
}
