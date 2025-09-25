import { address } from "framer-motion/client";

const API_BASE_URL = 'http://localhost:8080';

interface ApiError extends Error {
  status?: number;
}

// Updated interfaces to match backend response structure
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
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

async function apiCallWithResponse<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return apiCall<ApiResponse<T>>(endpoint, options);
}

async function apiCallWithPageResponse<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<PageResponse<T>>> {
  return apiCall<ApiResponse<PageResponse<T>>>(endpoint, options);
}

//auth API
export const authApi = {
  login: async (credentials: { userName: string; passWord: string;}) => {
    const response = await apiCallWithResponse<{
      id: number;
      userName: string;
      fullName: string;
      email: string;
      phone: string;
      storeId: number;
      lastLogin: string;
      token: string;
      roles: string[];
      permissions: string[];
    }>('/public/rest/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiCallWithResponse<{
      id: number;
      userName: string;
      fullName: string;
      email: string;
      phone: string;
      storeId: number;
      lastLogin: string;
      roles: string[];
      permissions: string[];
    }>('/public/rest/v1/auth/me');
    return response.data;
  },
};

//products API
export const productsApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/products${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      sku: string;
      name: string;
      description: string;
      unitPrice: number;
      categoryId: string;
    }>(endpoint);

    return {
      elements: response.data.content,
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      sku: string;
      name: string;
      description: string;
      unitPrice: number;
      categoryId: string;
    }>(`/secured/rest/v1/products/${id}`);

    return response.data;
  },

  create: async (product: {
    sku: string;
    name: string;
    description: string;
    unitPrice: string;
    categoryId: string;
  }) => {
    const response = await apiCallWithResponse<{
      id: string;
      sku: string;
      name: string;
      description: string;
      unitPrice: number;
      categoryId: string;
    }>('/secured/rest/v1/products', {
      method: 'POST',
      body: JSON.stringify({
        sku: product.sku,
        name: product.name,
        description: product.description,
        unitPrice: product.unitPrice,
        categoryId: product.categoryId
            }),
    });

    return response.data;
  },

  update: async (
    id: string,
    product: {
      sku: string;
      name: string;
      description: string;
      unitPrice: string;
      categoryId: string;
    },
  ) => {
    const response = await apiCallWithResponse<{
      id: string;
      sku: string;
      name: string;
      description: string;
      unitPrice: number;
      categoryId: string;
    }>(`/secured/rest/v1/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        sku: product.sku,
        name: product.name,
        description: product.description,
        unitPrice: product.unitPrice,
        categoryId: product.categoryId
            }),
    });

    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const apiResponse = await response.json() as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/products?${searchParams.toString()}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      sku: string;
      name: string;
      description: string;
      unitPrice: number;
      categoryId: string;
    }>(endpoint);

    return response.data.content.map(product => ({
      ...product,
      description: product.description,
      displayText: `${product.name} (${product.sku})`,
    }));
  },
};

//category API
export const categoryApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/categories${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      name: string;
      description: string;
    }>(endpoint);

    return {
      elements: response.data.content,
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      description: string;
    }>(`/secured/rest/v1/categories/${id}`);

    return response.data;
  },

  create: async (category: { name: string; description: string }) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      description: string;
    }>(`/secured/rest/v1/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });

    return response.data;
  },

  update: async (
    id: string,
    category: {
      name: string;
      description: string;
    },
  ) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      description: string;
    }>(`/secured/rest/v1/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });

    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const apiResponse = await response.json() as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/categories?${searchParams.toString()}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      name: string;
      description: string;
    }>(endpoint);

    return response.data.content.map(category => ({
      ...category,
      displayText: category.name,
    }));
  },
};

//orders API
export const ordersApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/orders${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      customerId: string;
      customerName: string;
      storeId: number;
      voucherCode: string | null;
      finalPrice: number;
      note: string | null;
      paymentMethodName: string;
    }>(endpoint);

    return {
      elements: response.data.content,
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      customerId: string;
      customerName: string;
      saleLines: Array<{
        id: string;
        saleOrderId: string;
        productId: string;
        productName: string;
        qtyOrdered: number;
        unitPrice: number;
        totalPrice: number;
      }>;
      storeId: number;
      voucherCode: string | null;
      finalPrice: number;
      note: string | null;
      paymentMethodName: string;
    }>(`/secured/rest/v1/orders/${id}`);

    return response.data;
  },

  create: async (order: {
    customerId?: string;  
    storeId: string;
    voucherId?: string | null;
    note?: string;
    paymentId: string;
    lines: Array<{
    productId: string;
    qtyOrdered: number;
    unitPrice?: number;
    }>;
    }) => {
    const response = await apiCallWithResponse<any>('/secured/rest/v1/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });


    return response.data;
  },

  update: async (
    id: string,
    order: {
      customerId: string;
      storeId: string;
      voucherId: string;
      note: string;
      paymentId: string;
    },
  ) => {
    const response = await apiCallWithResponse<{
      id: string;
      customerId: string;
      customerName: string;
      storeId: number;
      voucherCode: string | null;
      finalPrice: number;
      note: string | null;
      paymentMethodName: string;
    }>(`/secured/rest/v1/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        customerId: order.customerId,
        storeId: parseInt(order.storeId),
        voucherCode: order.voucherId || null,
        note: order.note,
        paymentMethodName: order.paymentId,
      }),
    });

    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/orders/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const apiResponse = await response.json() as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },

  getCount: async (params?: { query?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/orders/count${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithResponse<number>(endpoint);
    return response.data;
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/orders?${searchParams.toString()}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      customerId: string;
      customerName: string;
      storeId: number;
      voucherCode: string | null;
      finalPrice: number;
      note: string | null;
      paymentMethodName: string;
    }>(endpoint);

    return response.data.content.map(order => ({
      ...order,
      displayText: `Đơn hàng ${order.id} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice)}`,
    }));
  },
};

