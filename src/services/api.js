const BASE =
  import.meta.env.VITE_API_URL ||
  "/api";

/*
 * ============================================================
 * TOKEN
 * ============================================================
 */

export const token = () =>
  localStorage.getItem(
    "MOGREN_token"
  );

/*
 * ============================================================
 * COMMON API METHOD
 * ============================================================
 */

export async function api(
  path,
  options = {}
) {
  /*
   * Read token once.
   */
  const authToken =
    token();

  const headers = {
    "Content-Type":
      "application/json",

    ...(options.headers ||
      {}),
  };

  /*
   * Add JWT for authenticated requests.
   */
  if (authToken) {
    headers.Authorization =
      `Bearer ${authToken}`;
  }

  const url =
    `${BASE}${path}`;

  let res;

  try {
    res = await fetch(
      url,
      {
        ...options,
        headers,
      }
    );
  } catch (error) {
    console.error(
      "API network error:",
      {
        path,
        error,
      }
    );

    throw new Error(
      "Unable to connect to server"
    );
  }

  /*
   * ==========================================================
   * READ RESPONSE
   * ==========================================================
   */

  const text =
    await res.text();

  let body = null;

  if (text) {
    try {
      body =
        JSON.parse(
          text
        );
    } catch {
      body =
        text;
    }
  }

  /*
   * ==========================================================
   * AUTH ERRORS
   * ==========================================================
   */

  if (
    res.status ===
    401
  ) {
    console.error(
      "API 401 Unauthorized:",
      {
        path,
        tokenPresent:
          Boolean(
            authToken
          ),
        body,
      }
    );

    throw new Error(
      body?.message ||
        body?.error ||
        "Your session is not valid. Please login again."
    );
  }

  if (
    res.status ===
    403
  ) {
    console.error(
      "API 403 Forbidden:",
      {
        path,

        /*
         * Do NOT print actual JWT.
         */
        tokenPresent:
          Boolean(
            authToken
          ),

        body,
      }
    );

    throw new Error(
      body?.message ||
        body?.error ||
        "You are not authorized to perform this action."
    );
  }

  /*
   * ==========================================================
   * OTHER ERRORS
   * ==========================================================
   */

  if (!res.ok) {
    throw new Error(
      body?.message ||
        body?.error ||
        `Request failed (${res.status})`
    );
  }

  return body;
}

/*
 * ============================================================
 * CATALOG APIs
 * ============================================================
 */

export const catalogApi = {
  list: () =>
    api(
      "/products"
    ),

  one: (slug) =>
    api(
      `/products/${slug}`
    ),

  getProducts: () =>
    api(
      "/products"
    ),

  getProductBySlug:
    (slug) =>
      api(
        `/products/${slug}`
      ),
};

/*
 * ============================================================
 * AUTHENTICATION APIs
 * ============================================================
 */

export const authApi = {
  login: (
    email,
    password
  ) =>
    api(
      "/auth/login",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            email,
            password,
          }),
      }
    ),

  register: (
    data
  ) =>
    api(
      "/auth/register",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            data
          ),
      }
    ),

  googleLogin: (
    credential
  ) =>
    api(
      "/auth/google",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            credential,
          }),
      }
    ),
};

/*
 * ============================================================
 * ORDER APIs
 * ============================================================
 */

export const orderApi = {
  /*
   * Create order.
   *
   * JWT is automatically added by api().
   */
  create: (
    data
  ) =>
    api(
      "/orders",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            data
          ),
      }
    ),

  mine: () =>
    api(
      "/orders/me"
    ),

  /*
   * Alias used by newer Checkout code.
   */
  createOrder: (
    data
  ) =>
    api(
      "/orders",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            data
          ),
      }
    ),

  getMyOrders: () =>
    api(
      "/orders/me"
    ),
};

/*
 * ============================================================
 * CUSTOMIZATION PRICING APIs
 * ============================================================
 */

export const customizationPricingApi = {
  getByGarmentType:
    (garmentType) =>
      api(
        `/customization-pricing/${encodeURIComponent(
          garmentType
        )}`
      ),

  calculate: ({
    garmentType,
    designedAreas,
  }) =>
    api(
      "/customization-pricing/calculate",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            garmentType,
            designedAreas,
          }),
      }
    ),
};

/*
 * ============================================================
 * ADMIN APIs
 * ============================================================
 */

export const adminApi = {
  stats: () =>
    api(
      "/admin/stats"
    ),

  products: () =>
    api(
      "/admin/products"
    ),

  orders: () =>
    api(
      "/admin/orders"
    ),

  saveProduct: (
    product
  ) =>
    api(
      product.id
        ? `/admin/products/${product.id}`
        : "/admin/products",

      {
        method:
          product.id
            ? "PUT"
            : "POST",

        body:
          JSON.stringify(
            product
          ),
      }
    ),

  updateOrder: (
    id,
    status
  ) =>
    api(
      `/admin/orders/${id}/status`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            status,
          }),
      }
    ),

  getProducts: () =>
    api(
      "/admin/products"
    ),

  getOrders: () =>
    api(
      "/admin/orders"
    ),

  updateOrderStatus:
    (
      id,
      status
    ) =>
      api(
        `/admin/orders/${id}/status`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify({
              status,
            }),
        }
      ),

  /*
   * Customization pricing admin.
   */

  getCustomizationPricing:
    () =>
      api(
        "/admin/customization-pricing"
      ),

  createCustomizationPricing:
    (data) =>
      api(
        "/admin/customization-pricing",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              data
            ),
        }
      ),

  updateCustomizationPricing:
    (
      id,
      data
    ) =>
      api(
        `/admin/customization-pricing/${id}`,
        {
          method:
            "PUT",

          body:
            JSON.stringify(
              data
            ),
        }
      ),

  updateCustomizationPricingStatus:
    (
      id,
      active
    ) =>
      api(
        `/admin/customization-pricing/${id}/status?active=${active}`,
        {
          method:
            "PATCH",
        }
      ),
};