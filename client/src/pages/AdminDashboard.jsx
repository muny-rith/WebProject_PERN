import React, { useState, useEffect } from 'react';
import api from '../shared/api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
  // Stats states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Products states
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock: ''
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Orders states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Messages / Errors
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load analytical metrics.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Products Catalog
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data.products);
    } catch (err) {
      console.error('Failed to fetch product list:', err);
      setError('Failed to load product catalog.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch All Client Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders list:', err);
      setError('Failed to load orders history.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAddingProduct(true);
    
    // Basic validation
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.image_url || !newProduct.category || !newProduct.stock) {
      setError('All fields are required to create a product.');
      setAddingProduct(false);
      return;
    }

    try {
      await api.post('/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10)
      });
      setSuccess('Product successfully cataloged!');
      setNewProduct({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: '',
        stock: ''
      });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to create new product.');
    } finally {
      setAddingProduct(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action is irreversible.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/products/${productId}`);
      setSuccess('Product deleted successfully.');
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId, updates) => {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/orders/${orderId}/status`, updates);
      setSuccess(`Order status updated successfully.`);
      fetchOrders();
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="admin-dashboard container section-padding animate-fade">
      <header className="dashboard-header">
        <div className="header-meta">
          <span className="badge badge-admin">Administrator Console</span>
          <h1>AURA Management Dashboard</h1>
          <p>Welcome back, {user?.name}. Oversee product catalogs, track overall revenue performance, and manage client orders.</p>
        </div>
      </header>

      {/* Operation Status Messages */}
      {success && <div className="badge badge-paid status-toast">{success}</div>}
      {error && <div className="badge badge-cancelled status-toast">{error}</div>}

      {/* Tabs Switcher */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📈 Performance Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Catalog Inventory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Client Orders
        </button>
      </div>

      {/* Tab Panels */}
      <div className="tab-viewport">
        {/* STATS PANEL */}
        {activeTab === 'stats' && (
          <div className="stats-tab-panel">
            {loadingStats ? (
              <p className="loading-text">Analyzing database records...</p>
            ) : !stats ? (
              <p className="loading-text text-danger">Could not retrieve analytics metrics.</p>
            ) : (
              <div className="stats-layout">
                {/* Metrics Cards Grid */}
                <div className="grid-4 metrics-grid">
                  <div className="metric-card glass-card">
                    <span>Cumulative Revenue</span>
                    <h2>${parseFloat(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                  </div>
                  <div className="metric-card glass-card">
                    <span>Registered Customers</span>
                    <h2>{stats.totalUsers}</h2>
                  </div>
                  <div className="metric-card glass-card">
                    <span>Transactions Handled</span>
                    <h2>{stats.totalOrders}</h2>
                  </div>
                  <div className="metric-card glass-card warning-card">
                    <span>Low Stock Alerts</span>
                    <h2 className={stats.lowStockCount > 0 ? 'text-danger' : ''}>{stats.lowStockCount}</h2>
                  </div>
                </div>

                <div className="dashboard-grid-2">
                  {/* Category Distribution Chart/List */}
                  <div className="glass-card panel-card">
                    <h3>Category Breakdown</h3>
                    <div className="category-chart-list">
                      {stats.categoriesDistribution.length === 0 ? (
                        <p className="no-data">No product catalog exists.</p>
                      ) : (
                        stats.categoriesDistribution.map((cat, i) => (
                          <div key={i} className="chart-row">
                            <div className="chart-label">
                              <span>{cat.category}</span>
                              <strong>{cat.count} units</strong>
                            </div>
                            <div className="chart-bar-bg">
                              <div 
                                className="chart-bar-fill" 
                                style={{ width: `${Math.min(100, (cat.count / 10) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Timeline */}
                  <div className="glass-card panel-card">
                    <h3>Recent Transactions Timeline</h3>
                    <div className="recent-orders-list">
                      {stats.recentOrders.length === 0 ? (
                        <p className="no-data">No transaction history found.</p>
                      ) : (
                        stats.recentOrders.map((ord, i) => (
                          <div key={i} className="recent-order-item">
                            <div className="order-details-left">
                              <strong>#{ord.id} - {ord.user_name || 'Customer'}</strong>
                              <span>{new Date(ord.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="order-details-right">
                              <strong>${parseFloat(ord.total_amount).toFixed(2)}</strong>
                              <span className={`badge-pill badge-${ord.order_status.toLowerCase()}`}>{ord.order_status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS PANEL */}
        {activeTab === 'products' && (
          <div className="products-tab-panel">
            <div className="panel-header-actions">
              <h2>Inventory Catalog ({products.length} Products)</h2>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary"
              >
                {showAddForm ? 'Cancel Cataloging' : '➕ Catalog New Product'}
              </button>
            </div>

            {/* Catalog new product form */}
            {showAddForm && (
              <form onSubmit={handleAddProductSubmit} className="glass-card add-product-form animate-fade">
                <h3>Catalog New Product Line</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="prod-name">Product Name</label>
                    <input 
                      id="prod-name"
                      type="text" 
                      placeholder="e.g. Vortex Wireless Speakers"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      required
                      className="input-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-category">Category</label>
                    <select 
                      id="prod-category"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      required
                      className="input-control"
                    >
                      <option value="">-- Choose Category --</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-price">Price ($)</label>
                    <input 
                      id="prod-price"
                      type="number" 
                      step="0.01" 
                      placeholder="99.99"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      required
                      className="input-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-stock">Initial Stock</label>
                    <input 
                      id="prod-stock"
                      type="number" 
                      placeholder="20"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                      required
                      className="input-control"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="prod-img">Image URL</label>
                  <input 
                    id="prod-img"
                    type="url" 
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newProduct.image_url}
                    onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                    required
                    className="input-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prod-desc">Product Description</label>
                  <textarea 
                    id="prod-desc"
                    rows="3" 
                    placeholder="Provide a detailed architectural and functional profile of this product..."
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    required
                    className="input-control"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={addingProduct}
                  className="btn btn-primary"
                >
                  {addingProduct ? 'Adding to database...' : 'Submit to Catalog'}
                </button>
              </form>
            )}

            {loadingProducts ? (
              <p className="loading-text">Loading catalog items...</p>
            ) : products.length === 0 ? (
              <p className="no-data">No products found in database.</p>
            ) : (
              <div className="table-responsive-wrapper glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(prod => (
                      <tr key={prod.id}>
                        <td>
                          <img src={prod.image_url} alt={prod.name} className="table-thumbnail" />
                        </td>
                        <td>
                          <div className="table-cell-multi">
                            <strong>{prod.name}</strong>
                            <span className="small-text">ID: {prod.id}</span>
                          </div>
                        </td>
                        <td>{prod.category}</td>
                        <td>${parseFloat(prod.price).toFixed(2)}</td>
                        <td>
                          <span className={`badge-pill ${prod.stock < 5 ? 'badge-cancelled' : 'badge-paid'}`}>
                            {prod.stock} items left
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ORDERS PANEL */}
        {activeTab === 'orders' && (
          <div className="orders-tab-panel">
            <h2>Customer Orders Manager</h2>

            {loadingOrders ? (
              <p className="loading-text">Loading order databases...</p>
            ) : orders.length === 0 ? (
              <p className="no-data">No transactions have occurred on AURA yet.</p>
            ) : (
              <div className="table-responsive-wrapper glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Client Name</th>
                      <th>Date</th>
                      <th>Grand Total</th>
                      <th>Payment Status</th>
                      <th>Shipment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(ord => (
                      <tr key={ord.id}>
                        <td>
                          <strong style={{ color: 'hsl(var(--accent))' }}>#{ord.id}</strong>
                        </td>
                        <td>
                          <div className="table-cell-multi">
                            <strong>{ord.user_name || 'Guest User'}</strong>
                            <span className="small-text">{ord.user_email || 'No email'}</span>
                          </div>
                        </td>
                        <td>
                          {new Date(ord.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <strong>${parseFloat(ord.total_amount).toFixed(2)}</strong>
                        </td>
                        <td>
                          <select 
                            value={ord.payment_status}
                            onChange={e => handleUpdateOrderStatus(ord.id, { payment_status: e.target.value })}
                            className="table-select-badge"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>
                        <td>
                          <select 
                            value={ord.order_status}
                            onChange={e => handleUpdateOrderStatus(ord.id, { order_status: e.target.value })}
                            className={`table-select-badge badge-${ord.order_status.toLowerCase()}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
