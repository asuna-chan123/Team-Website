import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>UpTech</h3>
          <p>Experiencing tomorrow's technology today. We curate premium, high-performance electronics with a minimalist Apple-inspired aesthetic.</p>
        </div>

        <div className="footer-column">
          <h4>Products</h4>
          <ul>
            <li><Link to="/products?category=Headphones">Headphones</Link></li>
            <li><Link to="/products?category=Keyboard">Keyboards</Link></li>
            <li><Link to="/products?category=Mouse">Mice</Link></li>
            <li><Link to="/products?category=Camera">Cameras</Link></li>
            <li><Link to="/products?category=Accessories">Accessories</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#shipping">Shipping & Returns</a></li>
            <li><a href="#warranty">Warranty Info</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#press">Press Kit</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} UpTech Inc. All rights reserved. Designed for premium electronics.
        </p>
        <div className="footer-socials">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">Twitter</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
