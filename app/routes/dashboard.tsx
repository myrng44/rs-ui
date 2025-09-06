import { useState, useEffect } from 'react';
import { Layout } from '~/components/Layout';
import { dashboardApi, ordersApi } from '~/utils/api';

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

// global request id để chống race-condition
let activeRequestId = 0;

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(7);
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);
  const [topProductsError, setTopProductsError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [summaryRes, recentOrdersRes] = await Promise.all([
          dashboardApi.getSummary(),
          ordersApi.getAll({ offset: 0, limit: 5, sort: '-createdTime' }),
        ]);

        setSummary(summaryRes);
        setRecentOrders((recentOrdersRes && (recentOrdersRes as any).elements) || []);

        // Tải top products cho ngày mặc định
        await loadTopProducts(selectedDays);
      } catch (err: any) {
        console.error('Error loading dashboard data', err);
        setError(err?.message || 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load top products (có dedupe + filter qty > 0 + race guard)
  const loadTopProducts = async (days: number) => {
    const requestId = ++activeRequestId;
    try {
      // reset UI ngay
      setLoadingTopProducts(true);
      setTopProductsError('');
      setTopProducts([]);

      const productsData = await dashboardApi.getTopProducts(days, 5);
      console.debug('dashboard.getTopProducts response', { requestId, days, productsData });

      // Bỏ nếu request đã cũ
      if (requestId !== activeRequestId) {
        console.debug('Discarding stale response', { requestId, activeRequestId });
        return;
      }

      if (!Array.isArray(productsData)) {
        setTopProducts([]);
        setTopProductsError('Dữ liệu sản phẩm bán chạy không hợp lệ');
        return;
      }

      // 1) map + filter qty > 0
      const mapped: TopProduct[] = productsData
        .map((p: any) => ({
          id: String(p?.id ?? ''),
          name: p?.name ?? '',
          unitPrice: Number(p?.unitPrice ?? 0),
          totalQuantitySold: Number(p?.totalQuantitySold ?? 0),
        }))
        .filter((p) => !Number.isNaN(p.totalQuantitySold) && p.totalQuantitySold > 0);

      // 2) dedupe theo id (nếu có trùng giữ phần tử có totalQuantitySold lớn nhất)
      const dedupMap = new Map<string, TopProduct>();
      for (const p of mapped) {
        const key = p.id;
        const existing = dedupMap.get(key);
        if (!existing) {
          dedupMap.set(key, p);
        } else {
          // nếu có bản ghi cũ, giữ bản có qty lớn hơn
          if (p.totalQuantitySold > existing.totalQuantitySold) {
            dedupMap.set(key, p);
          }
        }
      }
      const uniqueList = Array.from(dedupMap.values());

      // Nếu request cũ khi mapping hoàn tất -> bỏ
      if (requestId !== activeRequestId) {
        console.debug('Discarding after mapping (stale)', { requestId, activeRequestId });
        return;
      }

      setTopProducts(uniqueList);

      if (uniqueList.length === 0) {
        setTopProductsError('Không có sản phẩm bán chạy (tất cả tổng bán = 0)');
      }
    } catch (err: any) {
      console.error('Error loading top products', err);
      if (requestId !== activeRequestId) return;
      setTopProducts([]);
      setTopProductsError(err?.message || 'Lỗi tải dữ liệu sản phẩm');
    } finally {
      if (requestId === activeRequestId) {
        setLoadingTopProducts(false);
      }
    }
  };

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
    // loadTopProducts sẽ reset UI ngay ở đầu
    loadTopProducts(days);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price ?? 0));

  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(Number(num ?? 0));

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
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Tổng quan kinh doanh và thống kê</p>
        </header>

        {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                  </div>
                </div>
              ))
            : getStatsData().map((stat, idx) => (
                <div key={idx} className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="text-3xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
{/* Recent Orders (simple) */}
<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
  <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>

  <div className="space-y-3">
    {recentOrders.length > 0 ? (
      recentOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">
              {order.customerName || `Khách #${order.customerId}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Mã đơn: <span className="text-xs text-gray-400 break-words">{order.id}</span>
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-gray-900">{formatPrice(order.finalPrice)}</p>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center p-4 text-gray-600">Chưa có đơn hàng gần đây</div>
    )}
  </div>
</div>


          {/* Top Products */}
          <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Sản phẩm bán chạy</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Trong:</span>
                <div className="flex space-x-1">
                  {[1, 3, 7, 15, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDaysChange(d)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                        selectedDays === d ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      disabled={loadingTopProducts}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {topProductsError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md mb-3">{topProductsError}</div>}

            <div className="space-y-3">
              {loadingTopProducts ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="animate-pulse flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))
              ) : topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={`${selectedDays}-${product.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">Top #{index + 1}</p>
                      <p className="text-sm text-gray-600">{formatNumber(product.totalQuantitySold)} đã bán</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(product.unitPrice)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-600">{`Không có dữ liệu sản phẩm bán chạy trong ${selectedDays} ngày gần đây`}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
