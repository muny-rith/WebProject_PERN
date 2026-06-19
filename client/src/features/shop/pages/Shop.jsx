import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../shared/api/api.js';
import ProductList from '../../products/components/ProductList.jsx';
import LoadingSkeleton from '../../../shared/ui/LoadingSkeleton.jsx';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortBy, setSortBy] = useState("newest");
  const [categories, setCategories] = useState([]);

  // Fetch unique categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories");
        setCategories(response.data.categories);
      } catch (err) {
        console.error("Failed to load categories list:", err);
      }
    };
    fetchCategories();
  }, []);

  // Synchronize category state when search URL query parameters change
  useEffect(() => {
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

  // Fetch filtered and sorted products on parameter changes
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice > 0) params.minPrice = minPrice;
        if (maxPrice < 250) params.maxPrice = maxPrice;
        if (sortBy) params.sortBy = sortBy;

        const response = await api.get("/products", { params });
        setProducts(response.data.products);
      } catch (err) {
        console.error("Failed to load catalog products:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce product fetches slightly for inputs to prevent heavy rapid querying
    const delayDebounceFn = setTimeout(() => {
      fetchFilteredProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, minPrice, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice(0);
    setMaxPrice(250);
    setSortBy("newest");
    setSearchParams({});
  };

  const handleCategorySelect = (cat) => {
    const newCat = category === cat ? "" : cat; // toggle
    setCategory(newCat);
    if (newCat) {
      setSearchParams({ category: newCat });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="shop-page container section-padding animate-fade">
      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar glass-card">
          <div className="sidebar-section">
            <h3>Search Catalog</h3>
            <div className="search-box-wrapper">
              <input
                type="text"
                placeholder="Type keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-control"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="category-list">
              <button
                className={`category-filter-btn ${category === "" ? "active" : ""}`}
                onClick={() => handleCategorySelect("")}
              >
                All Products
              </button>
              {categories.map((cat, index) => (
                <button
                  key={index}
                  className={`category-filter-btn ${category === cat ? "active" : ""}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Price Threshold</h3>
            <div className="price-slider-group">
              <div className="price-range-readout">
                <span>Min: ${minPrice}</span>
                <span>
                  Max: ${maxPrice === 250 ? "No Max" : `$${maxPrice}`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="price-range-slider"
              />
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="btn btn-secondary reset-filters-btn"
          >
            Reset Filters
          </button>
        </aside>

        {/* Catalog Main Block */}
        <main className="shop-main">
          {/* Header detailing count and sort selection */}
          <header className="shop-main-header">
            <div className="catalog-count-info">
              <h2>Browse Catalog</h2>
              <p>{products.length} Products Found</p>
            </div>

            <div className="sort-box-wrapper">
              <label htmlFor="sort-dropdown">Sort By</label>
              <select
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-control sort-dropdown-select"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Customer Ratings</option>
              </select>
            </div>
          </header>

          {/* Product Cards Grid with Loading states */}
          {loading ? (
            <div className="grid-3">
              <LoadingSkeleton count={6} />
            </div>
          ) : (
            <ProductList products={products} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
