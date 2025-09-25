import { useState, useEffect, useRef } from 'react';
import { Layout } from '~/components/Layout';
import { dashboardApi, ordersApi } from '~/utils/api';
import { storesApi } from '~/utils/api';

interface DashboardSummary {
  totalProducts: number;
  todayOrders: number;
  monthlyRevenue: number;
  totalCustomer: number;
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

interface TopStore {
  storeId: string | number;
  storeName: string;
  revenueToday: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [topStoresToday, setTopStoresToday] = useState<TopStore[]>([]);
  const [loadingTopStores, setLoadingTopStores] = useState(false);
  const [topStoresError, setTopStoresError] = useState('');

  const requestCounterRef = useRef(0);

  useEffect(() => {
    requestCounterRef.current++;

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

        await loadTopStoresToday();
      } catch (err: any) {
        console.error('Error loading dashboard data', err);
        setError(err?.message || 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      requestCounterRef.current++;
    };
  }, []);

  const loadTopStoresToday = async () => {
    const requestId = ++requestCounterRef.current;
    try {
      setLoadingTopStores(true);
      setTopStoresError('');
      setTopStoresToday([]);

      const resp = await storesApi.getAllStoresRevenueSeries(1);

      console.debug('storesApi.getAllStoresRevenueSeries resp:', resp);

      if (requestId !== requestCounterRef.current) return;

      if (!resp || !Array.isArray(resp.stores)) {
        if (requestId !== requestCounterRef.current) return;
        setTopStoresToday([]);
        setTopStoresError('Dữ liệu doanh thu cửa hàng không hợp lệ');
        return;
      }

      // Determine day key (YYYY-MM-DD). Use resp.to if available (may be full datetime), otherwise use local date.
      const rawTo = (resp as any).to;
      const dayKey = rawTo ? String(rawTo).slice(0, 10) : new Date().toISOString().slice(0, 10);

      // Map each store entry to its revenue for that day (do NOT sum series across stores).
      // IMPORTANT: we intentionally do NOT dedupe here — we want to render every store entry the API returned.
      const storesWithRevenue = resp.stores.map((s: any, idx: number) => {
        const storeId = s.storeId ?? `unknown-${idx}`;
        const storeName = s.storeName ?? `Store ${storeId}`;
        const series = Array.isArray(s.series) ? s.series : [];

        // Try flexible date matching: compare first 10 chars (YYYY-MM-DD) to handle timestamps.
        const match = series.find((it: any) => String(it?.date ?? '').slice(0, 10) === dayKey);
        const revenueForDay = match ? Number(match.revenue) || 0 : 0;

        return { storeId, storeName, revenueToday: Math.round(revenueForDay) };
      });

      console.debug('per-store storesWithRevenue:', storesWithRevenue);

      // Sort descending by revenue so high-earning stores appear first, but keep all entries.
      const sorted = storesWithRevenue.sort((a: any, b: any) => b.revenueToday - a.revenueToday);

      if (requestId !== requestCounterRef.current) return;

      setTopStoresToday(sorted);
      if (sorted.length === 0) {
        setTopStoresError('Không có cửa hàng có doanh thu hôm nay');
      }
    } catch (err: any) {
      console.error('Error loading top stores today', err);
      if (requestId !== requestCounterRef.current) return;
      setTopStoresToday([]);
      setTopStoresError(err?.message || 'Lỗi tải dữ liệu doanh thu cửa hàng');
    } finally {
      if (requestId === requestCounterRef.current) {
        setLoadingTopStores(false);
      }
    }
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>

            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName || `Khách #${order.customerId}`}</p>
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

          {/* All Stores Revenue Today */}
          <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Doanh thu hôm nay của các cửa hàng</h2>
            </div>

            {topStoresError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md mb-3">{topStoresError}</div>}

            {/*
              Key change:
              - Wrap the list in a scrollable container with a responsive max height so the panel doesn't grow indefinitely.
              - You can tweak max-h classes (eg. max-h-60 / md:max-h-80 / lg:max-h-96) to control how tall the box is before scrolling.
            */}
            <div
              role="region"
              aria-label="Danh sách doanh thu cửa hàng hôm nay"
              className="space-y-3 max-h-60 md:max-h-80 lg:max-h-96 overflow-y-auto pr-2"
            >
              {loadingTopStores ? (
                Array.from({ length: 3 }).map((_, i) => (
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
              ) : topStoresToday.length > 0 ? (
                topStoresToday.map((store, index) => (
                  <div key={`store-${store.storeId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{store.storeName}</p>
                      <p className="text-sm text-gray-600">ID: <span className="text-xs text-gray-500">{store.storeId}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(store.revenueToday)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-600">Không có dữ liệu doanh thu hôm nay</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
