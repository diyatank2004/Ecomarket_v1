import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import { formatCurrency, getFriendlyError } from '../utils/helpers';

const Orders = () => {
	const { isAuthenticated } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!isAuthenticated) return;

		const loadOrders = async () => {
			setLoading(true);
			setError('');
			try {
				const { data } = await ordersApi.getMine();
				setOrders(data?.orders || []);
			} catch (apiError) {
				setError(getFriendlyError(apiError, 'Unable to load orders'));
			} finally {
				setLoading(false);
			}
		};

		loadOrders();
	}, [isAuthenticated]);

	if (!isAuthenticated) {
		return (
			<div className="home-page">
				<Navbar />
				<div className="container">
					<p className="empty-state">Please <Link to="/signin">sign in</Link> to view your orders.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="home-page">
			<Navbar />
			<div className="container">
				<h2 className="section-title">My Orders</h2>
				{loading ? <Loader /> : null}
				{!loading && error ? <p className="empty-state">{error}</p> : null}

				{!loading && !error && !orders.length ? (
					<p className="empty-state">No orders yet. Place your first order from the cart.</p>
				) : null}

				{!loading && orders.length ? (
					<div className="orders-list">
						{orders.map((order) => (
							<article className="order-card" key={order._id}>
								<div className="order-head">
									<h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
									<span className="stock-pill">{order.status}</span>
								</div>
								<p className="order-meta">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
								<ul>
									{order.orderItems?.map((item) => (
										<li key={`${order._id}-${item.product?._id}`}> 
											{item.product?.name || 'Product'} x {item.quantity}
										</li>
									))}
								</ul>
								<p className="summary-total">Total: {formatCurrency(order.totalPrice)}</p>
							</article>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default Orders;
