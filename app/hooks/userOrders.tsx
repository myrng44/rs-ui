import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '~/utils/api';

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  storeId: string;
  voucherCode: string | null;
  finalPrice: number;
  note: string | null;
  paymentMethodName: string;
}

interface UseOrdersParams {
  page?: number;
  limit?: number;
  query?: string;
  sort?: string;
  filters?: {
    paymentMethod?: string;
    priceRange?: { min: string; max: string };
    hasVoucher?: string;
    storeId?: string;
  };
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  refetch: () => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

export const useOrders = (params: UseOrdersParams = {}): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  // const buildSearchQuery = useCallback(() => {
  //   const queries: string[] = [];
    
  //   if (params.query?.trim()) {
  //     queries.push(params.query.trim());
  //   }

  //   if (params.filters?.paymentMethod) {
  //     queries.push(`paymentMethodName:${params.filters.paymentMethod}`);
  //   }

  //   if (params.filters?.storeId) {
  //     queries.push(`storeId:${params.filters.storeId}`);
  //   }

  //   if (params.filters?.hasVoucher === 'yes') {
  //     queries.push('voucherCode:*'); // Has voucher
  //   } else if (params.filters?.hasVoucher === 'no') {
  //     queries.push('!voucherCode:*'); // No voucher
  //   }

  //   if (params.filters?.priceRange?.min) {
  //     queries.push(`finalPrice:>=${params.filters.priceRange.min}`);
  //   }

  //   if (params.filters?.priceRange?.max) {
  //     queries.push(`finalPrice:<=${params.filters.priceRange.max}`);
  //   }

  //   return queries.join(' AND ');
  // }, [params.query, params.filters]);

  const buildSearchQuery = useCallback(() => {
  return params.query?.trim() || '';
  }, [params.query]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchQuery = buildSearchQuery();
      const response = await ordersApi.getAll({
        query: searchQuery || undefined,
        sort: params.sort,
        offset: ((params.page || 1) - 1) * (params.limit || 10),
        limit: params.limit || 10,
      });

      // Sử dụng cấu trúc response thực tế của API
      setOrders(response.elements);
      setTotalItems(response.totalElements);
      setTotalPages(Math.ceil(response.totalElements / (params.limit || 10)));
      setCurrentPage(params.page || 1);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
      setOrders([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.sort, buildSearchQuery]);

  const refetch = useCallback(() => {
    return fetchOrders();
  }, [fetchOrders]);

  const deleteOrder = useCallback(async (id: string) => {
    try {
      await ordersApi.delete(id);
      // Refetch to update the list
      await fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      throw new Error('Không thể xóa đơn hàng. Vui lòng thử lại.');
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    refetch,
    deleteOrder,
  };
};