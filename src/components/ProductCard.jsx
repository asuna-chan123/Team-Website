import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/imageHelper';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const { id, name, brand, category } = product;
  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const price = firstVariant ? firstVariant.price : 0;
  const stock = firstVariant ? firstVariant.stock : 0;

  const isAvailable = stock > 0;
  const fallbackImage = '/images/products/no-image.jpg';
  const productImage = getProductImage(product);

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-card-image">
        <img
          src={productImage}
          alt={name}
          loading="lazy"
          onError={(event) => {
            if (!event.currentTarget.dataset.fallbackApplied) {
              event.currentTarget.dataset.fallbackApplied = 'true';
              event.currentTarget.src = fallbackImage;
            }
          }}
        />
      </div>

      <div className="product-card-info">
        {brand && (
          <span className="product-card-brand">
            {brand}
          </span>
        )}

        <h3 className="product-card-name">
          {name}
        </h3>

        <div className="product-card-subtitle">
          {category}
        </div>

        <div className="product-card-price-row">
          <span className="product-card-price">
            {Number(price || 0).toLocaleString('vi-VN')} ₫
          </span>

          <span
            className={`product-card-status ${isAvailable ? 'in-stock' : 'out-of-stock'
              }`}
          >
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}