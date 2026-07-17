import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <h3>Shopping Cart ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)})</h3>
          <button className="cart-drawer-close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p>Your shopping cart is empty</p>
              <button className="btn btn-dark" style={{ marginTop: '16px' }} onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.productId} className="cart-item">
                  <div className="cart-item-img-wrapper">
                    {item.image ? (
                      <img src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/images/products/${item.image}`} alt={item.name} />
                    ) : (
                      <div className="cart-item-no-img">No Image</div>
                    )}
                  </div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-price">${item.price.toLocaleString()}</span>
                    
                    <div className="cart-item-actions">
                      <div className="cart-qty-selector">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                      </div>
                      
                      <button 
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.productId)}
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="cart-subtotal-price">${subtotal.toLocaleString()}</span>
            </div>
            <p className="cart-shipping-note">Taxes and shipping calculated at checkout.</p>
            <div className="cart-footer-buttons">
              <button 
                className="btn btn-dark btn-checkout"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
              >
                Checkout
              </button>
              <button className="btn btn-outline-danger btn-clear-cart" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
