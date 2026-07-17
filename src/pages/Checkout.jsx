import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';

export default function Checkout({ user }) {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: 'cod',
  });

  const [isOrdered, setIsOrdered] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000000 ? 0 : 35000; // Free shipping over 1M VND
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const guestId = localStorage.getItem('guestId');
    const orderData = {
      userId: user?.id || null,
      guestId: user ? null : guestId,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || ''
      })),
      shippingDetails: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      },
      paymentMethod: formData.paymentMethod,
      totalAmount: total
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (res.ok) {
        setIsOrdered(true);
        clearCart(); // Clear Redis cart
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  if (isOrdered) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '64px', color: '#4caf50', marginBottom: '24px' }}>✓</div>
        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
          Thank you for your purchase. We have received your order and will contact you shortly to confirm shipping.
        </p>
        <Link to="/" className="btn btn-dark" style={{ padding: '12px 32px' }}>
          Back to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="container checkout-page" style={{ padding: '40px 0' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>Checkout</h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your cart is empty. Add products to checkout.</p>
          <Link to="/products" className="btn btn-dark">Shop Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px' }} className="checkout-layout">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              Shipping Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                  placeholder="0912345678"
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500 }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                placeholder="example@gmail.com"
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500 }}>Shipping Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }}
                placeholder="123 Street, District, City"
              />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid #eee', paddingBottom: '12px', marginTop: '16px' }}>
              Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                border: formData.paymentMethod === 'cod' ? '2px solid #000' : '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                />
                Cash on Delivery (COD)
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                border: formData.paymentMethod === 'bank' ? '2px solid #000' : '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={formData.paymentMethod === 'bank'}
                  onChange={handleInputChange}
                />
                Bank Transfer
              </label>
            </div>

            <button type="submit" className="btn btn-dark" style={{ padding: '16px', fontSize: '16px', fontWeight: 600, marginTop: '24px' }}>
              Place Order (${total.toLocaleString()})
            </button>
          </form>

          {/* Order Summary */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: '12px',
            height: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid #ddd', paddingBottom: '12px', margin: 0 }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.productId} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#fff', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image ? (
                      <img src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/images/products/${item.image}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: '9px', textAlign: 'center', color: '#999', paddingTop: '16px' }}>No Img</div>
                    )}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '13px', margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{item.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #ddd', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toLocaleString()}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px solid #ddd', paddingTop: '12px', marginTop: '4px' }}>
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
