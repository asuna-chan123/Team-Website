import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PurchaseHistory({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const guestId = localStorage.getItem('guestId');
      const query = user ? `userId=${user.id}` : `guestId=${guestId}`;

      const res = await fetch(`http://localhost:5000/api/orders?${query}`);
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError('Could not load purchase history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h3>Loading purchase history...</h3>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>Order History</h2>

      {error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '20px 0' }}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-dark">Shop Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: '1px solid var(--border-color, #eee)',
                borderRadius: '12px',
                padding: '24px',
                backgroundColor: 'var(--bg-secondary, #fafafa)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Order ID</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700 }}>#{order._id.substring(0, 8).toUpperCase()}</h4>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Date Placed</span>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status</span>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: order.status === 'Pending' ? '#fff3cd' : '#d4edda',
                      color: order.status === 'Pending' ? '#856404' : '#155724',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      textAlign: 'center',
                      marginTop: '4px'
                    }}
                  >
                    {order.status}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Amount</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    ${order.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items.map((item) => (
                  <div key={item.productId} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/images/products/${item.image}`}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ fontSize: '10px', color: '#999' }}>No Img</div>
                      )}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{item.name}</h5>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Qty: {item.quantity} × ${item.price.toLocaleString()}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Details */}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #eee',
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}
              >
                <strong>Delivery Address:</strong> {order.shippingDetails.fullName} - {order.shippingDetails.phone} | {order.shippingDetails.address}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
