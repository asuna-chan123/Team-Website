import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategorySidebar from '../components/CategorySidebar';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State variables for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  const [sortOption, setSortOption] = useState('name-az');
  
  // Dynamic Max Price calculation
  const maxPrice = useMemo(() => {
    return Math.max(...products.map(p => p.price));
  }, []);
  
  const [priceLimit, setPriceLimit] = useState(maxPrice);
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize filters from URL search parameters (e.g. from Shop By Category on Home)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
    
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(query) || 
             p.description.toLowerCase().includes(query) ||
             p.brand.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter(p => selectedColors.includes(p.color));
    }

    // Availability filter
    if (selectedAvailabilities.length > 0) {
      result = result.filter(p => selectedAvailabilities.includes(p.availability));
    }

    // Price filter
    result = result.filter(p => p.price <= priceLimit);

    // Sorting logic
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name-az') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, selectedCategories, selectedBrands, selectedColors, selectedAvailabilities, priceLimit, sortOption]);

  // Handle filter resets
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedAvailabilities([]);
    setPriceLimit(maxPrice);
    setSortOption('name-az');
    setSearchParams({}); // Clear query parameters
  };

  return (
    <div className="container product-list-page">
      <div className="product-list-title-row">
        <h1>Explore Products</h1>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="product-list-layout">
        {/* Left Sidebar Filter Container */}
        <CategorySidebar
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          priceLimit={priceLimit}
          maxPrice={maxPrice}
          onPriceLimitChange={setPriceLimit}
          selectedBrands={selectedBrands}
          onBrandChange={setSelectedBrands}
          selectedColors={selectedColors}
          onColorChange={setSelectedColors}
          selectedAvailabilities={selectedAvailabilities}
          onAvailabilityChange={setSelectedAvailabilities}
          onReset={handleResetFilters}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Right Main Grid Area */}
        <main>
          {/* Controls Bar */}
          <div className="list-controls-row">
            <span className="list-count">
              Showing {filteredProducts.length} of {products.length} products
            </span>

            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Mobile Filter Trigger Button */}
              <button 
                className="btn-mobile-filter" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filters
              </button>

              <div className="sort-select-wrapper">
                <span className="sort-label">Sort by:</span>
                <select 
                  className="sort-select" 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="name-az">Name (A-Z)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <h3>No products found</h3>
              <p>Try clearing filters or searching for something else.</p>
              <button className="btn btn-outline" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
