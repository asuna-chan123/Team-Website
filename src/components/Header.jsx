import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

export default function Header() {
  const { cartItems, setIsCartOpen } = useCart();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Left Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          Up<span>Tech</span>
        </Link>

        {/* Center Menu */}
        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'active' : ''} 
            end
            onClick={closeMenu}
          >
            HOME
          </NavLink>
          <NavLink 
            to="/products" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            CATALOGUE
          </NavLink>
          <NavLink 
            to="/products?filter=collections" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            COLLECTIONS
          </NavLink>
          <NavLink 
            to="/products?filter=popular" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            POPULAR
          </NavLink>
          <NavLink 
            to="/purchase-history" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            MY ORDERS
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            CONTACTS
          </NavLink>
        </nav>

        {/* Right Icons & Hamburger */}
        <div className="header-right-icons">
          {/* Search Icon */}
          <button className="header-icon-btn" onClick={() => navigate('/products')} aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="header-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          {/* Account Icon (Link to login page) */}
          <Link to="/login" className="header-icon-btn" aria-label="Account">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="header-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>

          {/* History Icon (Link to purchase history) */}
          <Link to="/purchase-history" className="header-icon-btn" aria-label="Purchase History">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="header-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </Link>
          
          {/* Cart Icon */}
          <button className="header-icon-btn" onClick={() => setIsCartOpen(true)} aria-label="Cart" style={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="header-icon">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-badge">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Hamburger Icon for Mobile */}
          <button 
            className={`hamburger ${isMenuOpen ? 'open' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
