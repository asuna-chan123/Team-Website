import React, { useState } from 'react';
import './Checkout.css';
import { LockIcon } from './icons';

const Checkout = ({ items, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxes = subtotal * 0.05; // 5% tax estimate
  const total = subtotal + taxes;

  return (
    <div className="container">
      <div className="checkout-page">
        <div className="checkout-main">
          
          <div className="checkout-section">
            <h2 className="section-title">
              Contact Information
              <a href="#">Log in</a>
            </h2>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" placeholder="Enter your email" />
            </div>
            <label className="checkbox-group">
              <input type="checkbox" /> Email me with news and offers
            </label>
          </div>

          <hr />

          <div className="checkout-section">
            <h2 className="section-title">Shipping Address</h2>
            <div className="input-group">
              <label className="input-label">Country/Region</label>
              <select className="input-field">
                <option>United States</option>
                <option>Canada</option>
                <option>Vietnam</option>
              </select>
            </div>
            <div className="flex-row">
              <div className="input-group flex-1">
                <label className="input-label">First Name</label>
                <input type="text" className="input-field" />
              </div>
              <div className="input-group flex-1">
                <label className="input-label">Last Name</label>
                <input type="text" className="input-field" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Address</label>
              <input type="text" className="input-field" placeholder="Street address or P.O. Box" />
            </div>
            <div className="input-group">
              <label className="input-label">Apartment, suite, etc. (optional)</label>
              <input type="text" className="input-field" />
            </div>
            <div className="flex-row">
              <div className="input-group flex-1">
                <label className="input-label">City</label>
                <input type="text" className="input-field" />
              </div>
              <div className="input-group flex-1">
                <label className="input-label">State</label>
                <select className="input-field">
                  <option>CA</option>
                  <option>NY</option>
                  <option>TX</option>
                </select>
              </div>
              <div className="input-group flex-1">
                <label className="input-label">Zip Code</label>
                <input type="text" className="input-field" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Phone</label>
              <input type="tel" className="input-field" />
            </div>
          </div>

          <hr />

          <div className="checkout-section">
            <h2 className="section-title">Payment</h2>
            <p className="checkbox-group" style={{marginBottom: '16px'}}>All transactions are secure and encrypted.</p>
            
            <div className="payment-methods">
              <div 
                className={`payment-method ${paymentMethod === 'credit' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('credit')}
              >
                <input type="radio" checked={paymentMethod === 'credit'} readOnly />
                <span>Credit Card</span>
                <span style={{marginLeft: 'auto'}}><LockIcon /></span>
              </div>
              
              {paymentMethod === 'credit' && (
                <div className="payment-details">
                  <div className="input-group">
                    <input type="text" className="input-field" placeholder="Card number" />
                  </div>
                  <div className="flex-row">
                    <div className="input-group flex-1">
                      <input type="text" className="input-field" placeholder="Expiration date (MM / YY)" />
                    </div>
                    <div className="input-group flex-1">
                      <input type="text" className="input-field" placeholder="Security code" />
                    </div>
                  </div>
                  <div className="input-group" style={{marginBottom: 0}}>
                    <input type="text" className="input-field" placeholder="Name on card" />
                  </div>
                </div>
              )}

              <div 
                className={`payment-method ${paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <input type="radio" checked={paymentMethod === 'paypal'} readOnly />
                <span>PayPal</span>
              </div>
            </div>
          </div>

          <button className="btn-primary" style={{marginTop: '24px'}}>
            PAY NOW
          </button>
          <div className="secure-checkout">
            <LockIcon /> Encrypted secure checkout
          </div>
          
          <span className="back-link" onClick={onBack}>
            Return to Cart
          </span>
        </div>

        <div className="checkout-sidebar">
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="mini-cart-items">
            {items.map(item => (
              <div key={item.id} className="mini-cart-item">
                <div className="mini-image-wrap">
                  <img src={item.image} alt={item.name} className="mini-image" />
                  <span className="mini-qty">{item.quantity}</span>
                </div>
                <div className="mini-details">
                  <div className="mini-name">{item.name}</div>
                  <div className="mini-variant">{item.variant}</div>
                </div>
                <div className="mini-price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
              </div>
            ))}
          </div>

          <div className="discount-code">
            <input type="text" className="input-field flex-1" placeholder="Discount code" />
            <button className="btn-secondary">APPLY</button>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row">
            <span>Estimated taxes</span>
            <span>{taxes.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span style={{fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)'}}>VND</span>
            <span style={{marginLeft: 'auto'}}>{total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
