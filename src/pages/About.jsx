export default function About() {
  return (
    <div className="container about-page">
      <div className="about-hero">
        <span className="about-subtitle-tag">About UpTech</span>
        <h1>Engineering the Future of Workspace Tech</h1>
        <p className="about-lead">
          We curate and design minimalist, high-performance electronics engineered specifically for developers, creators, and digital designers.
        </p>
      </div>

      <div className="about-mission-vision">
        <div className="about-card">
          <h2>Our Mission</h2>
          <p>
            To supply professionals and creators with top-tier, selected peripheral hardware that elevates their daily workflow, combines peak performance with tactile pleasure, and values sleek, minimal form factors.
          </p>
        </div>
        <div className="about-card">
          <h2>Our Vision</h2>
          <p>
            To redefine the modern workplace setup into an inspiring, clutter-free space where hardware acts as a natural extension of human creativity and engineering flow.
          </p>
        </div>
      </div>

      <div className="about-categories-section">
        <h2>Curated Collections We Offer</h2>
        <div className="about-categories-grid">
          <div className="about-category-item">
            <h3>Headphones</h3>
            <p>Acoustic isolation and high-fidelity sound for pure concentration.</p>
          </div>
          <div className="about-category-item">
            <h3>Keyboards</h3>
            <p>Tactile, premium custom mechanical keyboards for typing enthusiasts.</p>
          </div>
          <div className="about-category-item">
            <h3>Mice</h3>
            <p>Ergonomic, high-precision controls to navigate projects effortlessly.</p>
          </div>
          <div className="about-category-item">
            <h3>Cameras</h3>
            <p>Professional optical sensors and classic controls for pristine visuals.</p>
          </div>
          <div className="about-category-item">
            <h3>Accessories</h3>
            <p>MagSafe-compatible chargers and workflow tools for high-efficiency setups.</p>
          </div>
        </div>
      </div>

      <div className="about-trust-section">
        <h2>Why Creators Trust UpTech</h2>
        <div className="about-trust-grid">
          <div className="about-trust-card">
            <div className="about-trust-number">01</div>
            <h4>Handpicked Selection</h4>
            <p>We do not host thousands of mediocre products. Every item in our catalog undergoes rigorous evaluation for tactile feedback, material durability, and design integrity.</p>
          </div>
          <div className="about-trust-card">
            <div className="about-trust-number">02</div>
            <h4>Minimalist Aesthetic</h4>
            <p>We believe technology should enhance your space, not clutter it. Our design system prioritizes black, white, gray, beige, and matte finishes that integrate beautifully.</p>
          </div>
          <div className="about-trust-card">
            <div className="about-trust-number">03</div>
            <h4>Uncompromised Quality</h4>
            <p>By partnering directly with elite global manufacturers, we guarantee that all items are authentic, brand new, and come with manufacturer warranties.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
