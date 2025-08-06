const API_BASE_URL = "http://localhost:8080";

interface ApiError extends Error {
  status?: number;
}

// Hàm gọi API với xử lý token, lỗi, empty response cho DELETE/204
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = new Error(`API Error: ${response.statusText}`) as ApiError;
    error.status = response.status;
    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
    return null as unknown as T;
  }
  return response.json();
}

export const authApi = {
  // Updated login to match backend response structure
  login: async (credentials: { userName: string; passWord: string }) => {
    return apiCall<{
      code: number;
      message: string;
      data: {
        id: number;
        userName: string;
        fullName: string;
        email: string;
        phone: string;
        storeId: number;
        lastLogin?: string;
        token: string;
        roles: string[];
        permissions: string[];
      };
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // If you have getCurrentUser endpoint, it should also match backend
  getCurrentUser: async () => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: number;
        userName: string;
        fullName: string;
        email: string;
        phone: string;
        storeId: number;
        lastLogin?: string;
        roles: string[];
        permissions: string[];
        createAt?: string;
        createBy?: number;
        updateAt?: string;
        updateBy?: number;
      };
    }>("/api/auth/me");
    return res.data;
  },

  logout: async () => {
    return apiCall<{
      code: number;
      message: string;
      data: string;
    }>("/api/auth/logout", {
      method: "POST",
    });
  },
};
// ========== PRODUCTS API ==========
export const productsApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    const queryString = searchParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        elements: Array<{
          id: string;
          sku: string;
          name: string;
          description: string;
          unitPrice: number;
          categoryId: number;
          supplierId: number;
        }>;
        totalElements: number;
      };
    }>(endpoint);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        sku: string;
        name: string;
        description: string;
        unitPrice: number;
        categoryId: number;
        supplierId: number;
      };
    }>(`/api/products/${id}`);
    return res.data;
  },

  create: async (product: {
    sku: string;
    name: string;
    description: string;
    unitPrice: string;
    categoryId: string;
    supplierId: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        sku: string;
        name: string;
        description: string;
        unitPrice: number;
        categoryId: number;
        supplierId: number;
      };
    }>("/api/products", {
      method: "POST",
      body: JSON.stringify({
        ...product,
        unitPrice: parseFloat(product.unitPrice),
        categoryId: parseInt(product.categoryId),
        supplierId: parseInt(product.supplierId),
      }),
    });
    return res.data;
  },

  update: async (id: string, product: {
    sku: string;
    name: string;
    description: string;
    unitPrice: string;
    categoryId: string;
    supplierId: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        sku: string;
        name: string;
        description: string;
        unitPrice: number;
        categoryId: number;
        supplierId: number;
      };
    }>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...product,
        unitPrice: parseFloat(product.unitPrice),
        categoryId: parseInt(product.categoryId),
        supplierId: parseInt(product.supplierId),
      }),
    });
    return res.data;
  },

  delete: async (id: string) => {
    await apiCall<null>(`/api/products/${id}`, {
      method: "DELETE",
    });
  },
};

// ========== CATEGORY API ==========
export const categoryApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?:number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sort) searchParams.append("sort", params.sort);
    const queryString = searchParams.toString();
    const endpoint = `/api/categories${queryString ? `?${queryString}` : ""}`;
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        elements: Array<{
          id: string;
          name: string;
          description: string;
        }>;
        totalElements: number;
      };
    }>(endpoint);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        name: string;
        description: string;
      };
    }>(`/api/categories/${id}`);
    return res.data;
  },

  create: async (category: {
    name: string;
    description: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        name: string;
        description: string;
      };
    }>("/api/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
    return res.data;
  },

  update: async (id: string, category: {
    name: string;
    description: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        name: string;
        description: string;
      };
    }>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    });
    return res.data;
  },

  delete: async (id: string) => {
    await apiCall<null>(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },
};

