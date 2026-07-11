import React from 'react';
import './Cart.css';
import { CloseIcon, MinusIcon, PlusIcon, LockIcon } from './icons';

const Cart = ({ items, updateQuantity, removeItem, onProceed }) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="container">
      <div className="cart-page">
        <div className="cart-main">
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-subtitle">{items.length} items in your cart.</p>

          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-variant">{item.variant}</p>
                  <div className="item-actions">
                    <div className="quantity-selector">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <MinusIcon />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <PlusIcon />
                      </button>
                    </div>
                    <div className="item-price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeItem(item.id)}>
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>0đ</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <button className="btn-primary" onClick={onProceed}>
            Proceed to Checkout
          </button>
          <div className="secure-checkout">
            <LockIcon /> Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
