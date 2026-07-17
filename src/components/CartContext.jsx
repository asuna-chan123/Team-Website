import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const API_BASE_URL = 'http://localhost:5000';

// Simple helper to get or create guestId
const getOrCreateGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

export function CartProvider({ children, user }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [guestId] = useState(getOrCreateGuestId);

  // Helper to fetch cart from backend
  const fetchCart = async () => {
    try {
      const query = user ? `userId=${user.id}` : `guestId=${guestId}`;
      const res = await fetch(`${API_BASE_URL}/api/cart?${query}`);
      const data = await res.json();
      if (data && data.items) {
        setCartItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  // Fetch cart whenever user ID or guest ID changes
  useEffect(() => {
    fetchCart();
  }, [user?.id, guestId]);

  // Handle merging guest cart with user cart on login
  useEffect(() => {
    if (user?.id) {
      const mergeCarts = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/cart/merge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestId, userId: user.id }),
          });
          const data = await res.json();
          if (data && data.items) {
            setCartItems(data.items);
          }
        } catch (err) {
          console.error('Failed to merge carts:', err);
        }
      };
      mergeCarts();
    }
  }, [user?.id]);

  const addToCart = async (product, quantity = 1) => {
    try {
      const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
      const computedPrice = product.price !== undefined ? product.price : (firstVariant ? firstVariant.price : 0);
      const computedImage = product.image || (firstVariant ? firstVariant.image : (product.images && product.images.length > 0 ? product.images[0] : ''));

      const payload = {
        userId: user?.id || null,
        guestId: user ? null : guestId,
        productId: product.id || product._id,
        name: product.name,
        price: computedPrice,
        quantity,
        image: computedImage || ''
      };
      console.log('Sending addToCart payload:', payload);

      const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          guestId: user ? null : guestId,
          productId: product.id || product._id,
          name: product.name,
          price: computedPrice,
          quantity,
          image: computedImage || ''
        }),
      });
      const data = await res.json();
      if (data && data.items) {
        setCartItems(data.items);
        setIsCartOpen(true); // Open the drawer immediately when added
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          guestId: user ? null : guestId,
          productId,
          quantity
        }),
      });
      const data = await res.json();
      if (data && data.items) {
        setCartItems(data.items);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          guestId: user ? null : guestId,
          productId
        }),
      });
      const data = await res.json();
      if (data && data.items) {
        setCartItems(data.items);
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          guestId: user ? null : guestId
        }),
      });
      const data = await res.json();
      if (data && data.items) {
        setCartItems(data.items);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
