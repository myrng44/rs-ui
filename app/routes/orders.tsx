import { useState, useEffect } from 'react';
import { Layout } from '~/components/Layout';
import { DataTable } from '~/components/DataTable';
import { Pagination } from '~/components/Pagination';
import { OrderDetailsModal } from '~/components/OrderDetailsModal';
import { ordersApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { FilterPanel } from '~/components/FilterPanel';

interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  storeId: number;
  voucherCode: string | null;
  finalPrice: number;
  note: string | null;
  paymentMethodName: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage] = useState(10);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-createdTime');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildFilterQuery = () => {
    const parts: string[] = [];
    if (searchQuery) {
      // Check if it looks like an ID for exact search
      const looksLikeId = searchQuery.length > 10 && /[0-9a-fA-F\-]{8,}/.test(searchQuery);
      parts.push(looksLikeId ? `id:${searchQuery}` : `customerName~${searchQuery}`);
    }
    return parts.join(' AND ');
  };

  const loadOrders = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const query = buildFilterQuery();

      // If search looks like an ID, try getById first
      if (searchQuery && searchQuery.length > 10 && /[0-9a-fA-F\-]{8,}/.test(searchQuery)) {
        try {
          const order = await ordersApi.getById(searchQuery);
          setOrders([order]);
          setTotalElements(1);
          setError('');
          return;
        } catch (err) {
          console.warn('getById failed, falling back to list search', err);
        }
      }

      const offset = (page - 1) * itemsPerPage;
      const response = await ordersApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: sortBy,
        query,
      });
      setOrders(response.elements);
      setTotalElements(response.totalElements);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách đơn hàng');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = [
    {
      key: 'search',
      label: 'Tìm kiếm',
      type: 'search' as const,
      value: searchQuery,
      placeholder: 'Tìm theo mã đơn hàng, tên khách hàng...',
    },
    {
      key: 'dateRange',
      label: 'Khoảng thời gian',
      type: 'date' as const,
      value: dateRange,
    },
  ];

  const handleFilterChange = (key: string, value: any) => {
    switch (key) {
      case 'search':
        setSearchQuery(value);
        break;
      case 'dateRange':
        setDateRange(value);
        break;
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadOrders(1);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateRange({ from: '', to: '' });
    setSortBy('-createdTime');
    setCurrentPage(1);
    loadOrders(1);
  };

  const activeFiltersCount = [
    searchQuery,
    dateRange.from && dateRange.to,
  ].filter(Boolean).length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadOrders(page);
  };

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailsModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Đơn hàng</h1>
            <p className='text-gray-600'>Xem danh sách và chi tiết đơn hàng</p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Quick search */}
            <div className='relative'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder='Tìm đơn hàng...'
                className='w-64 px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              />
              <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value='-createdTime'>Mới nhất</option>
              <option value='+createdTime'>Cũ nhất</option>
              <option value='-finalPrice'>Giá trị cao</option>
              <option value='+finalPrice'>Giá trị thấp</option>
            </select>

            {/* Filter button */}
            <Button
              variant='outline'
              onClick={() => setIsFilterOpen(true)}
              disabled={loading}
              className='relative'
            >
              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z' />
              </svg>
              Bộ lọc
              {activeFiltersCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-primary text-on-primary text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            <Button variant='outline'>
              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
              Xuất Excel
            </Button>

            <Button className='btn-gradient'>
              + Tạo đơn hàng
            </Button>
          </div>
        </div>

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className='bg-white p-4 rounded-lg border border-gray-200 flex items-center flex-wrap gap-2'>
            <span className='text-sm text-gray-600 mr-2'>Bộ lọc đang áp dụng:</span>
            {searchQuery && (
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200'>
                Tìm kiếm: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className='ml-1 text-blue-500 hover:text-blue-700'>×</button>
              </span>
            )}
            {(dateRange.from && dateRange.to) && (
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200'>
                Từ {new Date(dateRange.from).toLocaleDateString('vi-VN')} đến {new Date(dateRange.to).toLocaleDateString('vi-VN')}
                <button onClick={() => setDateRange({ from: '', to: '' })} className='ml-1 text-green-500 hover:text-green-700'>×</button>
              </span>
            )}
            <button onClick={clearFilters} className='ml-auto text-sm text-primary hover:underline font-medium'>
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        <DataTable
          data={orders}
          columns={[
            { key: 'id', label: 'Mã đơn', render: (value) => <span className='text-gray-900 font-medium text-sm'>{value}</span> },
            { key: 'customerId', label: 'Mã Khách hàng', render: (value) => <span className='text-gray-900'>{value}</span> },
            { key: 'customerName', label: 'Tên khách hàng', render: (value) => <span className='text-gray-900'>{value}</span> },
            { key: 'voucherCode', label: 'Voucher', render: (value) => <span className='text-gray-600'>{value || 'Không có'}</span> },
            { key: 'paymentMethodName', label: 'Thanh toán', render: (value) => <span className='text-gray-900'>{value}</span> },
            { key: 'note', label: 'Ghi chú', render: (value) => <span className='text-gray-600 max-w-xs truncate block'>{value}</span> },
            { key: 'finalPrice', label: 'Tổng tiền', render: (value) => <span className='text-gray-900 font-medium'>{formatPrice(value)}</span> },
            {
              key: 'actions',
              label: '',
              render: (_: any, order: Order) => (
                <button
                  onClick={() => handleViewDetails(order.id)}
                  aria-label={`Xem chi tiết đơn ${order.id}`}
                  className='text-primary hover:text-primary-dark p-2 rounded-full'
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                    <circle cx='12' cy='12' r='3' />
                  </svg>
                </button>
              ),
            },
          ]}
          loading={loading}
          emptyMessage='Chưa có đơn hàng nào'
        />

        {/* Filter Panel */}
        <FilterPanel
          filters={filterGroups}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          activeFiltersCount={activeFiltersCount}
        />

        {!loading && orders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalElements / itemsPerPage)}
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      </div>
    </Layout>
  );
}