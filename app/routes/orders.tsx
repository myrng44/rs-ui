import { useState, useEffect } from 'react';
import { Layout } from '~/components/Layout';
import { DataTable } from '~/components/DataTable';
import { Pagination } from '~/components/Pagination';
import { OrderDetailsModal } from '~/components/OrderDetailsModal';
import { ordersApi } from '~/utils/api';
import { Button } from '~/components/Button';

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
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadOrders(1);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchId]);

  const looksLikeId = (s: string) => s && s.length > 10 && /[0-9a-fA-F\-]{8,}/.test(s);

  const loadOrders = async (page: number = currentPage) => {
    try {
      setLoading(true);
      // if user typed a full id, call getById to return exact match
      if (searchId && looksLikeId(searchId)) {
        try {
          const order = await ordersApi.getById(searchId);
          setOrders([order]);
          setTotalElements(1);
          setError('');
          return;
        } catch (err) {
          // fall back to normal list search if getById fails
          console.warn('getById failed, falling back to list search', err);
        }
      }

      const offset = (page - 1) * itemsPerPage;
      const query = searchId ? `id~${searchId}` : undefined;
      const response = await ordersApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: '-createdTime, +finalPrice',
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
          <div className='w-full'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <input
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setCurrentPage(1);
                        loadOrders(1);
                      }
                    }}
                    placeholder='Tìm theo mã đơn hàng...'
                    aria-label='Tìm theo mã đơn hàng'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-gray-400 hover:shadow-md'
                  />

                  {searchId ? (
                    <button
                      type='button'
                      aria-label='Clear search'
                      onClick={() => setSearchId('')}
                      className='absolute right-0 top-1/2 -translate-y-1/2 mr-3 text-gray-500 hover:text-gray-700'
                    >
                      ✖
                    </button>
                  ) : (
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>🔎</span>
                  )}
                </div>
              </div>

              <div className='mt-3 sm:mt-0 flex items-center space-x-2'>
                <Button variant='primary' size='md' className=''>Export</Button>
                <Button variant='primary' size='md' className=''>Create Order</Button>
              </div>
            </div>

            <div className='mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3'>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>Status</label>
                <select className='w-full p-2 border rounded' value={''} onChange={() => {}}>
                  <option value=''>All Status</option>
                </select>
              </div>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>Priority</label>
                <select className='w-full p-2 border rounded' value={''} onChange={() => {}}>
                  <option value=''>All Priority</option>
                </select>
              </div>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>Due</label>
                <select className='w-full p-2 border rounded' value={''} onChange={() => {}}>
                  <option value=''>All Due Dates</option>
                </select>
              </div>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>&nbsp;</label>
                <div className='flex space-x-2'>
                  <Button variant='outline' size='sm' className='p-2'><svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 21l-6-6'/><circle cx='11' cy='11' r='8'/></svg></Button>
                  <Button variant='outline' size='sm' className='p-2'><svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M5 12h14'/></svg></Button>
                </div>
              </div>
            </div>
          </div>
        </div>

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