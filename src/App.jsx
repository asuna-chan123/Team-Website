import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import LoginForm from './User/SIgnIn';
import Profile from './User/Profile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';

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

function AppContent() {
  const [cartItems, setCartItems] = useState(initialItems);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

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

  const handleOrderSuccess = async (orderData) => {
    // Empty the cart
    setCartItems([]);
    
    // Refresh user profile details to get updated purchaseHistory
    if (currentUser?.id) {
      try {
        const response = await fetch(`http://localhost:5000/api/profile/${currentUser.id}`);
        if (response.ok) {
          const updatedUser = await response.json();
          const normalized = {
            id: updatedUser._id || updatedUser.id,
            fullName: updatedUser.username || updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            avatar: updatedUser.avatar,
            purchaseHistory: updatedUser.purchaseHistory || []
          };
          setCurrentUser(normalized);
          localStorage.setItem('currentUser', JSON.stringify(normalized));
        }
      } catch (error) {
        console.error('Error refreshing user details:', error);
      }
    }
    
    navigate('/profile');
  };

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={
            <LoginForm 
              onSignInSuccess={(user) => {
                setCurrentUser(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath);
              }} 
            />
          } />
          <Route path="/profile" element={
            <Profile 
              userInfo={currentUser} 
              onSignOut={() => {
                setCurrentUser(null);
                localStorage.removeItem('currentUser');
                navigate('/login');
              }}
            />
          } />
          <Route path="/cart" element={
            <Cart
              items={cartItems}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              onProceed={() => {
                if (!currentUser) {
                  localStorage.setItem('redirectAfterLogin', '/checkout');
                  navigate('/login');
                } else {
                  navigate('/checkout');
                }
              }}
            />
          } />
          <Route path="/checkout" element={
            <Checkout
              items={cartItems}
              onBack={() => navigate('/cart')}
              currentUser={currentUser}
              onOrderSuccess={handleOrderSuccess}
            />
          } />
          {/* Fallback route */}
          <Route path="*" element={
            <div className="container empty-state" style={{ padding: '120px 0' }}>
              <h2>Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
              <a href="/" className="btn btn-dark" style={{ marginTop: '16px' }}>Go Home</a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
