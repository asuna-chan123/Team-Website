import React, { useState } from 'react';
import './Checkout.css';
import { LockIcon } from './icons';

const Checkout = ({ items, onBack, currentUser, onOrderSuccess }) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxes = subtotal * 0.05; // 5% tax estimate
  const total = subtotal + taxes;

  const names = (currentUser?.fullName || '').split(' ');
  const initialFirstName = names[0] || '';
  const initialLastName = names.slice(1).join(' ') || '';

  const [email, setEmail] = useState(currentUser?.email || '');
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [address, setAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [apartment, setApartment] = useState('');
  const [country, setCountry] = useState('Vietnam');

  const handleOrder = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          items: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount: total,
          address: `${firstName} ${lastName}, ${address}, ${apartment || ''}, ${country}`
        })
      });

      if (!response.ok) {
        alert('Failed to place order.');
        return;
      }

      const orderData = await response.json();
      if (onOrderSuccess) {
        onOrderSuccess(orderData);
      }
    } catch (error) {
      console.error(error);
      alert('Error placing order.');
    }
  };

  return (
    <div className="container">
      <div className="checkout-page">
        <div className="checkout-main">

          <div className="checkout-section">
            <h2 className="section-title">
              Contact Information
            </h2>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
              <select
                className="input-field"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option>United States</option>
                <option>Canada</option>
                <option>Vietnam</option>
              </select>
            </div>
            <div className="flex-row">
              <div className="input-group flex-1">
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="input-group flex-1">
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Address</label>
              <input
                type="text"
                className="input-field"
                placeholder="Street address or P.O. Box"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Apartment, suite, etc. (optional)</label>
              <input
                type="text"
                className="input-field"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Phone</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleOrder} style={{ marginTop: '24px' }}>
            ORDER NOW
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
            <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>VND</span>
            <span style={{ marginLeft: 'auto' }}>{total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
