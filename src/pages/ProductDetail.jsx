import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProductImage, normalizeImagePath } from '../utils/imageHelper';

// Helper to generate premium specifications based on product category
const getCategorySpecs = (product) => {
  const specs = [
    { name: 'Brand', value: product.brand },
    { name: 'Category', value: product.category }
  ];

  switch (product.category) {
    case 'Headphones':
      return [
        ...specs,
        { name: 'Connectivity', value: 'Bluetooth 5.2 & 3.5mm Jack' },
        { name: 'Battery Life', value: 'Up to 30 Hours (ANC On)' },
        { name: 'Weight', value: '250g' },
        { name: 'Warranty', value: '1 Year Limited' }
      ];
    case 'Keyboard':
      return [
        ...specs,
        { name: 'Layout', value: 'ANSI Full-Size / Tenkeyless' },
        { name: 'Switches', value: 'Premium Mechanical (Hot-swappable)' },
        { name: 'Backlight', value: 'Customizable RGB illumination' },
        { name: 'Connectivity', value: 'Wireless 2.4GHz / Bluetooth 5.1 / USB-C' }
      ];
    case 'Mouse':
      return [
        ...specs,
        { name: 'Sensor', value: 'High-precision 8K - 32K DPI Sensor' },
        { name: 'Battery Life', value: 'Up to 70 Hours continuous use' },
        { name: 'Weight', value: '63g - 99g (ultra-lightweight)' },
        { name: 'Buttons', value: '6 Programmable Buttons' }
      ];
    case 'Camera':
      return [
        ...specs,
        { name: 'Sensor Type', value: 'APS-C / Full-Frame CMOS' },
        { name: 'Resolution', value: '33MP - 40.2 Megapixels' },
        { name: 'Stabilization', value: '5-Axis In-Body Image Stabilization' },
        { name: 'Video Support', value: '4K 60p / 5.7K RAW recording' }
      ];
    case 'Accessories':
      return [
        ...specs,
        { name: 'Material', value: 'Premium Space Aluminum & Fabric' },
        { name: 'Compatibility', value: 'Universal USB-C / Qi Charging' },
        { name: 'Features', value: 'Compact Foldable Travel Design' },
        { name: 'Warranty', value: '1 Year Manufacturer Warranty' }
      ];
    default:
      return specs;
  }
};

export default function ProductDetail() {
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [relatedProductsList, setRelatedProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch product based on ID param
  useEffect(() => {
    setLoading(true);
    setError("");
    setActiveImageIndex(0); // Reset to first image on product change

    // Fetch from backend
    fetch(`http://localhost:5000/api/products/${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(resData => {
        const loadedProduct = resData.data || resData;
        if (loadedProduct && (loadedProduct.name || loadedProduct._id)) {
          setProduct(loadedProduct);
          
          // Once the product is loaded, fetch related products of same category
          const categoryToFetch = loadedProduct.category || "";
          fetch(`http://localhost:5000/api/products?category=${encodeURIComponent(categoryToFetch)}`)
            .then(r => r.json())
            .then(relData => {
              const relList = Array.isArray(relData)
                ? relData
                : Array.isArray(relData.data)
                  ? relData.data
                  : [];
              setRelatedProductsList(relList.filter(p => p.id !== id && p._id !== loadedProduct._id).slice(0, 4));
            })
            .catch(err => console.error('Error fetching related products:', err));
        } else {
          setError("Product not found");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product detail:', err);
        setError("Error loading product details");
        setLoading(false);
      });
    
    // Scroll to top of the page on render
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 500 }}>Loading Product details...</h3>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container empty-state" style={{ padding: '120px 0' }}>
        <h2>{error || "Product Not Found"}</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-dark">
          Back to Shop
        </Link>
      </div>
    );
  }

  const { name, description, category, brand } = product;
  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const price = firstVariant ? firstVariant.price : 0;
  const stock = firstVariant ? firstVariant.stock : 0;
  const isAvailable = stock > 0;
  
  // Ưu tiên hiển thị thông số kỹ thuật (specifications) thực tế từ database
  const specs = (Array.isArray(product.specifications) && product.specifications.length > 0)
    ? product.specifications
    : getCategorySpecs(product);

  const fallbackImage = '/images/products/no-image.jpg';
  const cleanedImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(normalizeImagePath)
    : [getProductImage(product)];

  // Find related products (same category, excluding current product, max 4 items)
  const relatedProducts = relatedProductsList;

  return (
    <div className="container product-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumbs">
        <Link to="/">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/products">Products</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to={`/products?category=${category}`}>{category}</Link>
        <span className="breadcrumb-separator">/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{name}</span>
      </nav>

      {/* Main Grid: Gallery & Info */}
      <div className="detail-layout">
        {/* Left Column: Image Gallery (Horizontal thumbnail row underneath) */}
        <div className="gallery-container">
          <div className="main-image-wrapper">
            <img 
              src={cleanedImages[activeImageIndex] || fallbackImage} 
              alt={`${name} view ${activeImageIndex + 1}`} 
              onError={(event) => {
                if (!event.currentTarget.dataset.fallbackApplied) {
                  event.currentTarget.dataset.fallbackApplied = 'true';
                  event.currentTarget.src = fallbackImage;
                }
              }}
            />
          </div>
          
          {cleanedImages.length > 1 && (
            <div className="thumbnail-row">
              {cleanedImages.map((imgUrl, index) => (
                <button
                  key={index}
                  className={`thumbnail-btn ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                  onMouseEnter={() => setActiveImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`${name} thumbnail ${index + 1}`} 
                    onError={(event) => {
                      if (!event.currentTarget.dataset.fallbackApplied) {
                        event.currentTarget.dataset.fallbackApplied = 'true';
                        event.currentTarget.src = fallbackImage;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information Panel */}
        <div className="info-panel">
          {brand && <span className="info-brand">{brand}</span>}
          <h1 className="info-name">{name}</h1>
          <div className="info-price">{Number(price || 0).toLocaleString('vi-VN')} ₫</div>
          
          <p className="info-description">{description}</p>
          
          <div className="meta-row">
            <div className="meta-item">
              <span className="meta-label">Availability</span>
              <span className={`meta-value stock-badge ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                {isAvailable ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Product ID</span>
              <span className="meta-value" style={{ color: 'var(--text-secondary)' }}>{id}</span>
            </div>
          </div>

          {/* Add To Cart: UI-Only Static Button */}
          <button 
            type="button" 
            className="btn btn-dark btn-add-to-cart"
            style={{ 
              opacity: isAvailable ? 1 : 0.5, 
              cursor: isAvailable ? 'pointer' : 'not-allowed' 
            }}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </button>

          {/* Specifications Table */}
          <div className="specifications-wrapper">
            <h3 className="specifications-title">Specifications</h3>
            <table className="spec-table">
              <tbody>
                {specs.map((spec, index) => (
                  <tr key={index}>
                    <td className="spec-name">{spec.name}</td>
                    <td className="spec-value">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border-light)', paddingTop: '48px', marginTop: '48px' }}>
          <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px' }}>Related Products</h2>
            <p>Similar premium gear you might appreciate</p>
          </div>
          
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
