import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleCategoriesClick = (e) => {
    e.preventDefault();
    closeMenu();
    const categorySection = document.getElementById('categories-section');
    if (categorySection) {
      categorySection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Left Logo with minimalist Headphones SVG Icon */}
        <NavLink to="/" className="logo" onClick={closeMenu}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          Up<span>Tech</span>
        </NavLink>

        {/* Center/Right Nav Links */}
        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'active' : ''} 
            end
            onClick={closeMenu}
          >
            Home
          </NavLink>
          <NavLink 
            to="/products" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            Products
          </NavLink>
          <a 
            href="#categories" 
            onClick={handleCategoriesClick}
          >
            Categories
          </a>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            Contact
          </NavLink>
        </nav>

        {/* Hamburger Menu for Mobile */}
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
    </header>
  );
}