// ========== ORDERS API ==========
export const ordersApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    const queryString = searchParams.toString();
    const endpoint = `/api/orders${queryString ? `?${queryString}` : ""}`;
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        elements: Array<{
          id: string;
          customerId: number;
          storeId: number;
          voucherId: number | null;
          finalPrice: number;
          note: string;
          paymentId: number;
        }>;
        totalElements: number;
      };
    }>(endpoint);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        customerId: number;
        storeId: number;
        voucherId: number | null;
        finalPrice: number;
        note: string;
        paymentId: number;
      };
    }>(`/api/orders/${id}`);
    return res.data;
  },

  create: async (order: {
    customerId: string;
    storeId: string;
    voucherId: string;
    note: string;
    paymentId: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        customerId: number;
        storeId: number;
        voucherId: number | null;
        finalPrice: number;
        note: string;
        paymentId: number;
      };
    }>("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        ...order,
        customerId: parseInt(order.customerId),
        storeId: parseInt(order.storeId),
        voucherId: order.voucherId ? parseInt(order.voucherId) : null,
        paymentId: parseInt(order.paymentId),
      }),
    });
    return res.data;
  },

  update: async (id: string, order: {
    customerId: string;
    storeId: string;
    voucherId: string;
    note: string;
    paymentId: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        customerId: number;
        storeId: number;
        voucherId: number | null;
        finalPrice: number;
        note: string;
        paymentId: number;
      };
    }>(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...order,
        customerId: parseInt(order.customerId),
        storeId: parseInt(order.storeId),
        voucherId: order.voucherId ? parseInt(order.voucherId) : null,
        paymentId: parseInt(order.paymentId),
      }),
    });
    return res.data;
  },

  delete: async (id: string) => {
    await apiCall<null>(`/api/orders/${id}`, {
      method: "DELETE",
    });
  },

  getCount: async (params?: { query?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    const queryString = searchParams.toString();
    const endpoint = `/api/orders/count${queryString ? `?${queryString}` : ""}`;
    const res = await apiCall<{ code: number; message: string; data: number }>(endpoint);
    return res.data;
  },

  getOrderDetails: async (orderId: string) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: Array<{
        id: string;
        orderId: string;
        productId: number;
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    }>(`/api/orders/details/summary/${orderId}`);
    return res.data;
  },
};

// ========== DASHBOARD API ==========
export const dashboardApi = {
  getSummary: async () => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        totalProducts: number;
        todayOrders: number;
        monthlyRevenue: number;
        totalCustomer: number;
      };
    }>("/api/summary");
    return res.data;
  },

  getTopProducts: async (days: number = 30, noProducts: number = 4) => {
    const searchParams = new URLSearchParams();
    searchParams.append("days", days.toString());
    searchParams.append("noProducts", noProducts.toString());
    const queryString = searchParams.toString();
    const endpoint = `/api/orders/most?${queryString}`;
    const res = await apiCall<{
      code: number;
      message: string;
      data: Array<[number, string, number]>;
    }>(endpoint);
    return res.data.map(([id, name, unitPrice]) => ({
      id: String(id),
      name,
      unitPrice,
    }));
  },

  getRecentOrders: async (limit: number = 4) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: Array<{
        id: string;
        customerName: string;
        finalPrice: number;
        status: string;
      }>;
    }>(`/api/orders/recent?limit=${limit}`);
    return res.data.map((order) => ({
      id: order.id,
      customer: order.customerName,
      total: order.finalPrice,
      status: order.status,
    }));
  },
};

