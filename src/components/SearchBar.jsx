export default function SearchBar({ value, onChange }) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <span className="search-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" />
          </svg>
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button 
            type="button" 
            className="search-clear-btn" 
            onClick={handleClear}
            aria-label="Clear search query"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
