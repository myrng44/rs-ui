import { useState, useEffect } from 'react';
import { Layout } from '~/components/Layout';
import {dashboardApi, ordersApi} from '~/utils/api';

interface DashboardSummary {
  totalProducts: number;
  todayOrders: number;
  monthlyRevenue: number;
  totalCustomer: number;
}

interface TopProduct {
  id: string;
  name: string;
  unitPrice: number;
}

interface RecentOrder {
  id: string;
  customerId: string;
  customerName: string;
  storeId: number;
  voucherCode: string | null;
  finalPrice: number;
  note: string | null;
  paymentMethodName: string;
}


export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrder, setRecentOrder] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(7);
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);
  const [topProductsError, setTopProductsError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, recentOrderData, productsData] = await Promise.all([
        dashboardApi.getSummary(),
        ordersApi.getAll({
          offset: 0,
          limit: 4,
          sort: '-createdTime',
        }),
        dashboardApi.getTopProducts(7, 4),
      ]);

      setSummary(summaryData);
      setRecentOrder(recentOrderData.elements);
      setTopProducts(
        productsData.map((product) => ({
          id: product.id,
          name: product.name,
          unitPrice: product.unitPrice,
        })),
      );
      setError('');
    } catch (err: any) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopProducts = async (days: number) => {
    try {
      setLoadingTopProducts(true);
      setTopProductsError('');
      console.log(`Loading top products for ${days} days...`);

      try {
        // Try to get top products from the specific endpoint
        const productsData = await dashboardApi.getTopProducts(days, 4);
        console.log('Top products response:', productsData);

        if (Array.isArray(productsData)) {
          setTopProducts(
            productsData.map((product) => ({
              id: product.id,
              name: product.name,
              unitPrice: product.unitPrice,
            })),
          );
        } else {
          console.warn('Top products data is not an array:', productsData);
          setTopProducts([]);
        }
      } catch (topProductsErr: any) {
        console.warn('Top products API failed, falling back to regular products:', topProductsErr);

        // Fallback: Get regular products as top products
        try {
          const { productsApi } = await import('~/utils/api');
          const fallbackData = await productsApi.getAll({ limit: 4, sort: '-createdTime' });

          setTopProducts(
            fallbackData.elements.slice(0, 4).map((product) => ({
              id: product.id,
              name: product.name,
              unitPrice: product.unitPrice,
            })),
          );
          setTopProductsError('API sản phẩm bán chạy không khả dụng, hiển thị sản phẩm mới nhất');
        } catch (fallbackErr: any) {
          throw fallbackErr; // Re-throw to be handled by outer catch
        }
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
      setTopProducts([]);
      setTopProductsError(`Lỗi tải dữ liệu sản phẩm: ${err.message || 'Không thể kết nối API'}`);
    } finally {
      setLoadingTopProducts(false);
    }
  };

  const handleDaysChange = async (days: number) => {
    setSelectedDays(days);
    await loadTopProducts(days);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getStatsData = () => {
    if (!summary) return [];

    return [
      { label: 'Tổng sản phẩm', value: formatNumber(summary.totalProducts), icon: '📦' },
      { label: 'Đơn hàng hôm nay', value: formatNumber(summary.todayOrders), icon: '🛒' },
      { label: 'Doanh thu tháng', value: formatPrice(summary.monthlyRevenue), icon: '💰' },
      { label: 'Tổng khách hàng', value: formatNumber(summary.totalCustomer), icon: '👥' },
    ];
  };

  return (
    <Layout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600'>Tổng quan kinh doanh và thống kê</p>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
                <div className='animate-pulse'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                  <div className='h-8 bg-gray-200 rounded w-1/2 mb-1'></div>
                </div>
              </div>
            ))
            : getStatsData().map((stat, index) => (
              <div key={index} className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>{stat.label}</p>
                    <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                  </div>
                  <div className='text-3xl'>{stat.icon}</div>
                </div>
              </div>
            ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Recent Orders */}
          <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
            <div className="space-y-3">
              {recentOrder.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customerId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.finalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold'>Sản phẩm bán chạy</h2>
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-600'>Trong:</span>
                <div className='flex space-x-1'>
                  {[1, 3, 7, 15, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => handleDaysChange(days)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                        selectedDays === days
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      disabled={loadingTopProducts}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {topProductsError && (
              <div className='text-sm text-red-600 bg-red-50 p-2 rounded-md mb-3'>
                {topProductsError}
              </div>
            )}
            <div className='space-y-3'>
              {loading || loadingTopProducts ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='animate-pulse flex-1'>
                      <div className='h-4 bg-gray-200 rounded w-3/4 mb-1'></div>
                      <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    </div>
                    <div className='animate-pulse'>
                      <div className='h-4 bg-gray-200 rounded w-20'></div>
                    </div>
                  </div>
                ))
              ) : topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div>
                      <p className='font-medium text-gray-900'>{product.name}</p>
                      <p className='text-sm text-gray-600'>Top #{index + 1}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-gray-900'>{formatPrice(product.unitPrice)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center p-4 text-gray-600'>
                  {selectedDays ? `Không có dữ liệu sản phẩm bán chạy trong ${selectedDays} ngày gần đây` : 'Không có dữ liệu sản phẩm'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
