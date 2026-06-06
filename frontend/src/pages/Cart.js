import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, getProductId } from '../utils/helpers';

const Cart = () => {
	const { isAuthenticated } = useAuth();
	const { cartItems, cartTotal, loading, fetchCart, removeFromCart, placeOrder } = useCart();
	const [statusMessage, setStatusMessage] = useState('');

	useEffect(() => {
		if (!isAuthenticated) return;
		fetchCart();
	}, [isAuthenticated, fetchCart]);

	const handleCheckout = async () => {
		const result = await placeOrder();
		setStatusMessage(result.ok ? 'Order placed successfully.' : result.message);
	};

	if (!isAuthenticated) {
		return (
			<div className="home-page">
				<Navbar />
				<div className="container">
					<p className="empty-state">Please <Link to="/signin">sign in</Link> to view your cart.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="home-page">
			<Navbar />
			<div className="container">
				<h2 className="section-title">Your Cart</h2>

				{loading ? <Loader /> : null}

				{!loading && !cartItems.length ? (
					<p className="empty-state">Your cart is empty. Browse products and add your first item.</p>
				) : null}

				{!loading && cartItems.length ? (
					<div className="list-grid">
						<div className="list-panel">
							{cartItems.map((item) => (
								<article className="list-item" key={getProductId(item)}>
									<img src={item.product?.image} alt={item.product?.name} className="list-thumb" />
									<div className="list-body">
										<h3>{item.product?.name}</h3>
										<p>{item.product?.category}</p>
										<small>Qty: {item.quantity}</small>
									</div>
									<div className="list-end">
										<span>{formatCurrency(Number(item.product?.price || 0) * item.quantity)}</span>
										<button type="button" className="text-btn danger" onClick={() => removeFromCart(getProductId(item))}>
											Remove
										</button>
									</div>
								</article>
							))}
						</div>

						<aside className="summary-panel">
							<h3>Order Summary</h3>
							<p>Items: {cartItems.length}</p>
							<p className="summary-total">Total: {formatCurrency(cartTotal)}</p>
							<button type="button" className="primary-btn" onClick={handleCheckout}>
								Place Order
							</button>
						</aside>
					</div>
				) : null}

				{statusMessage ? <p className="form-message">{statusMessage}</p> : null}
			</div>
		</div>
	);
};

export default Cart;
