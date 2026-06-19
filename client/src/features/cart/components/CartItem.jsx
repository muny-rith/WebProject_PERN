import React from "react";
import { useCart } from "../../../context/CartContext.jsx";
import "./CartItem.css";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item glass-card">
      {/* Product Image */}
      <img src={item.image_url} alt={item.name} className="cart-item-img" />

      {/* Product Details info */}
      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.name}</h4>
        <span className="cart-item-category">{item.category}</span>
        <span className="cart-item-price">
          ${parseFloat(item.price).toFixed(2)}
        </span>
      </div>

      {/* Quantity Adjusters */}
      <div className="cart-item-actions">
        <div className="qty-picker">
          <button
            onClick={() =>
              updateQuantity(item.id, item.quantity - 1, item.stock)
            }
            className="qty-btn"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(
                item.id,
                parseInt(e.target.value, 10) || 1,
                item.stock,
              )
            }
            min="1"
            max={item.stock}
            className="qty-input"
          />
          <button
            onClick={() =>
              updateQuantity(item.id, item.quantity + 1, item.stock)
            }
            className="qty-btn"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Remove Line-item Action */}
        <button
          onClick={() => removeFromCart(item.id)}
          className="cart-remove-btn"
          title="Remove item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>

      {/* Subtotal currency line */}
      <div className="cart-item-subtotal">
        <span>Subtotal</span>
        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default CartItem;