//dashboard API
export const dashboardApi = {
  getSummary: async () => {
    const response = await apiCallWithResponse<{
      totalProducts: number;
      todayOrders: number;
      monthlyRevenue: number;
      totalCustomer: number;
    }>('/secured/rest/v1/summary');
    return response.data;
  },

  getTopProducts: async (days: number = 30, noProducts: number = 4) => {
    const searchParams = new URLSearchParams();
    searchParams.append('days', days.toString());
    searchParams.append('noProducts', noProducts.toString());

    const endpoint = `/secured/rest/v1/orders/most?${searchParams.toString()}`;

    const response = await apiCallWithResponse<
      Array<{
        id: string;
        sku: string;
        name: string;
        description: string;
        unitPrice: number;
        categoryId: number;
        totalQuantitySold: number;
      }>
    >(endpoint);

    return response.data;
  },
}


//storeStock API
export const storeStockApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/batch-stocks${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      productId: number;
      storeId: number;
      quantity: number;
    }>(endpoint);

    return {
      elements: response.data.content,
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      productId: number;
      storeId: number;
      quantity: number;
    }>(`/secured/rest/v1/batch-stocks/${id}`);

    return response.data;
  },

  create: async (stock: { productId: string; storeId: string; quantity: string }) => {
    const response = await apiCallWithResponse<{
      id: string;
      productId: number;
      storeId: number;
      quantity: number;
    }>('/secured/rest/v1/batch-stocks', {
      method: 'POST',
      body: JSON.stringify({
        productId: parseInt(stock.productId),
        storeId: parseInt(stock.storeId),
        quantity: parseInt(stock.quantity),
      }),
    });

    return response.data;
  },

  update: async (
    id: string,
    stock: {
      productId: string;
      storeId: string;
      quantity: string;
    },
  ) => {
    const response = await apiCallWithResponse<{
      id: string;
      productId: number;
      storeId: number;
      quantity: number;
    }>(`/secured/rest/v1/batch-stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        productId: parseInt(stock.productId),
        storeId: parseInt(stock.storeId),
        quantity: parseInt(stock.quantity),
      }),
    });

    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/batch-stocks/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const apiResponse = await response.json() as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },

  getFiltered: async (storeId: number) => {
    const response = await apiCallWithResponse<Array<{
      id: string;
      productId: number;
      storeId: number;
      quantity: number;
    }>>('/secured/rest/v1/batch-stocks/filtered', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    });

    return {
      elements: response.data,
      totalElements: response.data.length,
    };
  },
};

//supplier API
export const supplierApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.offset !== undefined) searchParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/suppliers${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      name: string;
      locationId?: string | null; 
      contact?: string | null;
    }>(endpoint);

    return {
      elements: response.data.content,
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      locationId?: string | null; 
      contact?: string | null;
    }>(`/secured/rest/v1/suppliers/${id}`);

    return response.data;
  },

  create: async (supplier: { name: string; locationId?: string | null; contact?: string | null }) => {
    const payload = {
      name: supplier.name,
      locationId:
        supplier.locationId === undefined || supplier.locationId === null || supplier.locationId === ''
          ? null
          : String(supplier.locationId), 
      contact: supplier.contact ?? null,
    };

    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      locationId?: string | null;
      contact?: string | null;
    }>(`/secured/rest/v1/suppliers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  update: async (
    id: string,
    supplier: { name?: string;  locationId?: string | null; contact?: string | null },
  ) => {
    const payload = {
      name: supplier.name,
      locationId:
        supplier.locationId === undefined || supplier.locationId === null || supplier.locationId === ''
          ? null
          : String(supplier.locationId),
      contact: supplier.contact ?? null,
    };

    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      locationId?: string | null;
      contact?: string | null;
    }>(`/secured/rest/v1/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/suppliers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const apiResponse = (await response.json()) as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },

  // tìm kiếm nhanh (typeahead)
  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/suppliers?${searchParams.toString()}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      name: string;
      locationId?: string | null; 
      contact?: string | null;
    }>(endpoint);

    return response.data.content.map(s => ({
      ...s,
      displayText: `${s.name}${s.contact ? ` — ${s.contact}` : ''}`,
    }));
  },
};



//voucher API
export const voucherApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/vouchers${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      code: string;
      description: string;
      discountPercent: number;
      discountValue: number;
      startTime: string;
      expirationTime: string;
    }>(endpoint);

    return {
      elements: response.data.content,
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      code: string;
      description: string;
      discountPercent: number;
      discountValue: number;
      startTime: string;
      expirationTime: string;
    }>(`/secured/rest/v1/vouchers/${id}`);

    return response.data;
  },

  create: async (voucher: {
    code: string;
    description: string;
    discountPercent: number;
    discountValue: number;
    startTime: string;
    expirationTime: string;
  }) => {
    const response = await apiCallWithResponse<{
      id: string;
      code: string;
      description: string;
      discountPercent: number;
      discountValue: number;
      startTime: string;
      expirationTime: string;
    }>(`/secured/rest/v1/vouchers`, {
      method: 'POST',
      body: JSON.stringify(voucher),
    });

    return response.data;
  },

  update: async (
    id: string,
    voucher: {
      code: string;
      description: string;
      discountPercent: number;
      discountValue: number;
      startTime: string;
      expirationTime: string;
    },
  ) => {
    const response = await apiCallWithResponse<{
      id: string;
      code: string;
      description: string;
      discountPercent: number;
      discountValue: number;
      startTime: string;
      expirationTime: string;
    }>(`/secured/rest/v1/vouchers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(voucher),
    });

    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/vouchers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const apiResponse = await response.json() as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },
};

