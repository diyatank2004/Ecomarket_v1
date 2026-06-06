import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { productsApi } from '../services/api';
import { formatCurrency, getFriendlyError } from '../utils/helpers';

const emptyProductForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  stock: '',
  rating: '',
};

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await productsApi.getAll();
      setProducts(data?.products || []);
    } catch (apiError) {
      setError(getFriendlyError(apiError, 'Unable to load products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadProducts();
    }
  }, [isAuthenticated, user?.role]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalInventory = products.reduce((sum, item) => sum + Number(item.stock || 0), 0);
    const avgRating = totalProducts
      ? (products.reduce((sum, item) => sum + Number(item.rating || 0), 0) / totalProducts).toFixed(1)
      : '0.0';
    const categories = new Set(products.map((item) => item.category?.toLowerCase()).filter(Boolean)).size;
    const lowStock = products.filter((item) => Number(item.stock || 0) <= 10).length;

    return [
      { label: 'Products', value: totalProducts },
      { label: 'Inventory', value: totalInventory },
      { label: 'Avg Rating', value: avgRating },
      { label: 'Categories', value: categories },
      { label: 'Low Stock', value: lowStock },
    ];
  }, [products]);

  const categoryBreakdown = useMemo(() => {
    const byCategory = products.reduce((accumulator, item) => {
      const key = item.category || 'Uncategorized';
      if (!accumulator[key]) {
        accumulator[key] = { count: 0, stock: 0 };
      }
      accumulator[key].count += 1;
      accumulator[key].stock += Number(item.stock || 0);
      return accumulator;
    }, {});

    return Object.entries(byCategory)
      .map(([label, data]) => ({ label, ...data }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return [...products]
      .filter((item) => Number(item.stock || 0) <= 10)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 5);
  }, [products]);

  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((item) => {
      return [item.name, item.category, item.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalized));
    });
  }, [products, query]);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="home-page">
        <Navbar />
        <main className="container">
          <p className="empty-state">You do not have permission to view this dashboard.</p>
        </main>
      </div>
    );
  }

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyProductForm);
    setEditingId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      rating: form.rating === '' ? 0 : Number(form.rating),
    };

    try {
      if (editingId) {
        await productsApi.update(editingId, payload);
        setMessage('Product updated successfully.');
      } else {
        await productsApi.create(payload);
        setMessage('Product created successfully.');
      }

      resetForm();
      await loadProducts();
    } catch (apiError) {
      setError(getFriendlyError(apiError, 'Unable to save product'));
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || '',
      image: product.image || '',
      stock: product.stock ?? '',
      rating: product.rating ?? '',
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id) => {
    setMessage('');
    setError('');
    try {
      await productsApi.remove(id);
      setMessage('Product removed.');
      await loadProducts();
    } catch (apiError) {
      setError(getFriendlyError(apiError, 'Unable to delete product'));
    }
  };

  const jumpToForm = () => {
    setActiveSection('editor');
    document.getElementById('admin-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const jumpToCatalog = () => {
    setActiveSection('catalog');
    document.getElementById('admin-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const jumpToOverview = () => {
    setActiveSection('overview');
    document.getElementById('admin-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="home-page">
      <Navbar />
      <main className="container admin-shell">
        <section className="admin-hero">
          <div>
            <p className="admin-eyebrow">Admin Dashboard</p>
            <h1>Manage your EcoMarket catalog in one place.</h1>
            <p>
              Create products, update live inventory, and keep the storefront fresh with a polished admin workspace.
            </p>
          </div>
          <div className="admin-hero-card">
            <span>Welcome back</span>
            <strong>{user?.name}</strong>
            <small>Role: {user?.role}</small>
          </div>
        </section>

        <section className="admin-workspace">
          <aside className={`admin-sidebar card-panel ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="admin-sidebar-top">
              <div>
                <p className="admin-sidebar-label">Workspace</p>
                {!sidebarCollapsed ? <h3>Control Center</h3> : null}
              </div>
              <button
                type="button"
                className="sidebar-collapse-btn"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label="Toggle sidebar"
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
            </div>

            <div className="admin-sidebar-card">
              <p className="admin-sidebar-label">Workspace</p>
              <button
                type="button"
                className={`sidebar-action ${activeSection === 'editor' ? 'active' : ''}`}
                onClick={jumpToForm}
              >
                <span className="sidebar-icon">+</span>
                {!sidebarCollapsed ? <span>Add product</span> : null}
              </button>
              <button
                type="button"
                className={`sidebar-action ${activeSection === 'catalog' ? 'active' : ''}`}
                onClick={jumpToCatalog}
              >
                <span className="sidebar-icon">◫</span>
                {!sidebarCollapsed ? <span>Review catalog</span> : null}
              </button>
              <button
                type="button"
                className="sidebar-action"
                onClick={loadProducts}
              >
                <span className="sidebar-icon">↻</span>
                {!sidebarCollapsed ? <span>Refresh data</span> : null}
              </button>
              <button
                type="button"
                className={`sidebar-action ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={jumpToOverview}
              >
                <span className="sidebar-icon">●</span>
                {!sidebarCollapsed ? <span>Overview</span> : null}
              </button>
            </div>

            <div className="admin-sidebar-card">
              <p className="admin-sidebar-label">Quick Stats</p>
              <div className="admin-mini-stats">
                {stats.slice(0, 4).map((stat) => (
                  <div key={stat.label} className="mini-stat">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-sidebar-card">
              <p className="admin-sidebar-label">Low Stock Alerts</p>
              {lowStockProducts.length ? (
                <div className="sidebar-list">
                  {lowStockProducts.map((product) => (
                    <div className="sidebar-list-item" key={product._id}>
                      <span>{product.name}</span>
                      <strong>{product.stock}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sidebar-empty">No urgent restocks.</p>
              )}
            </div>

            <div className="admin-sidebar-card">
              <p className="admin-sidebar-label">Recent Adds</p>
              {recentProducts.length ? (
                <div className="sidebar-list compact">
                  {recentProducts.map((product) => (
                    <div className="sidebar-list-item" key={product._id}>
                      <span>{product.name}</span>
                      <small>{product.category}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sidebar-empty">No recent products yet.</p>
              )}
            </div>
          </aside>

          <section className="admin-main">
            <section id="admin-overview" className="admin-stats">
              {stats.map((stat) => (
                <article key={stat.label} className="admin-stat-card">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </section>

            <section className="admin-insights">
              <article className="card-panel admin-chart-panel">
                <div className="section-header">
                  <h2 className="section-title">Category Mix</h2>
                </div>
                {categoryBreakdown.length ? (
                  <div className="admin-bar-chart">
                    {categoryBreakdown.map((item) => (
                      <div className="admin-bar-row" key={item.label}>
                        <div className="admin-bar-head">
                          <span>{item.label}</span>
                          <small>{item.count} items</small>
                        </div>
                        <div className="admin-bar-track">
                          <div
                            className="admin-bar-fill"
                            style={{ width: `${Math.max(12, Math.min(100, item.stock))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sidebar-empty">No category data yet.</p>
                )}
              </article>

              <article className="card-panel admin-chart-panel">
                <div className="section-header">
                  <h2 className="section-title">Live Operations</h2>
                </div>
                <div className="admin-ops-grid">
                  <button type="button" className="admin-ops-card" onClick={jumpToForm}>
                    <span>New listing</span>
                    <strong>Create</strong>
                  </button>
                  <button type="button" className="admin-ops-card" onClick={jumpToCatalog}>
                    <span>Current stock</span>
                    <strong>Review</strong>
                  </button>
                  <button type="button" className="admin-ops-card" onClick={loadProducts}>
                    <span>System sync</span>
                    <strong>Refresh</strong>
                  </button>
                </div>
              </article>
            </section>

            <section className="admin-grid">
              <form id="admin-product-form" className="admin-form card-panel" onSubmit={handleSubmit}>
            <div className="section-header">
              <h2 className="section-title">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              {editingId ? (
                <button type="button" className="text-btn" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>

            <div className="admin-fields">
              <label>
                Product Name
                <input name="name" value={form.name} onChange={handleChange} placeholder="Reusable Bamboo Bottle" required />
              </label>
              <label>
                Category
                <input name="category" value={form.category} onChange={handleChange} placeholder="Sustainable" required />
              </label>
              <label className="span-2">
                Description
                <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Short product story..." required />
              </label>
              <label>
                Price
                <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="29.99" required />
              </label>
              <label>
                Stock
                <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="24" required />
              </label>
              <label>
                Rating
                <input name="rating" type="number" step="0.1" value={form.rating} onChange={handleChange} placeholder="4.8" />
              </label>
              <label className="span-2">
                Image URL
                <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
              </label>
            </div>

            {message ? <p className="form-message">{message}</p> : null}
            {error ? <p className="form-message error">{error}</p> : null}

            <button type="submit" className="primary-btn admin-submit-btn">
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
              </form>

              <aside id="admin-catalog" className="card-panel admin-panel-right">
                <div className="section-header">
                  <h2 className="section-title">Catalog</h2>
                  <input
                    type="text"
                    className="admin-search"
                    placeholder="Filter products..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>

                {loading ? (
                  <Loader />
                ) : filteredProducts.length ? (
                  <div className="admin-product-list">
                    {filteredProducts.map((product) => (
                      <article className="admin-product-row" key={product._id}>
                        <img src={product.image} alt={product.name} />
                        <div className="admin-product-copy">
                          <h3>{product.name}</h3>
                          <p>{product.category}</p>
                          <small>{formatCurrency(product.price)} • Stock {product.stock}</small>
                        </div>
                        <div className="admin-row-actions">
                          <button type="button" className="text-btn" onClick={() => handleEdit(product)}>
                            Edit
                          </button>
                          <button type="button" className="text-btn danger" onClick={() => handleDelete(product._id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No products found.</p>
                )}
              </aside>
            </section>
          </section>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
