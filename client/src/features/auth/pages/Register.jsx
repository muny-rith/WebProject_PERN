import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import "./Auth.css";

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // option to sign up as customer or admin for easy demo

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, role);
    } catch (err) {
      setError(err.message || "Registration failed. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container section-padding animate-fade">
      <div className="auth-card glass-card">
        <header className="auth-header">
          <h2>Create Account</h2>
          <p>Register to unlock our complete premium design catalogs.</p>
        </header>

        {error && (
          <div className="badge badge-cancelled auth-status-badge">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="•••••••• (Min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Sign Up As (Demo Helper)</label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-control"
            >
              <option value="customer">
                Customer (Buy and Review Products)
              </option>
              <option value="admin">
                Admin (Manage and Edit Inventory & Orders)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary auth-submit-btn"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <footer className="auth-footer">
          <span>Already registered?</span>
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>
            Sign In Here
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default Register;
