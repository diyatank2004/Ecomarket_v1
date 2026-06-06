import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cartApi, ordersApi } from "../services/api";
import { getFriendlyError, getProductId } from "../utils/helpers";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
	const [cartItems, setCartItems] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchCart = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await cartApi.get();
			setCartItems(data?.cart || []);
			return { ok: true };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Failed to load cart") };
		} finally {
			setLoading(false);
		}
	}, []);

	const addToCart = async (productId) => {
		try {
			const { data } = await cartApi.add(productId);
			if (data?.cart) {
				setCartItems(data.cart);
			} else {
				await fetchCart();
			}
			return { ok: true, message: data?.message || "Added to cart" };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Unable to add to cart") };
		}
	};

	const removeFromCart = async (productId) => {
		try {
			const { data } = await cartApi.remove(productId);
			if (data?.cart) {
				setCartItems(data.cart);
			} else {
				await fetchCart();
			}
			return { ok: true };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Unable to remove from cart") };
		}
	};

	const placeOrder = async () => {
		try {
			const { data } = await ordersApi.place();
			setCartItems([]);
			return { ok: true, data };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Unable to place order") };
		}
	};

	const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
	const cartTotal = cartItems.reduce(
		(sum, item) => sum + (Number(item.product?.price || 0) * Number(item.quantity || 0)),
		0
	);

	const isInCart = (productId) => {
		return cartItems.some((item) => getProductId(item) === productId);
	};

	const value = useMemo(
		() => ({
			cartItems,
			loading,
			cartCount,
			cartTotal,
			fetchCart,
			addToCart,
			removeFromCart,
			placeOrder,
			isInCart,
		}),
		[cartItems, loading, cartCount, cartTotal, fetchCart]
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within CartProvider");
	}
	return context;
};
