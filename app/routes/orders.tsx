import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { Pagination } from '../components/Pagination';
import OrdersTable from '../components/orders/OrdersTable';
import OrdersFilters from '../components/orders/OrdersFilters';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import OrderForm from '../components/orders/OrderForm';
import { useOrders } from '../hooks/userOrders';
import { ordersApi, paymentMethodApi, storesApi } from '~/utils/api';
import { Layout } from '~/components/Layout';
import AutocompleteSearchBar, { type SearchField, type SearchResult } from '~/components/AutoCompleteSearchBar';

interface FilterValues {
  paymentMethod: string;
  priceRange: { min: string; max: string };
  hasVoucher: string;
  storeId: string;
}

interface PaymentMethod {
  id: string;
  code: string;
  name: string;
}

const OrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-createdTime');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    paymentMethod: '',
    priceRange: { min: '', max: '' },
    hasVoucher: '',
    storeId: ''
  });

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Data for dropdowns
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stores, setStores] = useState<Array<{ id: number; name: string }>>([]);

  // Use the orders hook
  const {
    orders,
    loading,
    error,
    totalItems,
    totalPages,
    refetch,
    deleteOrder
  } = useOrders({
    page: currentPage,
    limit: itemsPerPage,
    query: searchQuery,
    sort: sortBy,
    filters: filters
  });

  const ordersSearchFields: SearchField[] = [
    { value: 'customerId', label: 'Mã khách hàng', type: 'text', operator: ':' },
    { value: 'finalPrice', label: 'Giá cuối', type: 'number', operator: ':' }
  ];

  // onSearch should ONLY return suggestions (do not modify searchQuery here)
  const handleAutocompleteSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    try {
      return (await ordersApi.search(query)) as any;
    } catch (err) {
      console.error('Autocomplete search error:', err);
      return [];
    }
  }, []);

  // Called when user submits a query (Enter) or selects a suggestion (component's submitOnSelect=true by default)
  // query is raw like "customerId:123" or "" to clear
  const handleSearchSubmit = useCallback((query: string) => {
    setSearchQuery(query || '');
    setCurrentPage(1);
  }, []);

  // Load payment methods and stores for filters
  useEffect(() => {
    (async () => {
      try {
        const pm = await paymentMethodApi.getAll();
        setPaymentMethods(pm.elements || []);
      } catch (err) {
        console.error('Error loading payment methods:', err);
      }

      try {
        const s = await storesApi.getAll({ offset: 0, limit: 200 });
        setStores((s.elements || []).map((x: any) => ({ id: Number(x.id), name: x.name })));
      } catch (err) {
        console.error('Error loading stores:', err);
      }
    })();
  }, []);

  useEffect(() => {
    refetch();
  }, [searchQuery, sortBy, filters, currentPage, itemsPerPage, refetch]);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortBy(`-${field}`);
    } else if (sortBy === `-${field}`) {
      setSortBy(field);
    } else {
      setSortBy(`-${field}`);
    }
    setCurrentPage(1);
  }, [sortBy]);


  const handleDelete = useCallback(async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      refetch();
    } catch (error) {
      console.error('Delete order error', error);
    }
  }, [deleteOrder, refetch]);

  const handleViewDetail = useCallback((order: any) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  }, []);

  const handleEdit = useCallback((order: any) => {
    console.log('Edit order:', order);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Compute totals robustly (used for summary fallback)
  const computeOrderTotal = (o: any): number => {
    if (!o) return 0;
    if (typeof o.finalPrice === 'number' && !Number.isNaN(o.finalPrice)) return o.finalPrice;

    const lines = Array.isArray(o.lines) ? o.lines : (Array.isArray(o.saleLines) ? o.saleLines : []);
    const linesTotal = lines.reduce((s: number, l: any) => {
      const price = Number(l.unitPrice ?? l.price ?? l.unit_price ?? l.totalPrice ?? 0);
      const qty = Number(l.qtyOrdered ?? l.qty ?? l.quantity ?? l.orderQuantity ?? 0);
      return s + (price * qty);
    }, 0);

    const shipping = Number(o.deliveryFee ?? o.shippingFee ?? o.shipping ?? 0);
    const discount = Number(o.voucherAmount ?? o.discountAmount ?? o.discount ?? 0);

    return linesTotal + shipping - discount;
  };

  const totalAllOrdersAmount = orders.reduce((sum: number, order: any) => {
    const v = (order.finalPrice ?? computeOrderTotal(order)) || 0;
    return sum + v;
  }, 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">Quản lý Đơn hàng</h1>
                <p className="mt-2 text-gray-600">Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
              </div>
              <div className="flex items-center gap-2">
              </div>
            </div>
          </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 min-w-0">
                <AutocompleteSearchBar
                  searchFields={ordersSearchFields}
                  onSearch={handleAutocompleteSearch}
                  onSubmit={handleSearchSubmit}
                  placeholder="Tìm kiếm theo mã khách hàng hoặc giá..."
                />
          </div>
              <div className="flex gap-2">
                {/* <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-300' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                  Bộ lọc
                </Button> */}
                <Button className="flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4" />
                  Tạo đơn hàng
                </Button>
              </div>
        </div>

            {/* Filters Panel */}
            {/* {showFilters && (
              <OrdersFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                paymentMethods={paymentMethods}
                stores={stores}
              />
            )} */}
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Tổng đơn hàng</div>
              <div className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Đang hiển thị</div>
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Trang hiện tại</div>
              <div className="text-2xl font-bold text-gray-900">{currentPage}/{totalPages}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Tổng giá trị</div>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAllOrdersAmount)}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <OrdersTable
            orders={orders}
            loading={loading}
            sortBy={sortBy}
            onSort={handleSort}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                loading={loading}
              />
            </div>
          )}

          {/* Order Detail Modal */}
          <OrderDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            orderId={selectedOrder?.id}
          />
        </div>

        {showCreateModal && (
          <OrderForm
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => { refetch(); setShowCreateModal(false); }}
          />
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
