import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, getProductId } from '../utils/helpers';

const Wishlist = () => {
	const { isAuthenticated } = useAuth();
	const { wishlistItems, loading, fetchWishlist, removeFromWishlist } = useWishlist();
	const { addToCart } = useCart();

	useEffect(() => {
		if (!isAuthenticated) return;
		fetchWishlist();
	}, [isAuthenticated, fetchWishlist]);

	if (!isAuthenticated) {
		return (
			<div className="home-page">
				<Navbar />
				<div className="container">
					<p className="empty-state">Please <Link to="/signin">sign in</Link> to view wishlist.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="home-page">
			<Navbar />

			<div className="container">
				<h2 className="section-title">Saved For Later</h2>

				{loading ? <Loader /> : null}

				{!loading && !wishlistItems.length ? (
					<p className="empty-state">Your wishlist is empty. Add products you love.</p>
				) : null}

				{!loading && wishlistItems.length ? (
					<div className="list-panel">
						{wishlistItems.map((item) => (
							<article className="list-item" key={item._id}>
								<img src={item.image} alt={item.name} className="list-thumb" />
								<div className="list-body">
									<h3>{item.name}</h3>
									<p>{item.category}</p>
									<small>{formatCurrency(item.price)}</small>
								</div>

								<div className="list-end">
									<button type="button" className="text-btn" onClick={() => addToCart(getProductId(item))}>
										Add to Cart
									</button>
									<button type="button" className="text-btn danger" onClick={() => removeFromWishlist(getProductId(item))}>
										Remove
									</button>
								</div>
							</article>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default Wishlist;
