import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { productsApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getFriendlyError } from '../utils/helpers';

const ProductDetails = () => {
	const { id } = useParams();
	const { isAuthenticated } = useAuth();
	const { addToCart } = useCart();
	const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const loadProduct = async () => {
			setLoading(true);
			setError('');
			try {
				const { data } = await productsApi.getById(id);
				setProduct(data?.product || null);
			} catch (apiError) {
				setError(getFriendlyError(apiError, 'Unable to fetch product details'));
			} finally {
				setLoading(false);
			}
		};

		loadProduct();
	}, [id]);

	const handleWishlist = async () => {
		if (!product?._id || !isAuthenticated) return;

		if (isInWishlist(product._id)) {
			await removeFromWishlist(product._id);
			return;
		}

		await addToWishlist(product._id);
	};

	const handleAddToCart = async () => {
		if (!product?._id || !isAuthenticated) return;
		await addToCart(product._id);
	};

	return (
		<div className="home-page">
			<Navbar />

			<main className="container product-details">
				{loading ? <Loader /> : null}
				{!loading && error ? <p className="empty-state">{error}</p> : null}
				{!loading && !error && !product ? <p className="empty-state">Product not found.</p> : null}

				{!loading && product ? (
					<div className="details-grid">
						<div className="details-media">
							<img src={product.image} alt={product.name} className="details-image" />
						</div>

						<div className="details-content">
							<span className="product-category">{product.category}</span>
							<h1>{product.name}</h1>
							<p className="details-description">{product.description}</p>

							<div className="details-inline">
								<span className="product-price">{formatCurrency(product.price)}</span>
								<span className="stock-pill">Stock: {product.stock}</span>
							</div>

							<div className="details-actions">
								<button
									type="button"
									className="add-to-cart-btn big"
									onClick={handleAddToCart}
									disabled={!isAuthenticated}
								>
									Add to Cart
								</button>

								<button
									type="button"
									className={`wishlist-btn details ${isInWishlist(product._id) ? 'active' : ''}`}
									onClick={handleWishlist}
									disabled={!isAuthenticated}
								>
									{isInWishlist(product._id) ? 'Wishlisted' : 'Add to Wishlist'}
								</button>
							</div>

							{!isAuthenticated ? (
								<p className="details-note">
									Please <Link to="/signin">sign in</Link> to add items to cart or wishlist.
								</p>
							) : null}
						</div>
					</div>
				) : null}
			</main>
		</div>
	);
};

export default ProductDetails;
