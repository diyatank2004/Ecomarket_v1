export const formatCurrency = (value) => {
	const amount = Number(value || 0);
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2,
	}).format(amount);
};

export const truncateText = (value, max = 90) => {
	if (!value) return "";
	return value.length <= max ? value : `${value.slice(0, max)}...`;
};

export const getFriendlyError = (error, fallback = "Something went wrong") => {
	return error?.response?.data?.message || fallback;
};

export const getProductId = (item) => {
	if (!item) return null;
	return item._id || item.id || item.product?._id || item.product;
};
