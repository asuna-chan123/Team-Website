import { useState, useEffect } from 'react';
import { categories } from '../data/categories';
import { products } from '../data/products';

const COLOR_MAP = {
  'Black': '#000000',
  'White': '#ffffff',
  'Gray': '#8e8e93',
  'Beige': '#e8d8c8',
  'Dark Blue': '#1f2d3d',
  'Light Gray': '#d2d2d7',
  'Titan Tự Nhiên': '#beaf9f',
  'Titan Đen': '#232426',
  'Titan Xanh': '#2f4452',
  'Titan Trắng': '#eaeae8',
  'Bạc': '#c0c0c0',
  'Xám': '#808080',
  'Đen': '#000000',
  'Trắng': '#ffffff'
};

const getColorHex = (colorName) => {
  if (COLOR_MAP[colorName]) return COLOR_MAP[colorName];
  const nameLower = colorName.toLowerCase();
  if (nameLower.includes('đen') || nameLower.includes('black') || nameLower.includes('obsidian')) return '#1a1a1a';
  if (nameLower.includes('trắng') || nameLower.includes('white') || nameLower.includes('porcelain')) return '#fcfcfc';
  if (nameLower.includes('xám') || nameLower.includes('gray') || nameLower.includes('grey') || nameLower.includes('titan tự nhiên')) return '#beaf9f';
  if (nameLower.includes('bạc') || nameLower.includes('silver')) return '#e0e0e0';
  if (nameLower.includes('vàng') || nameLower.includes('gold') || nameLower.includes('yellow')) return '#ffd700';
  if (nameLower.includes('tím') || nameLower.includes('purple')) return '#800080';
  if (nameLower.includes('xanh') || nameLower.includes('blue') || nameLower.includes('green')) return '#3b5998';
  if (nameLower.includes('hồng') || nameLower.includes('pink')) return '#ffc0cb';
  if (nameLower.includes('ánh sao') || nameLower.includes('starlight')) return '#eae2d5';
  if (nameLower.includes('đỏ') || nameLower.includes('red')) return '#e60000';
  return '#8e8e93';
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
  const [categoriesList, setCategoriesList] = useState(categories);
  const [productsList, setProductsList] = useState(products);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setCategoriesList(resData.data);
        }
      })
      .catch(err => console.error('Error fetching categories in sidebar:', err));

    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setProductsList(resData.data);
        }
      })
      .catch(err => console.error('Error fetching products in sidebar:', err));
  }, []);

  // Trích xuất các nhãn hiệu duy nhất từ danh sách sản phẩm thực tế
  const allBrands = [...new Set(productsList.map(p => p.brand))].filter(Boolean).sort();

  // Trích xuất các màu sắc duy nhất từ danh sách sản phẩm thực tế
  const allColors = [...new Set(productsList.flatMap(p => p.colors || (p.color ? [p.color] : [])))].filter(Boolean).sort();

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
            {categoriesList.map((category) => (
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
            {allColors.map((colorName) => {
              const hexValue = getColorHex(colorName);
              const isSelected = selectedColors.includes(colorName);
              const isWhite = colorName === 'White' || colorName === 'Trắng';
              
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
              step="10000"
              value={priceLimit}
              onChange={(e) => onPriceLimitChange(Number(e.target.value))}
            />
            <div className="price-values-row">
              <span>0 ₫</span>
              <span><strong>{priceLimit.toLocaleString('vi-VN')} ₫</strong></span>
              <span>{maxPrice.toLocaleString('vi-VN')} ₫</span>
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
