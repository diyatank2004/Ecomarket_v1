import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getProductId, truncateText } from '../utils/helpers';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const productId = getProductId(product);
  const wished = isInWishlist(productId);

  const handleWishlist = async () => {
    if (!isAuthenticated || !productId) return;
    if (wished) {
      await removeFromWishlist(productId);
      return;
    }
    await addToWishlist(productId);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !productId) return;
    await addToCart(productId);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/product/${productId}`}>
          <img src={product.image} alt={product.name} className="product-image" />
        </Link>
        <button
          type="button"
          className={`wishlist-btn ${wished ? 'active' : ''}`}
          onClick={handleWishlist}
          disabled={!isAuthenticated}
          aria-label="Toggle wishlist"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>
      
      <div className="product-info">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-rating">
            {Number(product.rating || 0).toFixed(1)}
          </span>
        </div>
        
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{truncateText(product.description)}</p>
        
        <div className="product-footer">
          <span className="product-price">{formatCurrency(product.price)}</span>
          <button
            type="button"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!isAuthenticated}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;