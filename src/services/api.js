
const BASE = import.meta.env.VITE_API_URL || "/api";

export const token = () => localStorage.getItem("MOGREN_token");

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token()) {
    headers.Authorization = `Bearer ${token()}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();

  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    throw new Error(
      body?.message ||
        body?.error ||
        `Request failed (${res.status})`
    );
  }

  return body;
}

/* ============================
   Catalog APIs
============================ */

export const catalogApi = {
  // Existing methods
  list: () => api("/products"),

  one: (slug) =>
    api(`/products/${slug}`),

  // New aliases used by Shop.jsx / Home.jsx
  getProducts: () =>
    api("/products"),

  getProductBySlug: (slug) =>
    api(`/products/${slug}`),
};

/* ============================
   Authentication APIs
============================ */

export const authApi = {
  login: (email, password) =>
    api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  register: (data) =>
    api("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleLogin: (credential) =>
    api("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        credential,
      }),
    }),
};

/* ============================
   Order APIs
============================ */

export const orderApi = {
  create: (data) =>
    api("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  mine: () =>
    api("/orders/me"),

  // Alias for newer code
  createOrder: (data) =>
    api("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyOrders: () =>
    api("/orders/me"),
};

/* ============================
   Admin APIs
============================ */

export const adminApi = {
  stats: () =>
    api("/admin/stats"),

  products: () =>
    api("/admin/products"),

  orders: () =>
    api("/admin/orders"),

  saveProduct: (product) =>
    api(
      product.id
        ? `/admin/products/${product.id}`
        : "/admin/products",
      {
        method: product.id ? "PUT" : "POST",
        body: JSON.stringify(product),
      }
    ),

  updateOrder: (id, status) =>
    api(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }),

  // New aliases
  getProducts: () =>
    api("/admin/products"),

  getOrders: () =>
    api("/admin/orders"),

  updateOrderStatus: (id, status) =>
    api(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }),
};

