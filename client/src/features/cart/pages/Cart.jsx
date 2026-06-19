import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext.jsx';
import CartItem from '../components/CartItem.jsx';
import './Cart.css';

const Cart = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const isCartEmpty = cartItems.length === 0;

  // Mock billing values
  const shippingFee = cartTotal > 150 || isCartEmpty ? 0.0 : 10.0;
  const estimatedTax = cartTotal * 0.08;
  const grandTotal = cartTotal + shippingFee + estimatedTax;

  const handleCheckoutRedirect = () => {
    navigate("/checkout");
  };

  return (
    <div className="cart-page container section-padding animate-fade">
      <h1 className="cart-title">Your Shopping Cart</h1>

      {isCartEmpty ? (
        <div className="empty-cart-view glass-card">
          <div className="empty-cart-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>Your cart is currently empty</h2>
          <p>
            Explore our seasonal minimalist collections to find premium
            technological, lifestyle, or apparel essentials.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left panel: items list */}
          <div className="cart-items-list">
            <header className="cart-list-header">
              <span>Product Line</span>
              <span>Price Detail</span>
              <span>Quantity</span>
              <span>Subtotal</span>
            </header>

            <div className="cart-items-wrapper">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <button
              onClick={clearCart}
              className="btn btn-secondary clear-cart-btn"
            >
              Clear Shopping Cart
            </button>
          </div>

          {/* Right panel: order breakdown summary */}
          <aside className="cart-summary-block glass-card">
            <h3>Order Summary</h3>
            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping Fee</span>
                <span>
                  {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="summary-row">
                <span>Estimated Taxes (8%)</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="summary-row grand-total-row">
                <span>Total Amount</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {cartTotal > 150 && (
              <span className="promo-tag-success">
                🎉 Congratulations! Free standard shipping applied!
              </span>
            )}

            <button
              onClick={handleCheckoutRedirect}
              className="btn btn-primary checkout-trigger-btn"
            >
              Proceed to Checkout
            </button>

            <Link to="/shop" className="continue-shopping-link">
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