export const customersApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/customers${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      name: string;
      phone: string;
      gender: string;
      point: number;
    }>(endpoint);

    return {
      elements: response.data.content,
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      phone: string;
      gender: string;
      point: number;
    }>(`/secured/rest/v1/customers/${id}`);

    return response.data;
  },

  create: async (customer: {
    name: string;
    phone: string;
    gender: string;
    point: number;
  }) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      phone: string;
      gender: string;
      point: number;
    }>(`/secured/rest/v1/customers`, {
      method: 'POST',
      body: JSON.stringify(customer),
    });

    return response.data;
  },

  update: async (
    id: string,
    customer: {
      name: string;
      phone: string;
      gender: string;
      point: number;
    },
  ) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      phone: string;
      gender: string;
      point: number;
    }>(`/secured/rest/v1/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });

    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/customers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const apiResponse = await response.json() as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/customers?${searchParams.toString()}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      name: string;
      phone: string;
      gender: string;
      point: number;
    }>(endpoint);

    return response.data.content.map(customer => ({
      ...customer,
      displayText: `${customer.name} (${customer.phone})`,
    }));
  },
};

export const paymentMethodApi = {
  getAll: async () => {
    const response = await apiCallWithPageResponse<{
      id: string;
      code: string;
      name: string;
    }>('/secured/rest/v1/payment-method');

    return {
      elements: response.data.content,  
      totalElements: response.data.totalElements,
    };
  },
};

//BatchApi 

/**
 * BatchDto (client-side) -- flexible để tương thích legacy & new schema
 */
export interface BatchDto {
  // general identifiers (may be batch id or batch_item id depending on backend)
  id?: string;             // could be batch id or batch_item id (legacy ambiguity)
  batchId?: string;        // explicit batch id if backend returns it
  batchItemId?: string;    // explicit batch_item id if backend returns it
  batchCode?: string;

  // product / item level (may appear in batch_item responses)
  productId?: number | string;
  itemQty?: number;        // qty in batch_item
  originalQty?: number;    // legacy field on batch
  importedPrice?: number;  // often on batch_item (import price per item)
  manufactureDate?: string | any;
  expiryDate?: string | any;
  arrivalDate?: string | any;

  supplierName?: string;
  // raw payload for debugging
  __raw?: any;
}

/**
 * Payload type to create a batch. Note: creating items likely requires a separate endpoint.
 */
export type BatchCreatePayload = {
  batchCode: string;
  supplierId: number;
  manufactureDate?: string;
  expiryDate?: string;
  arrivalDate?: string;
  // optional: backend might not support items creation inside batch; left here for future
  items?: Array<{
    productId: number | string;
    qty: number;
    importPrice?: number;
    manufactureDate?: string;
    expiryDate?: string;
  }>;
};

export const batchApi = {
  getByProduct: async (productId: string | number) => {
    const response = await apiCallWithResponse<BatchDto[]>(
      `/secured/rest/v1/batch/by-product?productId=${productId}`
    );
    // attach raw for debugging if needed
    return (response.data || []).map((b) => ({ ...b, __raw: b }));
  },

  getByProducts: async (productIds: string[]) => {
    const productIdsParam = productIds.join(",");
    console.log("🌐 Sending batch request with productIds:", productIdsParam);

    const response = await apiCallWithResponse<BatchDto[]>(
      `/secured/rest/v1/batch/by-product?productIds=${productIdsParam}`
    );
    console.log("📦 Batch API response:", response.data);
    return (response.data || []).map((b) => ({ ...b, __raw: b }));
  },

  getAll: async (params?: {
    query?: string;
    sort?: string;
    offset?: number;
    limit?: number;
    productId?: string | number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.offset) searchParams.append("offset", params.offset!.toString());
    if (params?.limit) searchParams.append("limit", params.limit!.toString());
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.productId) searchParams.append("productId", params.productId.toString());

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/batch${queryString ? `?${queryString}` : ""}`;

    const response = await apiCallWithPageResponse<BatchDto>(endpoint);

    return {
      elements: response.data.content.map((c: any) => ({ ...c, __raw: c })),
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<BatchDto>(`/secured/rest/v1/batch/${id}`);
    return { ...response.data, __raw: response.data };
  },

  create: async (batch: BatchCreatePayload) => {
    // Note: current backend BatchController#create expects BatchDto (batch-level)
    // If you want to create batch_items as well, backend must provide /batch-item endpoint.
    const payload: any = {
      batchCode: batch.batchCode,
      supplierId: batch.supplierId,
      manufactureDate: batch.manufactureDate,
      expiryDate: batch.expiryDate,
      arrivalDate: batch.arrivalDate,
    };

    const response = await apiCallWithResponse<BatchDto>(`/secured/rest/v1/batch`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // If items were provided and you later add batch-item endpoint,
    // you can call it here to create items for the created batch.
    return { ...response.data, __raw: response.data };
  },

  update: async (id: string, batch: Partial<BatchCreatePayload>) => {
    const response = await apiCallWithResponse<BatchDto>(`/secured/rest/v1/batch/${id}`, {
      method: "PUT",
      body: JSON.stringify(batch),
    });
    return { ...response.data, __raw: response.data };
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/batch/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const apiResponse = (await response.json()) as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },
};


//storesApi
export const storesApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.offset !== undefined) searchParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/store${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      name: string;
      locationId?: string | null;
      phone?: string | null;
    }>(endpoint);

    return {
      elements: response.data.content,
      totalElements: response.data.totalElements,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      locationId?: string | null;
      phone?: string | null;
    }>(`/secured/rest/v1/store/${id}`);

    return response.data;
  },

  create: async (store: { name: string; locationId?: number | string | null; phone?: string | null }) => {
    const payload = {
      name: store.name,
      locationId:
        store.locationId === undefined || store.locationId === null
          ? null
          : typeof store.locationId === 'string',
      phone: store.phone ?? null,
    };

    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      locationId?: string | null;
      phone?: string | null;
    }>(`/secured/rest/v1/store`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  update: async (
    id: string,
    store: { name?: string;  locationId?: string | null; phone?: string | null },
  ) => {
    const payload = {
      name: store.name,
      locationId:
        store.locationId === undefined || store.locationId === null
          ? null
          : typeof store.locationId === 'string',
      phone: store.phone ?? null,
    };

    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      locationId?: string | null;
      phone?: string | null;
    }>(`/secured/rest/v1/store/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/secured/rest/v1/store/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const apiResponse = (await response.json()) as ApiResponse<any>;
      return apiResponse.data;
    }
    return null;
  },

  // tìm kiếm nhanh (typeahead)
  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/store?${searchParams.toString()}`;

    const response = await apiCallWithPageResponse<{
      id: string;
      name: string;
      locationId?: string | null;
      phone?: string | null;
    }>(endpoint);

    return response.data.content.map(s => ({
      ...s,
      displayText: `${s.name}${s.phone ? ` — ${s.phone}` : ''}`,
    }));
  },

  getAllStoresRevenueSeries: async (days: number = 30) => {
    const endpoint = `/secured/rest/v1/store/revenue/all?days=${days}`;
    const response = await apiCallWithResponse<{
      stores: Array<{
        storeId: number | string;
        storeName: string;
        series: Array<{ date: string; revenue: number }>;
      }>;
      dayTotal?: number;
      weekTotal?: number;
      monthTotal?: number;
      from?: string;
      to?: string;
    }>(endpoint);
    return response.data;
  },

};
