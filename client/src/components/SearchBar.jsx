/**
 * components/SearchBar.jsx
 * Controlled search input. The parent decides what to do with the value.
 */

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search skills...' }) {
  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit();
      }}
      role="search"
    >
      <label className="sr-only" htmlFor="search-input">
        Search skills
      </label>
      <input
        id="search-input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}
