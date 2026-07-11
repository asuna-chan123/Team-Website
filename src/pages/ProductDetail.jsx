import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

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
  
  const foundProduct = products.find(p => p.id === id);
  const initialRelated = products
    .filter(p => p.category === (foundProduct ? foundProduct.category : '') && p.id !== id)
    .slice(0, 4);

  const [product, setProduct] = useState(foundProduct || null);
  const [relatedProductsList, setRelatedProductsList] = useState(initialRelated);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch product based on ID param
  useEffect(() => {
    const initialProduct = products.find(p => p.id === id);
    setProduct(initialProduct || null);
    if (initialProduct) {
      setRelatedProductsList(
        products.filter(p => p.category === initialProduct.category && p.id !== id).slice(0, 4)
      );
    }
    setActiveImageIndex(0); // Reset to first image on product change

    // Fetch from backend
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          setProduct(resData.data);
          
          // Once the product is loaded, fetch related products of same category
          fetch(`http://localhost:5000/api/products?category=${encodeURIComponent(resData.data.category)}`)
            .then(r => r.json())
            .then(relData => {
              if (relData.success) {
                setRelatedProductsList(relData.data.filter(p => p.id !== id).slice(0, 4));
              }
            })
            .catch(err => console.error('Error fetching related products:', err));
        }
      })
      .catch(err => console.error('Error fetching product detail:', err));
    
    // Scroll to top of the page on render
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (!product) {
    return (
      <div className="container empty-state" style={{ padding: '120px 0' }}>
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-dark">
          Back to Shop
        </Link>
      </div>
    );
  }

  const { name, price, description, images = [], image, category, stock, brand } = product;
  const isAvailable = stock > 0;
  
  // Ưu tiên hiển thị thông số kỹ thuật (specifications) thực tế từ database
  const specs = (Array.isArray(product.specifications) && product.specifications.length > 0)
    ? product.specifications
    : getCategorySpecs(product);

  const fallbackImage = '/images/products/no-image.jpg';
  const rawImages = Array.isArray(images) && images.length > 0
    ? images
    : [image || fallbackImage];

  // Làm sạch và mã hóa URL đường dẫn ảnh an toàn
  const cleanedImages = rawImages.map(img => img.startsWith('http') ? img : encodeURI(img));

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
                if (event.currentTarget.src !== window.location.origin + fallbackImage && event.currentTarget.src !== fallbackImage) {
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
                      if (event.currentTarget.src !== window.location.origin + fallbackImage && event.currentTarget.src !== fallbackImage) {
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