// ========== STORE STOCK API ==========
export const storeStockApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    const queryString = searchParams.toString();
    const endpoint = `/api/store-stock${queryString ? `?${queryString}` : ""}`;
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        elements: Array<{
          id: string;
          productId: number;
          storeId: number;
          quantity: number;
        }>;
        totalElements: number;
      };
    }>(endpoint);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        productId: number;
        storeId: number;
        quantity: number;
      };
    }>(`/api/store-stock/${id}`);
    return res.data;
  },

  create: async (stock: {
    productId: string;
    storeId: string;
    quantity: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        productId: number;
        storeId: number;
        quantity: number;
      };
    }>("/api/store-stock", {
      method: "POST",
      body: JSON.stringify({
        productId: parseInt(stock.productId),
        storeId: parseInt(stock.storeId),
        quantity: parseInt(stock.quantity),
      }),
    });
    return res.data;
  },

  update: async (id: string, stock: {
    productId: string;
    storeId: string;
    quantity: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        productId: number;
        storeId: number;
        quantity: number;
      };
    }>(`/api/store-stock/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        productId: parseInt(stock.productId),
        storeId: parseInt(stock.storeId),
        quantity: parseInt(stock.quantity),
      }),
    });
    return res.data;
  },

  delete: async (id: string) => {
    await apiCall<null>(`/api/store-stock/${id}`, {
      method: "DELETE",
    });
  },

  getFiltered: async (storeId: number) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        elements: Array<{
          id: string;
          productId: number;
          storeId: number;
          quantity: number;
        }>;
        totalElements: number;
      };
    }>("/api/store-stock/filtered", {
      method: "POST",
      body: JSON.stringify({ storeId }),
    });
    return res.data;
  },
};

// ========== SUPPLIER API ==========
export const supplierApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?:number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sort) searchParams.append("sort", params.sort);
    const queryString = searchParams.toString();
    const endpoint = `/api/suppliers${queryString ? `?${queryString}` : ""}`;
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        elements: Array<{
          id: string;
          name: string;
          address: string;
          contact: string;
        }>;
        totalElements: number;
      };
    }>(endpoint);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        name: string;
        address: string;
        contact: string;
      };
    }>(`/api/suppliers/${id}`);
    return res.data;
  },

  create: async (supplier: {
    name: string;
    address: string;
    contact: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        name: string;
        address: string;
        contact: string;
      };
    }>("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(supplier),
    });
    return res.data;
  },

  update: async (id: string, supplier: {
    name: string;
    address: string;
    contact: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        name: string;
        address: string;
        contact: string;
      };
    }>(`/api/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplier),
    });
    return res.data;
  },

  delete: async (id: string) => {
    await apiCall<null>(`/api/suppliers/${id}`, {
      method: "DELETE",
    });
  },
};

// ========== VOUCHER API ==========
export const voucherApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?:number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sort) searchParams.append("sort", params.sort);
    const queryString = searchParams.toString();
    const endpoint = `/api/vouchers${queryString ? `?${queryString}` : ""}`;
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        elements: Array<{
          id: string;
          code: string;
          description: string;
          discountPercent: number;
          discountValue: number;
          startTime: string;
          expirationTime: string;
        }>;
        totalElements: number;
      };
    }>(endpoint);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        code: string;
        description: string;
        discountPercent: number;
        discountValue: number;
        startTime: string;
        expirationTime: string;
      };
    }>(`/api/vouchers/${id}`);
    return res.data;
  },

  create: async (voucher: {
    code: string;
    description: string;
    discountPercent: number;
    discountValue: number;
    startTime: string;
    expirationTime: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        code: string;
        description: string;
        discountPercent: number;
        discountValue: number;
        startTime: string;
        expirationTime: string;
      };
    }>("/api/vouchers", {
      method: "POST",
      body: JSON.stringify(voucher),
    });
    return res.data;
  },

  update: async (id: string, voucher: {
    code: string;
    description: string;
    discountPercent: number;
    discountValue: number;
    startTime: string;
    expirationTime: string;
  }) => {
    const res = await apiCall<{
      code: number;
      message: string;
      data: {
        id: string;
        code: string;
        description: string;
        discountPercent: number;
        discountValue: number;
        startTime: string;
        expirationTime: string;
      };
    }>(`/api/vouchers/${id}`, {
      method: "PUT",
      body: JSON.stringify(voucher),
    });
    return res.data;
  },

  delete: async (id: string) => {
    await apiCall<null>(`/api/vouchers/${id}`, {
      method: "DELETE",
    });
  },
};