import React, { useState } from 'react';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import './index.css';

// Placeholder images
const headphoneImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80';
const keyboardImg = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80';

const initialItems = [
  {
    id: 1,
    name: 'Wireless Headphone',
    variant: 'Matte Black',
    price: 300.00,
    quantity: 1,
    image: headphoneImg
  },
  {
    id: 2,
    name: 'Wireless Keyboard',
    variant: 'Space Grey',
    price: 150.00,
    quantity: 1,
    image: keyboardImg
  }
];

function App() {
  const [currentView, setCurrentView] = useState('cart'); // 'cart' or 'checkout'
  const [cartItems, setCartItems] = useState(initialItems);

  const updateQuantity = (id, newQuantity) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="App">
      {currentView === 'cart' ? (
        <Cart
          items={cartItems}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          onProceed={() => setCurrentView('checkout')}
        />
      ) : (
        <Checkout
          items={cartItems}
          onBack={() => setCurrentView('cart')}
        />
      )}
    </div>
  );
}

export default App;
