import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../shared/api/api.js';
import Rating from '../../../shared/ui/Rating.jsx';
import { useCart } from '../../../context/CartContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Review Forms State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cart Qty State
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      setReviews(response.data.reviews);
    } catch (err) {
      setError(err.message || "Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleQtyChange = (val) => {
    if (val < 1) return;
    if (val > product.stock) {
      alert(`Only ${product.stock} items are available in stock.`);
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} unit(s) of "${product.name}" added to your cart.`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess(false);
    setSubmittingReview(true);

    if (!comment.trim()) {
      setReviewError("Please write your review comments.");
      setSubmittingReview(false);
      return;
    }

    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      setReviewSuccess(true);
      setComment("");
      setRating(5);
      // Re-fetch product details to show new review and update average scores!
      await fetchProductDetails();
    } catch (err) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container section-padding text-center">
        <p style={{ color: "hsl(var(--text-muted))", fontSize: "1.2rem" }}>
          Loading product details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container section-padding text-center">
        <h2 style={{ color: "hsl(var(--danger))", marginBottom: "16px" }}>
          Error
        </h2>
        <p style={{ color: "hsl(var(--text-muted))", marginBottom: "24px" }}>
          {error || "Product not found."}
        </p>
        <Link to="/shop" className="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-detail-page container section-padding animate-fade">
      {/* Back to Shop Navigation link */}
      <Link to="/shop" className="back-link">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Catalog
      </Link>

      {/* Main Detail block */}
      <div className="product-detail-grid">
        {/* Left Col: image panel */}
        <div className="product-detail-img-wrapper glass-card">
          <img src={product.image_url} alt={product.name} />
          {isOutOfStock && (
            <span className="detail-stock-overlay">Out of Stock</span>
          )}
        </div>

        {/* Right Col: details dashboard */}
        <div className="product-detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-rating">
            <Rating rating={product.rating_avg} />
            <span className="detail-rating-count">
              ({product.rating_count} Customer Reviews)
            </span>
          </div>

          <span className="detail-price">
            ${parseFloat(product.price).toFixed(2)}
          </span>

          <p className="detail-description">{product.description}</p>

          <div className="detail-meta">
            <span
              className={`meta-stock ${isOutOfStock ? "no-stock" : "in-stock"}`}
            >
              Availability:{" "}
              {isOutOfStock ? "Out of Stock" : `${product.stock} Units left`}
            </span>
          </div>

          {!isOutOfStock && (
            <div className="detail-actions">
              <div className="qty-picker detail-qty">
                <button
                  onClick={() => handleQtyChange(quantity - 1)}
                  className="qty-btn"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    handleQtyChange(parseInt(e.target.value, 10) || 1)
                  }
                  className="qty-input"
                />
                <button
                  onClick={() => handleQtyChange(quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary detail-cart-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews & Social Proof section */}
      <section className="product-reviews-section">
        <div className="reviews-layout-grid">
          {/* Reviews List */}
          <div className="reviews-list-block">
            <h3 className="section-subtitle">Reviews ({reviews.length})</h3>
            {!reviews.length ? (
              <p style={{ color: "hsl(var(--text-muted))", padding: "16px 0" }}>
                There are no reviews for this product yet. Be the first to share
                your thoughts!
              </p>
            ) : (
              <div className="reviews-timeline">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card glass-card">
                    <div className="review-author-meta">
                      <strong>{rev.user_name || "Anonymous User"}</strong>
                      <span className="review-date">
                        {new Date(rev.created_at).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                      </span>
                    </div>
                    <Rating rating={rev.rating} />
                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave a Review panel */}
          <div className="reviews-form-block glass-card">
            <h3 className="section-subtitle">Write a Review</h3>
            {user ? (
              <form
                onSubmit={handleReviewSubmit}
                className="review-submit-form"
              >
                {reviewSuccess && (
                  <div
                    className="badge badge-paid"
                    style={{
                      display: "block",
                      padding: "12px",
                      marginBottom: "16px",
                      textAlign: "center",
                    }}
                  >
                    Review submitted successfully. Thank you for your feedback!
                  </div>
                )}
                {reviewError && (
                  <div
                    className="badge badge-cancelled"
                    style={{
                      display: "block",
                      padding: "12px",
                      marginBottom: "16px",
                      textAlign: "center",
                    }}
                  >
                    {reviewError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="rating-select">Rating Score</label>
                  <select
                    id="rating-select"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value, 10))}
                    className="input-control"
                  >
                    <option value="5">5 Stars - Outstanding</option>
                    <option value="4">4 Stars - Excellent</option>
                    <option value="3">3 Stars - Good</option>
                    <option value="2">2 Stars - Fair</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="comment-textarea">Your Review Comments</label>
                  <textarea
                    id="comment-textarea"
                    rows="4"
                    placeholder="Describe your user experience with this collection..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-control"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary submit-review-btn"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="review-signin-prompt">
                <p>
                  You must be authenticated to write reviews on product lines.
                </p>
                <Link to="/login" className="btn btn-secondary">
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
