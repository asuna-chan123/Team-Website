import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

// Category SVG Icons
const CategoryIcons = {
  Headphones: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9M3 14v4a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm18 0v4a3 3 0 0 1-3 3h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Keyboard: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Mouse: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="2" width="12" height="20" rx="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v10M6 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Camera: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Accessories: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export default function Home() {
  const navigate = useNavigate();
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
          setProductsList(list);
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
        console.error('Error fetching data in Home:', err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Get featured products (isFeatured === true, cap to 4 items)
  const featuredProducts = productsList.filter(p => p.isFeatured).slice(0, 4);

  // Get explore products (exclude featured products, take next 4 items)
  const exploreProducts = productsList.filter(p => !p.isFeatured).slice(0, 4);

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${categoryName}`);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 500 }}>Loading UpTech Collections...</h3>
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
    <div className="home-page">
      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="container hero-layout-grid">
          <div className="hero-content">
            <span className="hero-tagline">Premium Electronics Store</span>
            <h1 className="hero-title">UpTech. Tomorrow's Tech. Today.</h1>
            <p className="hero-subtitle">
              Explore our curated collections of minimalist, high-performance tech devices designed for creators, developers, and designers.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">Shop Collection</Link>
              <Link to="/about" className="btn btn-secondary">About Us</Link>
            </div>
          </div>
          <div className="hero-visual">
            <img 
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80" 
              alt="Premium Headphones Concept" 
            />
          </div>
        </div>
      </section>

      {/* Shop By Category Section */}
      <section className="section-padding" id="categories-section">
        <div className="container" id="categories">
          <div className="section-header">
            <h2>Shop By Category</h2>
            <p>Find the perfect gear tailored to your exact workflow needs</p>
          </div>
          
          <div className="categories-grid">
            {categoriesList.map((category) => (
              <div 
                key={category} 
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-icon-wrapper">
                  {CategoryIcons[category] || CategoryIcons.Accessories}
                </div>
                <span className="category-name">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Our top-tier picks, engineered for ultimate performance and visual elegance</p>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Explore Collection Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Explore Collection</h2>
            <p>Elevate your digital setup with our modern accessories and devices</p>
          </div>

          <div className="product-grid">
            {exploreProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="explore-all-container">
            <Link to="/products" className="btn btn-dark">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
