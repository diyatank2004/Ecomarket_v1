import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
});

// attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const authApi = {
  register: (payload) => API.post("/auth/register", payload),
  login: (payload) => API.post("/auth/login", payload),
};

export const productsApi = {
  getAll: () => API.get("/products/getall"),
  search: (query) => API.get(`/products/search?query=${encodeURIComponent(query)}`),
  getById: (id) => API.get(`/products/${id}`),
  create: (payload) => API.post("/products/create", payload),
  update: (id, payload) => API.put(`/products/update/${id}`, payload),
  remove: (id) => API.delete(`/products/delete/${id}`),
};

export const cartApi = {
  get: () => API.get("/cart"),
  add: (productId) => API.post("/cart/add", { productId }),
  remove: (productId) => API.delete("/cart/remove", { data: { productId } }),
};

export const wishlistApi = {
  get: () => API.get("/wishlist"),
  add: (productId) => API.post("/wishlist/add", { productId }),
  remove: (productId) => API.delete("/wishlist/remove", { data: { productId } }),
};

export const ordersApi = {
  place: () => API.post("/orders/place"),
  getMine: () => API.get("/orders/my"),
};

export default API;