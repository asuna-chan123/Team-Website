import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const {
    id,
    name,
    price,
    images = [],
    image,
    brand,
    stock = 0,
    category
  } = product;

  const isAvailable = stock > 0;
  const fallbackImage = '/images/products/no-image.jpg';

  const rawImage =
    Array.isArray(images) && images.length > 0
      ? images[0]
      : image || fallbackImage;

  // Sử dụng encodeURI cho đường dẫn cục bộ có khoảng trắng
  const productImage = rawImage.startsWith('http')
    ? rawImage
    : encodeURI(rawImage);

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
            // Tránh vòng lặp onError vô hạn nếu ảnh fallback cũng không tải được
            if (event.currentTarget.src !== window.location.origin + fallbackImage && event.currentTarget.src !== fallbackImage) {
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