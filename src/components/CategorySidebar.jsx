import { categories } from '../data/categories';
import { products } from '../data/products';

const COLOR_MAP = {
  'Black': '#000000',
  'White': '#ffffff',
  'Gray': '#8e8e93',
  'Beige': '#e8d8c8',
  'Dark Blue': '#1f2d3d',
  'Light Gray': '#d2d2d7'
};

const AVAILABILITY_OPTIONS = ['In Stock', 'Pre-order'];

export default function CategorySidebar({
  selectedCategories,
  onCategoryChange,
  priceLimit,
  maxPrice,
  onPriceLimitChange,
  selectedBrands,
  onBrandChange,
  selectedColors,
  onColorChange,
  selectedAvailabilities,
  onAvailabilityChange,
  onReset,
  isOpen,
  onClose
}) {
  // Extract unique brands dynamically from products list
  const allBrands = [...new Set(products.map(p => p.brand))].sort();

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const handleBrandToggle = (brand) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandChange([...selectedBrands, brand]);
    }
  };

  const handleColorToggle = (color) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter(c => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  const handleAvailabilityToggle = (option) => {
    if (selectedAvailabilities.includes(option)) {
      onAvailabilityChange(selectedAvailabilities.filter(item => item !== option));
    } else {
      onAvailabilityChange([...selectedAvailabilities, option]);
    }
  };

  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    selectedBrands.length > 0 || 
    selectedColors.length > 0 || 
    selectedAvailabilities.length > 0 || 
    priceLimit < maxPrice;

  return (
    <>
      {/* Background overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      ></div>

      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-title-row">
          <h2 className="sidebar-title">Filters</h2>
          {isOpen && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close filters">
              &times;
            </button>
          )}
          {hasActiveFilters && (
            <button className="btn-reset" onClick={onReset}>
              Reset All
            </button>
          )}
        </div>

        {/* Categories Filter */}
        <div className="filter-group">
          <h3 className="filter-group-title">Categories</h3>
          <div className="filter-list">
            {categories.map((category) => (
              <label key={category} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        {/* Color Filter */}
        <div className="filter-group">
          <h3 className="filter-group-title">Colors</h3>
          <div className="color-swatch-list">
            {Object.keys(COLOR_MAP).map((colorName) => {
              const hexValue = COLOR_MAP[colorName];
              const isSelected = selectedColors.includes(colorName);
              const isWhite = colorName === 'White';
              
              return (
                <button
                  key={colorName}
                  className={`color-swatch-btn ${isSelected ? 'active' : ''} ${isWhite ? 'white-swatch' : ''}`}
                  style={{ backgroundColor: hexValue }}
                  onClick={() => handleColorToggle(colorName)}
                  title={colorName}
                  type="button"
                  aria-label={`Filter by color ${colorName}`}
                >
                  {isSelected && (
                    <span className="swatch-check" style={{ color: isWhite ? '#000' : '#fff' }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Filter */}
        <div className="filter-group">
          <h3 className="filter-group-title">Max Price</h3>
          <div className="price-slider-container">
            <input
              type="range"
              className="price-slider"
              min="0"
              max={maxPrice}
              step="10"
              value={priceLimit}
              onChange={(e) => onPriceLimitChange(Number(e.target.value))}
            />
            <div className="price-values-row">
              <span>$0</span>
              <span><strong>${priceLimit.toLocaleString()}</strong></span>
              <span>${maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Availability Filter */}
        <div className="filter-group">
          <h3 className="filter-group-title">Availability</h3>
          <div className="filter-list">
            {AVAILABILITY_OPTIONS.map((option) => (
              <label key={option} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAvailabilities.includes(option)}
                  onChange={() => handleAvailabilityToggle(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Brands Filter */}
        <div className="filter-group">
          <h3 className="filter-group-title">Brands</h3>
          <div className="filter-list">
            {allBrands.map((brand) => (
              <label key={brand} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
