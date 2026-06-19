import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../shared/api/api.js';
import ProductCard from '../../products/components/ProductCard.jsx';
import LoadingSkeleton from '../../../shared/ui/LoadingSkeleton.jsx';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products?sortBy=popular"),
          api.get("/products/categories")
        ]);
        // Slice top 4 popular products
        setFeaturedProducts(prodRes.data.products.slice(0, 4));
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);



  return (
    <div className="home-page animate-fade">
      {/* Premium Hero Section */}
      <section className="hero-section">
        <div className="hero-container container">
          <div className="hero-content">
            <span className="hero-pretitle">The Aura of Design</span>
            <h1 className="hero-title">
              Curated Essentials <br />
              <span className="glowing-accent">For Modern Living</span>
            </h1>
            <p className="hero-subtitle">
              Meticulously selected products designed for tech purists, modern
              explorers, and high-fidelity lifestyles. Engineered with
              precision, crafted with soul.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Explore Collections
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/shop" className="btn btn-secondary btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid (Text Only) */}
      {categories.length > 0 && (
        <section className="categories-section container section-padding">
          <div className="section-header">
            <span className="section-pretitle">Browse our Categories</span>
            <h2 className="section-title">Shop by Curated Collections</h2>
          </div>
          <div className="grid-4 categories-text-grid">
            {categories.map((cat, index) => (
              <Link
                to={`/shop?category=${cat}`}
                className="category-text-card glass-card"
                key={index}
              >
                <h3>{cat}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers Slider */}
      <section className="bestsellers-section container section-padding">
        <div className="section-header">
          <span className="section-pretitle">Best Sellers</span>
          <h2 className="section-title">AURA Core Favorites</h2>
        </div>
        <div className="products-grid">
          {loading ? (
            <div className="grid-4">
              <LoadingSkeleton count={4} />
            </div>
          ) : (
            <div className="grid-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Value Grid */}
      <section className="brand-values-section container section-padding">
        <div className="grid-3 value-cards">
          <div className="value-card glass-card">
            <div className="value-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m12 8-4 4 4 4M16 12H8"></path>
              </svg>
            </div>
            <h3>Carbon-Offset Delivery</h3>
            <p>
              Every single transaction triggers carbon-offset actions. Your
              delivery leaves zero environmental footprints.
            </p>
          </div>

          <div className="value-card glass-card">
            <div className="value-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3>Premium Engineering</h3>
            <p>
              All collections are curated directly from original design
              manufacturers utilizing sustainable premium materials.
            </p>
          </div>

          <div className="value-card glass-card">
            <div className="value-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Secured Transactions</h3>
            <p>
              All order lines are fully encrypted end-to-end. We offer zero
              liability chargebacks on modern visual gateways.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
