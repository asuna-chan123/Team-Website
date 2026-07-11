import React, { useState } from 'react';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import './index.css';

// Placeholder images
const headphoneImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80';
const keyboardImg = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80';

const initialItems = [
  {
    id: '6a51f50b0a59cffcab9d0aa5',
    name: 'iPhone 17 Pro Max',
    variant: 'Màu cam vũ trụ',
    price: 35990000,
    quantity: 1,
    image: 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/342679/iphone-17-pro-max-cam-1-639174800885056316-750x500.jpg'
  },
  {
    id: '6a51e1fc53a135e68160cefd',
    name: 'Tai nghe Bluetooth Không Dây Hifi',
    variant: 'Màu Đen',
    price: 590000,
    quantity: 1,
    image: 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/367818/tai-nghe-bluetooth-chup-tai-sony-wh-1000xx-den-1-639165371248861166-750x500.jpg'
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
