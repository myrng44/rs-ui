const API_BASE_URL = 'http://localhost:8080';

interface ApiError extends Error {
	status?: number;
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

//auth API
export const authApi = {
	login: async (credentials: { username: string; password: string; storeId: string }) => {
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
		}>('/secured/rest/v1/products', {
			method: 'POST',
			body: JSON.stringify({
				...product,
				unitPrice: parseFloat(product.unitPrice),
				categoryId: parseInt(product.categoryId),
				supplierId: parseInt(product.supplierId),
			}),
		});
	},

	update: async (
		id: string,
		product: {
			sku: string;
			name: string;
			description: string;
			unitPrice: string;
			categoryId: string;
			supplierId: string;
		},
	) => {
		return apiCall<{
			id: string;
			sku: string;
			name: string;
			description: string;
			unitPrice: number;
			categoryId: number;
			supplierId: number;
		}>(`/secured/rest/v1/products/${id}`, {
			method: 'PUT',
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

		//handle empty response for DELETE (204 No Content)
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return response.json();
		}
		return null;
	},
  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append("query", query);
    searchParams.append("limit", limit.toString());
    searchParams.append("offset", "0");

    const endpoint = `/secured/rest/v1/products?${searchParams.toString()}`;

    const response = await apiCall<{
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

    return response.elements.map(product => ({
      ...product,
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

		return apiCall<{
			elements: Array<{
				id: string;
				name: string;
				description: string;
			}>;
			totalElements: number;
		}>(endpoint);
	},

	getById: async (id: string) => {
		return apiCall<{
			id: string;
			name: string;
			description: string;
		}>(`/secured/rest/v1/categories/${id}`);
	},

	create: async (category: { name: string; description: string }) => {
		return apiCall<{
			id: string;
			name: string;
			description: string;
		}>(`secured/rest/v1/categories`, {
			method: 'POST',
			body: JSON.stringify({
				...category,
			}),
		});
	},

	update: async (
		id: string,
		category: {
			name: string;
			description: string;
		},
	) => {
		return apiCall<{
			id: string;
			name: string;
			description: string;
		}>(`/secured/rest/v1/categories/${id}`, {
			method: 'PUT',
			body: JSON.stringify({
				...category,
			}),
		});
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

		//handle empty response for DELETE (204 No Content)
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return response.json();
		}
		return null;
	},

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append("query", query);
    searchParams.append("limit", limit.toString());
    searchParams.append("offset", "0");

    const endpoint = `/secured/rest/v1/categories?${searchParams.toString()}`;

    const response = await apiCall<{
      elements: Array<{
        id: string;
        name: string;
        description: string;
      }>;
      totalElements: number;
    }>(endpoint);

    return response.elements.map(category => ({
      ...category,
      displayText: `${category.name}`,}));
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

		return apiCall<{
			elements: Array<{
				id: string;
				customerId: string;
        customerName: string;
				storeId: number;
				voucherId: string | null;
				finalPrice: number;
				note: string;
				paymentId: number;
			}>;
			totalElements: number;
		}>(endpoint);
	},

	getById: async (id: string) => {
		return apiCall<{
			id: string;
			customerId: number;
			storeId: number;
			voucherId: number | null;
			finalPrice: number;
			note: string;
			paymentId: number;
		}>(`/secured/rest/v1/orders/${id}`);
	},

	create: async (order: {
		customerId: string;
		storeId: string;
		voucherId: string;
		note: string;
		paymentId: string;
	}) => {
		return apiCall<{
			id: string;
			customerId: number;
			storeId: number;
			voucherId: number | null;
			finalPrice: number;
			note: string;
			paymentId: number;
		}>('/secured/rest/v1/orders', {
			method: 'POST',
			body: JSON.stringify({
				...order,
				customerId: parseInt(order.customerId),
				storeId: parseInt(order.storeId),
				voucherId: order.voucherId ? parseInt(order.voucherId) : null,
				paymentId: parseInt(order.paymentId),
			}),
		});
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
		return apiCall<{
			id: string;
			customerId: number;
			storeId: number;
			voucherId: number | null;
			finalPrice: number;
			note: string;
			paymentId: number;
		}>(`/secured/rest/v1/orders/${id}`, {
			method: 'PUT',
			body: JSON.stringify({
				...order,
				customerId: parseInt(order.customerId),
				storeId: parseInt(order.storeId),
				voucherId: order.voucherId ? parseInt(order.voucherId) : null,
				paymentId: parseInt(order.paymentId),
			}),
		});
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

		//handle empty response for DELETE (204 No Content)
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return response.json();
		}
		return null;
	},

	getCount: async (params?: { query?: string }) => {
		const searchParams = new URLSearchParams();
		if (params?.query) searchParams.append('query', params.query);

		const queryString = searchParams.toString();
		const endpoint = `/secured/rest/v1/orders/count${queryString ? `?${queryString}` : ''}`;

		return apiCall<number>(endpoint);
	},

	getOrderDetails: async (orderId: string) => {
		return apiCall<
			Array<{
				id: string;
				orderId: string;
				productId: number;
				productName: string;
				quantity: number;
				unitPrice: number;
				totalPrice: number;
			}>
		>(`/secured/rest/v1/orders/details/summary/${orderId}`);
	},

  createOrderDetail: async (orderDetail: {
    orderId: string;
    productId: string;
    quantity: number;
  }) => {
    return apiCall<{
      id: string;
      orderId: string;
      productId: number;
      quantity: number;
    }>('/secured/rest/v1/orders/details', {
      method: 'POST',
      body: JSON.stringify(orderDetail),
    });
  },

  search: async (query: string, limit: number = 10) => {
    const searchParams = new URLSearchParams();
    searchParams.append("query", query);
    searchParams.append("limit", limit.toString());
    searchParams.append("offset", "0");

    const endpoint = `/secured/rest/v1/orders?${searchParams.toString()}`;

    const response = await apiCall<{
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
    }>(endpoint);

    return response.elements.map(order => ({
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
		const endpoint = `/secured/rest/v1/store-stock${queryString ? `?${queryString}` : ''}`;

		return apiCall<{
			elements: Array<{
				id: string;
				productId: number;
				storeId: number;
				quantity: number;
			}>;
			totalElements: number;
		}>(endpoint);
	},

	getById: async (id: string) => {
		return apiCall<{
			id: string;
			productId: number;
			storeId: number;
			quantity: number;
		}>(`/secured/rest/v1/store-stock/${id}`);
	},

	create: async (stock: { productId: string; storeId: string; quantity: string }) => {
		return apiCall<{
			id: string;
			productId: number;
			storeId: number;
			quantity: number;
		}>('/secured/rest/v1/store-stock', {
			method: 'POST',
			body: JSON.stringify({
				productId: parseInt(stock.productId),
				storeId: parseInt(stock.storeId),
				quantity: parseInt(stock.quantity),
			}),
		});
	},

	update: async (
		id: string,
		stock: {
			productId: string;
			storeId: string;
			quantity: string;
		},
	) => {
		return apiCall<{
			id: string;
			productId: number;
			storeId: number;
			quantity: number;
		}>(`/secured/rest/v1/store-stock/${id}`, {
			method: 'PUT',
			body: JSON.stringify({
				productId: parseInt(stock.productId),
				storeId: parseInt(stock.storeId),
				quantity: parseInt(stock.quantity),
			}),
		});
	},

	delete: async (id: string) => {
		const response = await fetch(`${API_BASE_URL}/secured/rest/v1/store-stock/${id}`, {
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
			return response.json();
		}
		return null;
	},

	getFiltered: async (storeId: number) => {
		return apiCall<{
			elements: Array<{
				id: string;
				productId: number;
				storeId: number;
				quantity: number;
			}>;
			totalElements: number;
		}>('/secured/rest/v1/store-stock/filtered', {
			method: 'POST',
			body: JSON.stringify({ storeId }),
		});
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

		return apiCall<{
			elements: Array<{
				id: string;
				name: string;
				address: string;
				contact: string;
			}>;
			totalElements: number;
		}>(endpoint);
	},

	getById: async (id: string) => {
		return apiCall<{
			id: string;
			name: string;
			address: string;
			contact: string;
		}>(`/secured/rest/v1/suppliers/${id}`);
	},

	create: async (supplier: { name: string; address: string; contact: string }) => {
		return apiCall<{
			id: string;
			name: string;
			address: string;
			contact: string;
		}>(`secured/rest/v1/suppliers`, {
			method: 'POST',
			body: JSON.stringify({
				...supplier,
			}),
		});
	},

	update: async (
		id: string,
		supplier: {
			name: string;
			address: string;
			contact: string;
		},
	) => {
		return apiCall<{
			id: string;
			name: string;
			address: string;
			contact: string;
		}>(`/secured/rest/v1/suppliers/${id}`, {
			method: 'PUT',
			body: JSON.stringify({
				...supplier,
			}),
		});
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

		//handle empty response for DELETE (204 No Content)
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return response.json();
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

		return apiCall<{
			elements: Array<{
				id: string;
				code: string;
				description: string;
				discountPercent: number;
				discountValue: number;
				startTime: any;
				expirationTime: any;
			}>;
			totalElements: number;
		}>(endpoint);
	},

	getById: async (id: string) => {
		return apiCall<{
			id: string;
			code: string;
			description: string;
			discountPercent: number;
			discountValue: number;
			startTime: any;
			expirationTime: any;
		}>(`/secured/rest/v1/vouchers/${id}`);
	},

	create: async (voucher: {
		code: string;
		description: string;
		discountPercent: number;
		discountValue: number;
		startTime: any;
		expirationTime: any;
	}) => {
		return apiCall<{
			id: string;
			code: string;
			description: string;
			discountPercent: number;
			discountValue: number;
			startTime: any;
			expirationTime: any;
		}>(`secured/rest/v1/vouchers`, {
			method: 'POST',
			body: JSON.stringify({
				...voucher,
			}),
		});
	},

	update: async (
		id: string,
		voucher: {
			code: string;
			description: string;
			discountPercent: number;
			discountValue: number;
			startTime: any;
			expirationTime: any;
		},
	) => {
		return apiCall<{
			id: string;
			code: string;
			description: string;
			discountPercent: number;
			discountValue: number;
			startTime: any;
			expirationTime: any;
		}>(`/secured/rest/v1/vouchers/${id}`, {
			method: 'PUT',
			body: JSON.stringify({
				...voucher,
			}),
		});
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

		//handle empty response for DELETE (204 No Content)
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return response.json();
		}
		return null;
	},
};
