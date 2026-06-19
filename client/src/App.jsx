import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global context providers
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

// Common Components
import Navbar from "./layouts/CustomerLayout/Navbar.jsx";
import Footer from "./layouts/CustomerLayout/Footer.jsx";

// Page Views
import Home from "./features/home/pages/Home.jsx";
import Shop from "./features/shop/pages/Shop.jsx";
import ProductDetail from "./features/products/pages/ProductDetail.jsx";
import Cart from "./features/cart/pages/Cart.jsx";
import Checkout from "./features/checkout/pages/Checkout.jsx";
import Profile from "./features/users/pages/Profile.jsx";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

// Administrative Dashboard Nodes
import AdminRoute from "./app/router/AdminRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            {/* Global Header */}
            <Navbar />

            {/* Centralized dynamic route switcher viewport */}
            <div style={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Gatekeeper protecting management controls */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Fallback matched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            {/* Global Footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
