import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../shared/api/api.js';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to login page!
  useEffect(() => {
    if (!user) {
      alert("You must be authenticated to check out.");
      navigate("/login?redirect=checkout");
    }
  }, [user, navigate]);

  // Billing states
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    zip: "",
    country: "",
  });

  // Card simulator states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Execution states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState(null);
  const [formError, setFormError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Mock billing values
  const shippingFee = cartTotal > 150 ? 0.0 : 10.0;
  const estimatedTax = cartTotal * 0.08;
  const grandTotal = cartTotal + shippingFee + estimatedTax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    // Basic Input Validations
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.zip ||
      !shippingAddress.country
    ) {
      setFormError("Please complete all shipping address fields.");
      setIsSubmitting(false);
      return;
    }

    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setFormError("Please complete all credit card fields.");
      setIsSubmitting(false);
      return;
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      setFormError("Please enter a valid 16-digit credit card number.");
      setIsSubmitting(false);
      return;
    }

    try {
      const compiledAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zip}, ${shippingAddress.country}`;
      const compiledItems = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const payload = {
        totalAmount: grandTotal,
        shippingAddress: compiledAddress,
        items: compiledItems,
      };

      // Create order API transaction call
      const response = await api.post("/orders", payload);

      // Save order details to local success state
      setOrderSuccessDetails(response.data.order);

      // Clear shopping cart
      clearCart();
    } catch (err) {
      setFormError(
        err.message || "Failed to process transaction. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccessDetails) {
    return (
      <div className="checkout-page container section-padding animate-fade">
        <div className="checkout-success-view glass-card">
          <div className="success-checkmark-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1>Transaction Approved!</h1>
          <p className="success-pitch">
            Thank you, {user?.name}. Your order has been registered under
            invoice index reference:{" "}
            <strong style={{ color: "hsl(var(--accent))" }}>
              #{orderSuccessDetails.id}
            </strong>
            .
          </p>
          <p className="shipping-notice">
            A confirmation invoice has been queued to your email address. You
            can view progress of shipment within your user profile dashboard.
          </p>
          <div className="success-actions">
            <Link to="/profile" className="btn btn-primary">
              Track Order
            </Link>
            <Link to="/" className="btn btn-secondary">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container section-padding animate-fade">
      <h1 className="checkout-title">Secured Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: "48px" }}>
          <h2>No items in cart to checkout.</h2>
          <Link
            to="/shop"
            className="btn btn-primary"
            style={{ marginTop: "24px" }}
          >
            Back to Shop
          </Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="checkout-layout">
          {/* Left panel: address & simulated credit card forms */}
          <div className="checkout-forms">
            {formError && (
              <div className="badge badge-cancelled form-validation-error">
                {formError}
              </div>
            )}

            {/* Shipping details */}
            <div className="checkout-card glass-card">
              <h3>Shipping Information</h3>
              <div className="form-group">
                <label htmlFor="street-input">Street Address</label>
                <input
                  id="street-input"
                  type="text"
                  name="street"
                  placeholder="123 Luxury Avenue"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  required
                  className="input-control"
                />
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label htmlFor="city-input">City</label>
                  <input
                    id="city-input"
                    type="text"
                    name="city"
                    placeholder="New York"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    required
                    className="input-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zip-input">Postal Zip Code</label>
                  <input
                    id="zip-input"
                    type="text"
                    name="zip"
                    placeholder="10001"
                    value={shippingAddress.zip}
                    onChange={handleInputChange}
                    required
                    className="input-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country-input">Country</label>
                  <input
                    id="country-input"
                    type="text"
                    name="country"
                    placeholder="United States"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    required
                    className="input-control"
                  />
                </div>
              </div>
            </div>

            {/* Simulated Payment details */}
            <div className="checkout-card glass-card">
              <h3>Secured Visual Payment</h3>
              <p className="secured-note-para">
                🛡️ Simulated Stripe Sandbox Environment. You can enter any
                credit card combinations for testing.
              </p>

              <div className="form-group">
                <label htmlFor="card-name-input">Cardholder Name</label>
                <input
                  id="card-name-input"
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="input-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="card-number-input">Credit Card Number</label>
                <input
                  id="card-number-input"
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength="19"
                  required
                  className="input-control"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="card-expiry-input">Expiration MM/YY</label>
                  <input
                    id="card-expiry-input"
                    type="text"
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength="5"
                    required
                    className="input-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="card-cvv-input">Security CVV</label>
                  <input
                    id="card-cvv-input"
                    type="password"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength="4"
                    required
                    className="input-control"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: order final summaries */}
          <aside className="checkout-summary-block glass-card">
            <h3>Checkout Summary</h3>

            <div className="checkout-items-list-short">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-short">
                  <span>
                    {item.name} <strong>x {item.quantity}</strong>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-breakdown checkout-totals-list">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary place-order-submit-btn"
            >
              {isSubmitting
                ? "Approving Transaction..."
                : `Place Secured Order ($${grandTotal.toFixed(2)})`}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
};

export default Checkout;
