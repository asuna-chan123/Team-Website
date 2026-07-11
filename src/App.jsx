import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import LoginForm from './component/SignIn';

function App() {
  return (
    <Router>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginForm />} />
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
    </Router>
  );
}

export default App;
