import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container container section-padding">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span>AURA</span>
              <span className="dot">.</span>
            </Link>
            <p className="brand-pitch">
              A premium, high-curation digital shop tailored for minimalists and
              technological purists alike. We offer state-of-the-art products
              backed by carbon-offset shipping.
            </p>
          </div>

          {/* Nav Links Col */}
          <div className="footer-col Links-col">
            <h4>Collections</h4>
            <ul>
              <li>
                <Link to="/shop?category=Electronics">Electronics</Link>
              </li>
              <li>
                <Link to="/shop?category=Apparel">Apparel</Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories">Accessories</Link>
              </li>
              <li>
                <Link to="/shop?category=Home">Home & Living</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Col */}
          <div className="footer-col Links-col">
            <h4>Support</h4>
            <ul>
              <li>
                <Link to="/shop">Help Center</Link>
              </li>
              <li>
                <Link to="/shop">Track Orders</Link>
              </li>
              <li>
                <Link to="/shop">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/shop">Hassle-Free Returns</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="footer-col newsletter-col">
            <h4>Join the Newsletter</h4>
            <p>
              Subscribe for early collections notifications, sales access, and
              bespoke curations.
            </p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing!");
              }}
            >
              <input
                type="email"
                placeholder="email@address.com"
                required
                className="input-control"
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} AURA Digital Inc. All Rights
            Reserved. Co-crafted with premium engineering.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
