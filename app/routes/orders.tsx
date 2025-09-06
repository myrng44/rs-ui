import React, { useState, useCallback, useEffect } from 'react';
import { Search, Plus, Filter, Package, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { Pagination } from '../components/Pagination';
import OrdersTable from '../components/orders/OrdersTable';
import OrdersFilters from '../components/orders/OrdersFilters';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { useOrders } from '../hooks/userOrders';
import { ordersApi, paymentMethodApi } from '../utils/api';
import { Layout } from '~/components/Layout';
import OrderForm from '../components/orders/OrderForm';
import { AutocompleteSearchBar, type SearchField, type SearchResult } from "~/components/AutoCompleteSearchBar";


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
  const [sortBy, setSortBy] = useState('');
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
  const [stores] = useState([
    { id: 1, name: 'Cửa hàng Chính' },
    { id: 2, name: 'Chi nhánh Quận 1' },
    { id: 3, name: 'Chi nhánh Quận 3' }
  ]); // You can fetch from API if needed

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
      { value: "name", label: "Khách hàng", type: "text", operator: "~" }
    ];

        const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
          try {
            return (await ordersApi.search(query)) as any;
          } catch (err) {
            console.error("Autocomplete search error:", err);
            return [];
          }
        };

  // Load payment methods for filters
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await paymentMethodApi.getAll();
        setPaymentMethods(response.elements);
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    };
    loadPaymentMethods();
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  }, [searchQuery, refetch]);

  const handleSort = useCallback((field: string) => {
    const newSort = sortBy === field ? `-${field}` : field;
    setSortBy(newSort);
    setCurrentPage(1);
  }, [sortBy]);

  const handleDelete = useCallback(async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      // Success message could be shown here
    } catch (error) {
      // Error handling
      // alert(error.message || 'Có lỗi xảy ra khi xóa đơn hàng');
    }
  }, [deleteOrder]);

  const handleViewDetail = useCallback((order: any) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  }, []);

  const handleEdit = useCallback((order: any) => {
    // Navigate to edit page or open edit modal
    console.log('Edit order:', order);
    // You can implement this based on your routing
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Quản lý Đơn hàng
              </h1>
              <p className="mt-2 text-gray-600">
                Quản lý và theo dõi tất cả đơn hàng trong hệ thống
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </div>
        </div>

                {/* <AutocompleteSearchBar
                  searchFields={ordersSearchFields}
                  onSearch={handleAutocompleteSearch}
                  placeholder="Tìm kiếm sản phẩm..."
                /> */}
        

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khách hàng, mã đơn..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  Tìm kiếm
                </Button>
              </form>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-300' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Bộ lọc
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setShowCreateModal(true)}  
              >
                <Plus className="h-4 w-4" />
                Tạo đơn hàng
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <OrdersFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              paymentMethods={paymentMethods}
              stores={stores}
            />
          )}
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
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(orders.reduce((sum, order) => sum + order.finalPrice, 0))}
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
              onPageChange={setCurrentPage}
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
      onSuccess={refetch}
     />
    )}
    </div>
    </Layout>
  );
};

export default OrdersPage;