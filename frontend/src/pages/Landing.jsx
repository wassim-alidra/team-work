import { Link } from 'react-router-dom';
import '../styles/landing.css';
import heroFarm from '../assets/hero-farm.png';

const Landing = () => {
  return (
    <div className="lp-root">
      {/* ── Top Nav Bar ── */}
      <header className="lp-header">
        <nav className="lp-nav">
          <div className="lp-nav-left">
            <span className="lp-brand">AgriGov Market</span>
            <div className="lp-nav-links">
              <a href="#" className="lp-nav-link lp-nav-link--active">Marketplace</a>
              <a href="#mission" className="lp-nav-link">Solutions</a>
              <a href="#audience" className="lp-nav-link">Insights</a>
              <a href="#cta" className="lp-nav-link">About</a>
            </div>
          </div>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-ghost">Login</Link>
            <Link to="/register" className="lp-btn-solid">Get Started</Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ── */}
        <section
          className="lp-hero"
          style={{
            backgroundImage: `url(${heroFarm})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="lp-hero-overlay" />
          <div className="lp-container lp-hero-content">
            <div className="lp-hero-text">
              <h1 className="lp-hero-title">
                WHERE FARMERS, BUYERS AND TRANSPORTERS CONNECT
              </h1>
              <p className="lp-hero-sub">
                A smart digital platform for agricultural trade, transparent pricing,
                and efficient delivery across the ecosystem.
              </p>
              <div className="lp-hero-btns">
                <Link to="/register" className="lp-btn-hero-primary">Get Started</Link>
                <Link to="/login" className="lp-btn-hero-secondary">Login to Account</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission ── */}
        <section id="mission" className="lp-mission">
          <div className="lp-container lp-mission-grid">
            {/* Left – image card */}
            <div className="lp-mission-img-wrap">
              <img
                src="/hero_image.png"
                alt="Lush agricultural fields"
                className="lp-mission-img"
              />
              <div className="lp-mission-badge">
                <span className="lp-material-icon">monitoring</span>
                <p>Real-time supply chain analytics and price monitoring active.</p>
              </div>
            </div>

            {/* Right – copy */}
            <div className="lp-mission-copy">
              <div className="lp-chip">OUR MISSION</div>
              <h2 className="lp-mission-title">Powering Agricultural Trade</h2>
              <p className="lp-mission-body">
                AgriGov Market bridges the gap between local farmers and large-scale buyers,
                providing a secure, transparent, and highly efficient marketplace integrated
                with real-time logistics.
              </p>
              <ul className="lp-check-list">
                <li>
                  <span className="lp-material-icon lp-icon-filled lp-icon-secondary">check_circle</span>
                  Verified governmental security protocols
                </li>
                <li>
                  <span className="lp-material-icon lp-icon-filled lp-icon-secondary">check_circle</span>
                  End-to-end logistics tracking
                </li>
                <li>
                  <span className="lp-material-icon lp-icon-filled lp-icon-secondary">check_circle</span>
                  Direct farmer-to-buyer transactions
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Audience ── */}
        <section id="audience" className="lp-audience">
          <div className="lp-container">
            <div className="lp-section-head">
              <h2 className="lp-section-title">Who is it for?</h2>
              <p className="lp-section-sub">Built for every key player in the agricultural supply chain.</p>
            </div>

            <div className="lp-cards-grid">
              {/* Farmers */}
              <div className="lp-card">
                <div className="lp-card-img-wrap">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf3wvcVyGb_7KH_0w6XtQkga-dnR8VfrVooZ-gouhUdlwYiHOuK5s6_mRsBUV9pvRm96c5tz4rb26iRM5lkh-DzMQDFHbUhmn7mgWoqhq5A1gObu_WjDk_DyEtlKq6OeBkyayFAe1hS63b1zPzHXDLT0z6NJ_C9Z0iBmSdfntNeGSQWcRDQIODxMhUU5oRM7C-VKCxocpEZagYw-cvY2ktsbLQQWCgyjKekfwlrCypjSOpo4LKaZ_21gO9ZtuKiMVMS6aaPa3JxLE"
                    alt="Farmer in field"
                    className="lp-card-img"
                  />
                  <div className="lp-card-icon-badge">
                    <span className="lp-material-icon">agriculture</span>
                  </div>
                </div>
                <div className="lp-card-body">
                  <h3 className="lp-card-title">Farmers</h3>
                  <p className="lp-card-text">
                    Access direct markets, manage your products securely, and get the best
                    prices without middlemen.
                  </p>
                  <a href="#" className="lp-card-link">
                    Explore tools <span className="lp-material-icon lp-icon-sm">arrow_forward</span>
                  </a>
                </div>
              </div>

              {/* Buyers */}
              <div className="lp-card">
                <div className="lp-card-img-wrap">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWvwzcKm5AWI1rydmhqTBR7QRR9vsd_KavOsByDf9cAuh48HMI3kgGRQ5Bu2mT86wvgXIN1ZoaruOdXPsNiybZ_DVo7szru2dynJacQfGf-UIdAVMrImNbh9H9BqRyobnImSpsDYxVPS3X2dTbbRQcDCMhA5psDe9LtkEuePT8ggdrw7HrF2MWaYNYLZWl8SHRzoETIHYVWV9cGJP8iNaY6BDkmtNSC67hPGmssbwwhHmwCHPkhtstxl50K0Jd3aIe2b7fthKe6Vs"
                    alt="Buyer selecting produce"
                    className="lp-card-img"
                  />
                  <div className="lp-card-icon-badge">
                    <span className="lp-material-icon">shopping_cart</span>
                  </div>
                </div>
                <div className="lp-card-body">
                  <h3 className="lp-card-title">Buyers</h3>
                  <p className="lp-card-text">
                    Source high-quality, fresh produce directly from verified local farmers
                    with full transparency.
                  </p>
                  <a href="#" className="lp-card-link">
                    View inventory <span className="lp-material-icon lp-icon-sm">arrow_forward</span>
                  </a>
                </div>
              </div>

              {/* Transporters */}
              <div className="lp-card">
                <div className="lp-card-img-wrap">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA87lmVvqQeUG04ISjo-HWttao8nPUduxtI6nZAcZ7vCIyg3OBdVKtFupxAGC4VheDOmWkI8RK2Lp_WH8mVb06KWELhRnDSRzhn5C5V6ekgaQVCAtkeEjFPHqDWYdq5tOgzcdkWToP6WsgAaw765epD9q-ltElGUhNmplsZSbFwn52iuRur4dMHUgXInK9KyP-FFROoTbMewB4ZBptI2UuzqqKzzR93LVbh1v3TadQx-FeQ0mrBB9Re5uW6vZrE0BLwkzL4HlEl1O0"
                    alt="Transport truck on road"
                    className="lp-card-img"
                  />
                  <div className="lp-card-icon-badge">
                    <span className="lp-material-icon">local_shipping</span>
                  </div>
                </div>
                <div className="lp-card-body">
                  <h3 className="lp-card-title">Transporters</h3>
                  <p className="lp-card-text">
                    Find optimized routes, secure delivery contracts seamlessly, and grow
                    your logistics business.
                  </p>
                  <a href="#" className="lp-card-link">
                    Get contracts <span className="lp-material-icon lp-icon-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="cta" className="lp-cta-section">
          <div className="lp-container">
            <div className="lp-cta-box">
              <div className="lp-cta-copy">
                <h2 className="lp-cta-title">Ready to transform your agricultural business?</h2>
                <p className="lp-cta-body">
                  Join thousands of verified users already scaling their operations with
                  AgriGov Market's secure infrastructure.
                </p>
                <div className="lp-cta-btns">
                  <Link to="/register" className="lp-btn-cta-primary">Create Free Account</Link>
                  <a href="#" className="lp-btn-cta-secondary">Contact Sales</a>
                </div>
              </div>
              <div className="lp-cta-visual">
                <div className="lp-cta-glow" />
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIIKihPgWUS-WeaqystQEAP9f42vk2mQY_N8iDJf6ZAYDZ43d8SDujw7pAwg4dXPX206xisQs7fTXLOP0ySwqLTtDm-RB9leCrArqvUcSmMsoXiBmbPTPv0N6AgSnAKWPoRR6k51p0m6t7a8zTCWRoHcjxbUwHmVtAvzkesbEYAHG_azo71jAXWGITFgc60fTf7x6NtVqOphNLptCR5jIFJhIe6uGSOBu5qi6BgpYEUlU0jq8YKXG_uMW3slKKQDigSB3neCvKyos"
                  alt="AgriGov dashboard on tablet"
                  className="lp-cta-img"
                />
              </div>
              {/* decorative blobs */}
              <div className="lp-cta-blob lp-cta-blob--br" />
              <div className="lp-cta-blob lp-cta-blob--tr" />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner lp-container">
          <div className="lp-footer-brand-col">
            <span className="lp-footer-brand">AgriGov Market</span>
            <p className="lp-footer-tagline">
              Empowering farmers and buyers through a unified digital trade portal.
              Sustainable growth for a smarter agricultural future.
            </p>
            <div className="lp-footer-socials">
              <a href="#" className="lp-social-btn">
                <span className="lp-material-icon">public</span>
              </a>
              <a href="#" className="lp-social-btn">
                <span className="lp-material-icon">share</span>
              </a>
              <a href="#" className="lp-social-btn">
                <span className="lp-material-icon">mail</span>
              </a>
            </div>
          </div>

          <div className="lp-footer-links-grid">
            <div className="lp-footer-col">
              <h4 className="lp-footer-col-title">Company</h4>
              <a href="#">About</a>
              <a href="#">Solutions</a>
              <a href="#">Careers</a>
            </div>
            <div className="lp-footer-col">
              <h4 className="lp-footer-col-title">Support</h4>
              <a href="#">Contact</a>
              <a href="#">Help Center</a>
              <a href="#">Safety</a>
            </div>
            <div className="lp-footer-col">
              <h4 className="lp-footer-col-title">Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Compliance</a>
            </div>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <p>© 2024 AgriGov Market. Empowering Sustainable Agricultural Growth.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
