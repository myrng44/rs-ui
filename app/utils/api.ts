const API_BASE_URL = "http://localhost:8080";

interface ApiError extends Error {
  status?: number;
}

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

  return response.json();
}

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string; storeId: string }) => {
    return apiCall<{
      accessToken: string;
      tokenType: string;
      refreshToken: string;
      issuedAt: number;
      expiresIn: number;
      expiresAt: number;
    }>("/public/rest/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return apiCall<{
      id: number;
      userName: string;
      fullName: string;
      email: string;
      phone: string;
      roleName: string;
      storeId: number;
    }>("/public/rest/v1/auth/me");
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/products${queryString ? `?${queryString}` : ""}`;

    return apiCall<{
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
    }>(endpoint);
  },

  getById: async (id: string) => {
    return apiCall<{
      id: string;
      sku: string;
      name: string;
      description: string;
      unitPrice: number;
      categoryId: number;
      supplierId: number;
    }>(`/secured/rest/v1/products/${id}`);
  },

  create: async (product: {
    sku: string;
    name: string;
    description: string;
    unitPrice: string;
    categoryId: string;
    supplierId: string;
  }) => {
    return apiCall<{
      id: string;
      sku: string;
      name: string;
      description: string;
      unitPrice: number;
      categoryId: number;
      supplierId: number;
    }>("/secured/rest/v1/products", {
      method: "POST",
      body: JSON.stringify({
        ...product,
        unitPrice: parseFloat(product.unitPrice),
        categoryId: parseInt(product.categoryId),
        supplierId: parseInt(product.supplierId),
      }),
    });
  },

  update: async (id: string, product: {
    sku: string;
    name: string;
    description: string;
    unitPrice: string;
    categoryId: string;
    supplierId: string;
  }) => {
    return apiCall<{
      id: string;
      sku: string;
      name: string;
      description: string;
      unitPrice: number;
      categoryId: number;
      supplierId: number;
    }>(`/secured/rest/v1/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...product,
        unitPrice: parseFloat(product.unitPrice),
        categoryId: parseInt(product.categoryId),
        supplierId: parseInt(product.supplierId),
      }),
    });
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    // Handle empty response for DELETE (204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return null;
  },
};
