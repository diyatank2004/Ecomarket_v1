import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import '../App.css';

const Navbar = ({ searchQuery = '', onSearchChange, onSearchSubmit }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" aria-label="EcoMarket home">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
          </div>
          <span className="logo-text">EcoMarket</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search eco-friendly products..."
            value={searchQuery}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search products">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>

        <div className="nav-actions">
          <Link to="/" className="nav-link">Products</Link>

          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span className="count-badge">{wishlistItems.length}</span>
          </Link>

          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span className="count-badge">{cartCount}</span>
          </Link>

          <Link to="/orders" className="nav-link">Orders</Link>

          {user?.role === 'admin' ? (
            <Link to="/admin" className="nav-link nav-admin-link">Admin</Link>
          ) : null}

          <div className="user-profile" title={isAuthenticated ? user?.email : 'Guest'}>
            <span>{isAuthenticated ? user?.name : 'Guest'}</span>
          </div>

          {isAuthenticated ? (
            <button type="button" className="primary-ghost-btn" onClick={handleLogout}>
              Sign out
            </button>
          ) : (
            <Link to="/signin" className="primary-ghost-btn">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;