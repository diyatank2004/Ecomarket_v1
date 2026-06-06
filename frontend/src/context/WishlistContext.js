import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { wishlistApi } from "../services/api";
import { getFriendlyError, getProductId } from "../utils/helpers";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
	const [wishlistItems, setWishlistItems] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchWishlist = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await wishlistApi.get();
			setWishlistItems(data?.wishlist || []);
			return { ok: true };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Failed to load wishlist") };
		} finally {
			setLoading(false);
		}
	}, []);

	const addToWishlist = async (productId) => {
		try {
			await wishlistApi.add(productId);
			await fetchWishlist();
			return { ok: true };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Unable to add to wishlist") };
		}
	};

	const removeFromWishlist = async (productId) => {
		try {
			await wishlistApi.remove(productId);
			await fetchWishlist();
			return { ok: true };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Unable to remove from wishlist") };
		}
	};

	const isInWishlist = (productId) => {
		return wishlistItems.some((item) => getProductId(item) === productId);
	};

	const value = useMemo(
		() => ({
			wishlistItems,
			loading,
			fetchWishlist,
			addToWishlist,
			removeFromWishlist,
			isInWishlist,
		}),
		[wishlistItems, loading, fetchWishlist]
	);

	return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
	const context = useContext(WishlistContext);
	if (!context) {
		throw new Error("useWishlist must be used within WishlistProvider");
	}
	return context;
};
