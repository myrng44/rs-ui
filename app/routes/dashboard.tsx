import { useState, useEffect } from 'react';
import { Layout } from '~/components/Layout';
import {dashboardApi, ordersApi} from '~/utils/api';
import { Button } from '~/components/Button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
  totalQuantitySold: number;
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
  const [totalProducts, setTotalProducts] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrder, setRecentOrder] = useState<RecentOrder[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
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
      const [totalProductsCount, recentOrderData, productsData, revenue30d, customersCount] = await Promise.all([
        dashboardApi.getTotalProducts(),
        ordersApi.getAll({
          offset: 0,
          limit: 5,
          sort: '-createdTime',
        }),
        dashboardApi.getTopSoldProducts(7, 5),
        dashboardApi.getRevenue(30),
        dashboardApi.getTotalCustomers(),
      ]);

      setTotalProducts(totalProductsCount);
      setMonthlyRevenue(revenue30d || 0);
      setTotalCustomers(customersCount || 0);
      setRecentOrder(recentOrderData.elements);
      setTopProducts(
        productsData.map((product) => ({
          id: product.id,
          name: product.name,
          unitPrice: product.unitPrice,
          totalQuantitySold: product.totalQuantitySold,
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
        const productsData = await dashboardApi.getTopSoldProducts(days, 5);
        console.log('Top products response:', productsData);

        if (Array.isArray(productsData)) {
          setTopProducts(
            productsData.map((product) => ({
              id: product.id,
              name: product.name,
              unitPrice: product.unitPrice,
              totalQuantitySold: product.totalQuantitySold,
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
              totalQuantitySold: -1
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
    if (!totalProducts) return [
      { label: 'Tổng sản phẩm', value: '0', icon: '📦' },
      { label: 'Đơn hàng gần đây', value: '0', icon: '🛒' },
      { label: 'Doanh thu 30 ngày', value: formatPrice(0), icon: '💰' },
      { label: 'Tổng khách hàng', value: '0', icon: '👥' },
    ];

    return [
      { label: 'Tổng sản phẩm', value: formatNumber(totalProducts), icon: '📦' },
      { label: 'Đơn hàng gần đây', value: formatNumber(recentOrder.length), icon: '🛒' },
      { label: 'Doanh thu 30 ngày', value: formatPrice(monthlyRevenue), icon: '💰' },
      { label: 'Tổng khách hàng', value: formatNumber(totalCustomers), icon: '👥' },
    ];
  };

  return (
    <Layout>
      <div className='space-y-6'>
        {/* Welcome banner */}
        <div className='bg-primary text-on-primary rounded-lg p-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Welcome back,</h1>
            <p className='text-sm opacity-90'>Here's what's happening with your business today.</p>
          </div>
          <div className='hidden md:block'>
            <img src='https://cdn.builder.io/api/v1/image/assets%2Fa95229d538724ac58b981fb98658d932%2F4da9dbf134104ca5bbbe5666e4188102?format=webp&width=400' alt='welcome' className='w-40 h-20 object-cover rounded' />
          </div>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        {/* Top stat cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='bg-surface p-4 rounded-lg shadow-sm border border-gray-200'>
                <div className='animate-pulse'>
                  <div className='h-4 bg-gray-200 rounded w-1/3 mb-2'></div>
                  <div className='h-8 bg-gray-200 rounded w-2/3'></div>
                </div>
              </div>
            ))
            : getStatsData().map((stat, idx) => (
              <div key={idx} className='bg-surface p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>{stat.label}</p>
                  <p className='text-xl font-bold text-gray-900 mt-1'>{stat.value}</p>
                </div>
                <div className='text-2xl'>{stat.icon}</div>
              </div>
            ))}
        </div>

        {/* Quick actions */}
        <div className='bg-surface p-4 rounded-lg border border-gray-200'>
          <h2 className='text-lg font-semibold mb-3'>Quick Actions</h2>
          <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3'>
            <Button variant='primary' size='md' className='w-full' icon={<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 5v14'/><path d='M5 12h14'/></svg>}>Create Invoice</Button>
            <Button variant='primary' size='md' className='w-full' icon={<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><rect x='3' y='4' width='18' height='18' rx='2'/><path d='M8 2v4'/></svg>}>View Invoices</Button>
            <Button variant='primary' size='md' className='w-full' icon={<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>}>Add Client</Button>
            <Button variant='primary' size='md' className='w-full' icon={<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M22 2L11 13'/><path d='M22 2l-7 20 2-7 7-13z'/></svg>}>Send Reminders</Button>
            <Button variant='primary' size='md' className='w-full' icon={<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='7 10 12 15 17 10'/><line x1='12' y1='15' x2='12' y2='3'/></svg>}>Export Data</Button>
            <Button variant='primary' size='md' className='w-full' icon={<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 3v18h18'/><path d='M7 13l4-4 4 4'/></svg>}>View Reports</Button>
          </div>
        </div>

        {/* Main content: chart + notifications */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 bg-surface p-4 rounded-lg border border-gray-200'>
            <h3 className='text-lg font-semibold mb-3'>Revenue Overview</h3>
            <div className='h-64 rounded bg-white/5 p-2'>
              <Line
                data={{
                  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                  datasets: [
                    {
                      label: 'Revenue',
                      data: [12000,15000,14000,18000,17000,22000,21000,25000,23000,27000,26000,30000],
                      borderColor: 'var(--color-primary)',
                      backgroundColor: 'rgba(7,122,125,0.15)',
                      tension: 0.3,
                      fill: true,
                      pointRadius: 3,
                    },
                    {
                      label: 'Invoices',
                      data: [2,3,2,4,3,5,4,6,5,6,5,7],
                      borderColor: '#22c55e',
                      backgroundColor: 'rgba(34,197,94,0.15)',
                      tension: 0.3,
                      fill: false,
                      pointRadius: 2,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            </div>

            <div className='mt-6'>
              <h4 className='font-semibold mb-2'>Recent Activity</h4>
              <div className='space-y-2'>
                {recentOrder.slice(0,4).map((order) => (
                  <div key={order.id} className='p-3 bg-white/50 rounded flex items-center justify-between'>
                    <div>
                      <div className='font-medium text-gray-900'>{order.id}</div>
                      <div className='text-sm text-gray-600'>{order.customerName || order.customerId}</div>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>{formatPrice(order.finalPrice)}</div>
                      <div className='text-sm text-gray-500'>Order</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='bg-surface p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-lg font-semibold'>Notifications</h3>
              <Button variant='primary' size='sm'>Mark All Read</Button>
            </div>
            <div className='space-y-3'>
              <div className='p-3 bg-white/50 rounded'>
                <div className='font-medium'>Overdue Invoices</div>
                <div className='text-sm text-gray-600'>3 invoices are overdue and require attention</div>
              </div>
              <div className='p-3 bg-white/50 rounded'>
                <div className='font-medium'>Payment Received</div>
                <div className='text-sm text-gray-600'>Invoice #INV-2024-001 has been paid</div>
              </div>
              <div className='p-3 bg-white/50 rounded'>
                <div className='font-medium'>Monthly Report Ready</div>
                <div className='text-sm text-gray-600'>Your November financial report is ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}