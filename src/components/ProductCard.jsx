import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { id, name, price, images, brand, stock, category } = product;
  const isAvailable = stock > 0;

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-card-image">
        <img src={images[0]} alt={name} loading="lazy" />
      </div>
      
      <div className="product-card-info">
        {brand && <span className="product-card-brand">{brand}</span>}
        <h3 className="product-card-name">{name}</h3>
        <div className="product-card-subtitle">{category}</div>
        
        <div className="product-card-price-row">
          <span className="product-card-price">${price.toLocaleString()}</span>
          <span className={`product-card-status ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}
