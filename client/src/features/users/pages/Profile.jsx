import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../shared/api/api.js';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Sync profile details if AuthContext updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Fetch orders on load
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await api.get("/orders/my-orders");
        setOrders(response.data.orders);
      } catch (err) {
        console.error("Failed to load user order records:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess(false);
    setFormError("");
    setUpdating(true);

    try {
      await updateProfile(name, email);
      setFormSuccess(true);
    } catch (err) {
      setFormError(err.message || "Failed to update profile settings.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status.toLowerCase()}`;
  };

  return (
    <div className="profile-page container section-padding animate-fade">
      <header className="profile-page-header">
        <h1>Your Account Space</h1>
        <p>
          Manage your details, profile configurations, and review complete
          shipping order progress.
        </p>
      </header>

      <div className="profile-layout">
        {/* Left Side: Profile Editing Form */}
        <aside className="profile-settings-sidebar glass-card">
          <h3>Profile Configurations</h3>

          <form onSubmit={handleProfileSubmit} className="profile-form">
            {formSuccess && (
              <div className="badge badge-paid form-status-badge">
                Profile updated successfully.
              </div>
            )}
            {formError && (
              <div className="badge badge-cancelled form-status-badge">
                {formError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name-input">Full Name</label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email-input">Email Address</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-control"
              />
            </div>

            <div className="form-group">
              <label>Account Role</label>
              <input
                type="text"
                value={user?.role || "customer"}
                disabled
                className="input-control profile-role-input"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="btn btn-primary profile-save-btn"
            >
              {updating ? "Saving..." : "Update Settings"}
            </button>
          </form>
        </aside>

        {/* Right Side: Orders History */}
        <main className="profile-orders-main">
          <h2>Order History & Timeline</h2>

          {loadingOrders ? (
            <p style={{ color: "hsl(var(--text-muted))", padding: "24px 0" }}>
              Loading your order records...
            </p>
          ) : orders.length === 0 ? (
            <div className="no-orders-prompt glass-card">
              <p>You haven't placed any order lines on our platform yet.</p>
            </div>
          ) : (
            <div className="orders-timeline-wrapper">
              {orders.map((order) => (
                <div key={order.id} className="order-history-card glass-card">
                  {/* Summary Bar */}
                  <header className="order-card-header">
                    <div className="header-meta-box">
                      <span>Order Placed</span>
                      <strong>
                        {new Date(order.created_at).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </strong>
                    </div>

                    <div className="header-meta-box">
                      <span>Invoice Index</span>
                      <strong style={{ color: "hsl(var(--accent))" }}>
                        #{order.id}
                      </strong>
                    </div>

                    <div className="header-meta-box">
                      <span>Total Amount</span>
                      <strong>
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </strong>
                    </div>

                    <div className="header-meta-box flex-end">
                      <span className={getStatusBadgeClass(order.order_status)}>
                        {order.order_status}
                      </span>
                    </div>
                  </header>

                  {/* Items List Inside Order */}
                  <div className="order-items-wrapper-inner">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-inner-line">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="order-item-img-small"
                        />
                        <div className="order-item-desc">
                          <h4>{item.product_name}</h4>
                          <span>
                            Unit Price: ${parseFloat(item.price).toFixed(2)}{" "}
                            &bull; Quantity: {item.quantity}
                          </span>
                        </div>
                        <div className="order-item-subtotal-column">
                          <strong>
                            ${(item.price * item.quantity).toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address Row */}
                  <footer className="order-card-footer">
                    <span>Delivering To:</span>
                    <address>{order.shipping_address}</address>
                  </footer>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
