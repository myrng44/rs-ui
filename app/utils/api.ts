const API_BASE_URL = 'http://localhost:8080';

interface ApiError extends Error {
  status?: number;
}

interface ApiResponse<T> {
  header: {
    timestamp: string;
    code: number;
    message: string;
    traceId: string;
    offset?: number;
    limit?: number;
    totalRecords?: number;
  };
  body: T;
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

//auth API
export const authApi = {
  login: async (credentials: { username: string; password: string;}) => {
    return apiCall<{
      accessToken: string;
      tokenType: string;
      refreshToken: string;
      issuedAt: number;
      expiresIn: number;
      expiresAt: number;
    }>('/public/rest/v1/auth/login', {
      method: 'POST',
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
    }>('/public/rest/v1/auth/me');
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

    const response = await apiCallWithResponse<Array<{
      id: string;
      sku: string;
      name: string;
      desc: string;
      unitPrice: number;
      categoryId: string;
    }>>(endpoint);

    return {
      elements: response.body,
      totalElements: response.header.totalRecords || 0,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      sku: string;
      name: string;
      desc: string;
      unitPrice: number;
      categoryId: string;
    }>(`/secured/rest/v1/products/${id}`);

    return response.body;
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
      desc: string;
      unitPrice: number;
      categoryId: string;
    }>('/secured/rest/v1/products', {
      method: 'POST',
      body: JSON.stringify({
        sku: product.sku,
        name: product.name,
        desc: product.description,
        unitPrice: product.unitPrice,
        categoryId: product.categoryId,
      }),
    });

    return response.body;
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
      desc: string;
      unitPrice: number;
      categoryId: string;
    }>(`/secured/rest/v1/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        sku: product.sku,
        name: product.name,
        desc: product.description,
        unitPrice: product.unitPrice,
        categoryId: product.categoryId
      }),
    });

    return response.body;
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
      return apiResponse.body;
    }
    return null;
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/products?${searchParams.toString()}`;

    const response = await apiCallWithResponse<Array<{
      id: string;
      sku: string;
      name: string;
      desc: string;
      unitPrice: number;
      categoryId: string;
    }>>(endpoint);

    return response.body.map(product => ({
      ...product,
      description: product.desc,
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

    const response = await apiCallWithResponse<Array<{
      id: string;
      name: string;
      description: string;
    }>>(endpoint);

    return {
      elements: response.body,
      totalElements: response.header.totalRecords || 0,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      description: string;
    }>(`/secured/rest/v1/categories/${id}`);

    return response.body;
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

    return response.body;
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

    return response.body;
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
      return apiResponse.body;
    }
    return null;
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/categories?${searchParams.toString()}`;

    const response = await apiCallWithResponse<Array<{
      id: string;
      name: string;
      description: string;
    }>>(endpoint);

    return response.body.map(category => ({
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

    const response = await apiCallWithResponse<Array<{
      id: string;
      customerId: string;
      customerName: string;
      storeId: number;
      voucherCode: string | null;
      finalPrice: number;
      note: string | null;
      paymentMethodName: string;
    }>>(endpoint);

    return {
      elements: response.body,
      totalElements: response.header.totalRecords || 0,
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

    return response.body;
  },

  create: async (order: {
    customerId: string;
    storeId: string;
    voucherId: string;
    note: string;
    paymentId: string;
  }) => {
    const response = await apiCallWithResponse<{
      id: string;
      customerId: string;
      customerName: string;
      storeId: number;
      voucherCode: string | null;
      finalPrice: number;
      note: string | null;
      paymentMethodName: string;
    }>('/secured/rest/v1/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerId: order.customerId,
        storeId: parseInt(order.storeId),
        voucherCode: order.voucherId || null,
        note: order.note,
        paymentMethodName: order.paymentId,
      }),
    });

    return response.body;
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

    return response.body;
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
      return apiResponse.body;
    }
    return null;
  },

  getCount: async (params?: { query?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/orders/count${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithResponse<number>(endpoint);
    return response.body;
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/orders?${searchParams.toString()}`;

    const response = await apiCallWithResponse<Array<{
      id: string;
      customerId: string;
      customerName: string;
      storeId: number;
      voucherCode: string | null;
      finalPrice: number;
      note: string | null;
      paymentMethodName: string;
    }>>(endpoint);

    return response.body.map(order => ({
      ...order,
      displayText: `Đơn hàng ${order.id} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice)}`,
    }));
  },
};

//dashboard API
export const dashboardApi = {
  getSummary: async () => {
    return apiCall<{
      totalProducts: number;
      todayOrders: number;
      monthlyRevenue: number;
      totalCustomer: number;
    }>('/secured/rest/v1/summary');
  },

  getTopProducts: async (days: number = 30, noProducts: number = 4) => {
    const searchParams = new URLSearchParams();
    searchParams.append('days', days.toString());
    searchParams.append('noProducts', noProducts.toString());

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/orders/most?${queryString}`;

    return apiCall<
      Array<{
        id: string;
        sku: string;
        name: string;
        description: string;
        unitPrice: number;
        categoryId: number;
        supplierId: number;
      }>
    >(endpoint);
  },
};

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

    const response = await apiCallWithResponse<Array<{
      id: string;
      productId: number;
      storeId: number;
      quantity: number;
    }>>(endpoint);

    return {
      elements: response.body,
      totalElements: response.header.totalRecords || 0,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      productId: number;
      storeId: number;
      quantity: number;
    }>(`/secured/rest/v1/batch-stocks/${id}`);

    return response.body;
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

    return response.body;
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

    return response.body;
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
      return apiResponse.body;
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
      elements: response.body,
      totalElements: response.body.length,
    };
  },
};

//supplier API
export const supplierApi = {
  getAll: async (params?: { query?: string; sort?: string; offset?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = `/secured/rest/v1/suppliers${queryString ? `?${queryString}` : ''}`;

    const response = await apiCallWithResponse<Array<{
      id: string;
      name: string;
      address: string;
      contact: string;
    }>>(endpoint);

    return {
      elements: response.body,
      totalElements: response.header.totalRecords || 0,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      address: string;
      contact: string;
    }>(`/secured/rest/v1/suppliers/${id}`);

    return response.body;
  },

  create: async (supplier: { name: string; address: string; contact: string }) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      address: string;
      contact: string;
    }>(`/secured/rest/v1/suppliers`, {
      method: 'POST',
      body: JSON.stringify(supplier),
    });

    return response.body;
  },

  update: async (
    id: string,
    supplier: {
      name: string;
      address: string;
      contact: string;
    },
  ) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      address: string;
      contact: string;
    }>(`/secured/rest/v1/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });

    return response.body;
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
      const apiResponse = await response.json() as ApiResponse<any>;
      return apiResponse.body;
    }
    return null;
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

    const response = await apiCallWithResponse<Array<{
      id: string;
      code: string;
      description: string;
      discountPercent: number;
      discountValue: number;
      startTime: string;
      expirationTime: string;
    }>>(endpoint);

    return {
      elements: response.body,
      totalElements: response.header.totalRecords || 0,
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

    return response.body;
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

    return response.body;
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

    return response.body;
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
      return apiResponse.body;
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

    const response = await apiCallWithResponse<Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    }>>(endpoint);

    return {
      elements: response.body,
      totalElements: response.header.totalRecords || 0,
    };
  },

  getById: async (id: string) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    }>(`/secured/rest/v1/customers/${id}`);

    return response.body;
  },

  create: async (customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    }>(`/secured/rest/v1/customers`, {
      method: 'POST',
      body: JSON.stringify(customer),
    });

    return response.body;
  },

  update: async (
    id: string,
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    },
  ) => {
    const response = await apiCallWithResponse<{
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    }>(`/secured/rest/v1/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });

    return response.body;
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
      return apiResponse.body;
    }
    return null;
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', '0');

    const endpoint = `/secured/rest/v1/customers?${searchParams.toString()}`;

    const response = await apiCallWithResponse<Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    }>>(endpoint);

    return response.body.map(customer => ({
      ...customer,
      displayText: `${customer.name} (${customer.email})`,
    }));
  },
};
