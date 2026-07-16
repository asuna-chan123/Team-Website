import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategorySidebar from '../components/CategorySidebar';

const mapMockProducts = (prodList) => {
  return prodList.map(p => {
    if (!p.variants || p.variants.length === 0) {
      return {
        ...p,
        variants: [{
          color: p.color || (p.colors && p.colors[0]) || '',
          size: '',
          price: p.price || 0,
          stock: p.stock || 0,
          image: p.image || (p.images && p.images[0]) || ''
        }]
      };
    }
    return p;
  });
};

const getProductPrice = (p) => {
  const firstVariant = p.variants && p.variants.length > 0 ? p.variants[0] : null;
  return firstVariant ? firstVariant.price : 0;
};

const getProductStock = (p) => {
  const firstVariant = p.variants && p.variants.length > 0 ? p.variants[0] : null;
  return firstVariant ? firstVariant.stock : 0;
};

const getProductAvailability = (p) => {
  const stock = getProductStock(p);
  return stock > 0 ? 'In Stock' : 'Out of Stock';
};

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([
      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(resData => {
          const list = Array.isArray(resData)
            ? resData
            : Array.isArray(resData.data)
              ? resData.data
              : [];
          setProductsList(mapMockProducts(list));
        }),
      fetch('http://localhost:5000/api/categories')
        .then(res => res.json())
        .then(resData => {
          const list = Array.isArray(resData)
            ? resData
            : Array.isArray(resData.data)
              ? resData.data
              : [];
          setCategoriesList(list);
        })
    ])
      .then(() => setLoading(false))
      .catch(err => {
        console.error('Error fetching data in ProductList:', err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, []);
  
  // State variables for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  const [sortOption, setSortOption] = useState('name-az');
  
  // Dynamic Max Price calculation
  const maxPrice = useMemo(() => {
    if (productsList.length === 0) return 3000000;
    const prices = productsList.map(p => getProductPrice(p));
    return Math.max(...prices, 0) || 3000000;
  }, [productsList]);
  
  const [priceLimit, setPriceLimit] = useState(3000000);
  
  // Đồng bộ priceLimit khi maxPrice được tính toán lại sau khi lấy dữ liệu từ backend
  useEffect(() => {
    setPriceLimit(maxPrice);
  }, [maxPrice]);
  
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
    let result = [...productsList];

    // Search query filter (LỖI 8: name, sku, case-insensitive)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p => (p.name && p.name.toLowerCase().includes(query)) ||
             (p.sku && p.sku.toLowerCase().includes(query))
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

    // Color filter (Checking all variants' colors)
    if (selectedColors.length > 0) {
      result = result.filter(p => {
        const productColors = p.variants && Array.isArray(p.variants)
          ? p.variants.map(v => v.color).filter(Boolean)
          : [];
        return selectedColors.some(color => productColors.includes(color));
      });
    }

    // Availability filter (LỖI 5: In Stock / Out of Stock based on variants[0].stock)
    if (selectedAvailabilities.length > 0) {
      result = result.filter(p => {
        const avail = getProductAvailability(p);
        return selectedAvailabilities.includes(avail);
      });
    }

    // Price filter (LỖI 2: filter by variants[0].price)
    if (priceLimit !== undefined && priceLimit !== null && !isNaN(priceLimit)) {
      result = result.filter(p => getProductPrice(p) <= priceLimit);
    }

    // Sorting logic (LỖI 6: Sort Name A-Z, Sort Price, Sort Newest)
    if (sortOption === 'price-asc') {
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    } else if (sortOption === 'name-az') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [productsList, searchQuery, selectedCategories, selectedBrands, selectedColors, selectedAvailabilities, priceLimit, sortOption]);

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

  const categoriesToPass = useMemo(() => {
    if (categoriesList.length > 0) return categoriesList;
    return [...new Set(productsList.map(p => p.category).filter(Boolean))];
  }, [categoriesList, productsList]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 500 }}>Loading Products...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container empty-state" style={{ padding: '120px 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--stock-out)' }}>{error}</h2>
        <button className="btn btn-dark" onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="container product-list-page">
      <div className="product-list-title-row">
        <h1>Explore Products</h1>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="product-list-layout">
        {/* Left Sidebar Filter Container */}
        <CategorySidebar
          categories={categoriesToPass}
          products={productsList}
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
              Showing {filteredProducts.length} of {productsList.length} products
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
                  <option value="newest">Newest</option>
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
