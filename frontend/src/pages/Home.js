import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { productsApi } from '../services/api';
import { getFriendlyError } from '../utils/helpers';

const categoryIcons = {
  bamboo: 'Bamboo',
  handmade: 'Handmade',
  organic: 'Organic',
  recycled: 'Recycled',
  sustainable: 'Sustainable',
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadProducts = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const response = query
        ? await productsApi.search(query)
        : await productsApi.getAll();
      setProducts(response.data?.products || []);
    } catch (apiError) {
      setError(getFriendlyError(apiError, 'Unable to load products'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const categories = useMemo(() => {
    const dynamic = products.reduce((set, item) => {
      if (item?.category) set.add(item.category.toLowerCase());
      return set;
    }, new Set());
    return ['all', ...Array.from(dynamic)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((item) => item.category?.toLowerCase() === activeCategory);
  }, [products, activeCategory]);

  const handleSearchSubmit = (value) => {
    loadProducts(value.trim());
  };

  const topRatedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);
  }, [products]);

  return (
    <div className="home-page">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <section className="hero-section">
        <div className="market-live-badge">
          <span className="live-dot" />
          Marketplace Live • Updated {lastUpdated.toLocaleTimeString()}
        </div>
        <h1>Discover Eco-Friendly Products</h1>
        <p>Shop sustainable, handmade, and organic products that make a difference</p>
        <button className="browse-btn" onClick={() => setActiveCategory('all')}>
          Browse All Products <span style={{marginLeft: '8px'}}>→</span>
        </button>
      </section>

      <section className="container marketplace-strip">
        <article className="strip-card">
          <h3>{products.length}+</h3>
          <p>Curated eco products in stock now</p>
        </article>
        <article className="strip-card">
          <h3>24h</h3>
          <p>Fast dispatch for top-rated picks</p>
        </article>
        <article className="strip-card">
          <h3>98%</h3>
          <p>Happy shoppers buying sustainable</p>
        </article>
        <article className="strip-card">
          <h3>CO2 -42%</h3>
          <p>Average footprint reduction vs. regular products</p>
        </article>
      </section>

      <section className="container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-card ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <div className="category-icon">{categoryIcons[category] || 'Explore'}</div>
              <span>{category}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <button type="button" className="view-all-link" onClick={() => setActiveCategory('all')}>
            View All →
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <p className="empty-state">{error}</p>
        ) : filteredProducts.length ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No products available for this filter yet.</p>
        )}
      </section>

      <section className="impact-section">
        <h2>Every Purchase Makes a Difference</h2>
        <p>Support sustainable businesses and help protect our planet with every order</p>
        <Link className="start-shopping-btn" to="/signin">Start Shopping</Link>
      </section>

      {topRatedProducts.length ? (
        <section className="container social-proof-section">
          <div className="section-header">
            <h2 className="section-title">Shoppers Are Loving These</h2>
          </div>

          <div className="testimonial-grid">
            {topRatedProducts.map((item, index) => (
              <article className="testimonial-card" key={item._id}>
                <span className="testimonial-tag">Trending #{index + 1}</span>
                <h3>{item.name}</h3>
                <p>
                  "Beautiful quality and surprisingly premium feel. This one made my routine
                  more sustainable without compromise."
                </p>
                <div className="testimonial-footer">
                  <span>{Number(item.rating || 0).toFixed(1)} rating</span>
                  <Link to={`/product/${item._id}`}>View Product</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container cta-banner">
        <div>
          <h3>Join The EcoMarket Circle</h3>
          <p>Get curated drops, sustainability tips, and member-only launches every week.</p>
        </div>
        <Link to="/register" className="primary-btn">
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export default Home;