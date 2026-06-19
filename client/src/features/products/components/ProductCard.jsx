import React from "react";
import { Link } from "react-router-dom";
import Rating from "../../../shared/ui/Rating.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop navigation click
    addToCart(product, 1);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card glass-card">
      {/* Category Tag Overlay */}
      <span className="card-category-tag">{product.category}</span>

      {/* Product Image */}
      <div className="card-image-wrapper">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {isOutOfStock && <div className="out-of-stock-overlay">Sold Out</div>}
      </div>

      {/* Card Content details */}
      <div className="card-content">
        <h3 className="card-title">{product.name}</h3>

        {/* Ratings block */}
        <div className="card-rating">
          <Rating rating={product.rating_avg} />
          <span className="card-rating-count">({product.rating_count})</span>
        </div>

        {/* Footer detailing pricing & CTA */}
        <div className="card-footer">
          <span className="card-price">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className="btn btn-primary card-cta-btn"
            disabled={isOutOfStock}
            title={isOutOfStock ? "Sold Out" : "Add to Cart"}
          >
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
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
