import { Link } from 'react-router-dom';
import '../styles/landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Landing Navbar */}
      <nav className="landing-navbar">
        <Link to="/" className="landing-brand">AgriGov Market</Link>
        <div className="landing-nav-center">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="landing-nav-right">
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/register" className="btn-register">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">WHERE <span>FARMERS</span>,<br/>BUYERS AND<br/>TRANSPORTERS CONNECT</h1>
          <p className="hero-subtitle">
            A smart digital platform for agricultural trade, transparent pricing, and efficient delivery across the ecosystem.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary-large">Get Started</Link>
            <Link to="/login" className="btn-secondary-large">Login to Account</Link>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/hero_image.png" alt="AgriGov Market Platform" className="hero-image" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section" style={{ background: 'white' }}>
        <h2 className="section-title">Powering Agricultural Trade</h2>
        <p className="section-subtitle">
          AgriGov Market bridges the gap between local farmers and large-scale buyers, providing 
          a secure, transparent, and highly efficient marketplace integrated with real-time logistics.
        </p>
      </section>

      {/* Actors Section */}
      <section id="services" className="section">
        <h2 className="section-title">Who is it for?</h2>
        <p className="section-subtitle">Built for every key player in the agricultural supply chain.</p>
        
        <div className="actors-grid">
          <div className="actor-card">
            <div className="actor-icon">🌾</div>
            <h3>Farmers</h3>
            <p>Access direct markets, manage your products securely, and get the best prices without middlemen.</p>
          </div>
          <div className="actor-card">
            <div className="actor-icon">🛒</div>
            <h3>Buyers</h3>
            <p>Source high-quality, fresh produce directly from verified local farmers with full transparency.</p>
          </div>
          <div className="actor-card">
            <div className="actor-icon">🚚</div>
            <h3>Transporters</h3>
            <p>Find optimized routes, secure delivery contracts seamlessly, and grow your logistics business.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">AgriGov Market</div>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} AgriGov Market. Built for sustainable agriculture.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
