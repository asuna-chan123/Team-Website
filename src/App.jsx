import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import LoginForm from './User/SIgnIn';
import Profile from './User/Profile';
import { CartProvider } from './components/CartContext';
import CartDrawer from './components/CartDrawer';
import Checkout from './pages/Checkout';
import PurchaseHistory from './pages/PurchaseHistory';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <CartProvider user={user}>
        <Header />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout user={user} />} />
            <Route path="/purchase-history" element={<PurchaseHistory user={user} />} />
            <Route 
              path="/login" 
              element={
                user ? (
                  <Profile userInfo={user} onSignOut={() => setUser(null)} />
                ) : (
                  <LoginForm onSignInSuccess={setUser} />
                )
              } 
            />
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
        <CartDrawer />
      </CartProvider>
    </Router>
  );
}

export default App;
