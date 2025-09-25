import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from '~/components/Layout';
import { dashboardApi } from '~/utils/api';
import { storesApi } from '~/utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TopProduct {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  unitPrice: number;
  categoryId?: number | string;
  totalQuantitySold: number;
}

interface StoreRevenue {
  storeId: string | number;
  storeName: string;
  series: { date: string; revenue: number }[];
}

export default function StatisticsTopProducts() {
  const [selectedDays, setSelectedDays] = useState<number>(30);

  // Top products states
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [metric, setMetric] = useState<'quantity' | 'revenue'>('quantity');
  const chartRefTop = useRef<any>(null);

  // Stores revenue states
  const [stores, setStores] = useState<StoreRevenue[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [errorStores, setErrorStores] = useState<string | null>(null);
  const chartRefStores = useRef<any>(null);

  const formatNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
  const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  // truncate for visual labels (keeps full name in labelsFull for tooltip)
  const truncate = (s: string | undefined | null, n = 36) =>
    s && s.length > n ? s.slice(0, n - 1) + '…' : s ?? 'Không tên';

  // Load top products
  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true);
      setErrorProducts(null);
      try {
        const resp = await dashboardApi.getTopProducts(selectedDays, 10);
        if (!Array.isArray(resp)) {
          setTopProducts([]);
          setErrorProducts('Dữ liệu sản phẩm không hợp lệ');
        } else {
          const mapped: TopProduct[] = resp.map((p: any) => ({
            id: String(p.id ?? p.sku ?? Math.random()),
            sku: p.sku,
            name: p.name ?? p.productName ?? 'Không tên',
            description: p.description,
            unitPrice: Number(p.unitPrice ?? 0),
            categoryId: p.categoryId,
            totalQuantitySold: Number(p.totalQuantitySold ?? p.total_sold ?? 0),
          }));

          const filtered = mapped.filter((m) => Number.isFinite(m.totalQuantitySold) && m.totalQuantitySold > 0);

          setTopProducts(filtered);
        }
      } catch (err: any) {
        console.error('loadTopProducts error', err);
        setTopProducts([]);
        setErrorProducts(err?.message ?? 'Lỗi tải dữ liệu');
      } finally {
        setLoadingProducts(false);
      }
    };

    load();
  }, [selectedDays]);

  // Load stores revenue series
  useEffect(() => {
    const loadStores = async () => {
      setLoadingStores(true);
      setErrorStores(null);
      try {
        const resp = await storesApi.getAllStoresRevenueSeries(selectedDays);
        if (!resp || !Array.isArray(resp.stores)) {
          setStores([]);
          setErrorStores('Dữ liệu doanh thu cửa hàng không hợp lệ');
        } else {
          const mapped: StoreRevenue[] = resp.stores.map((s: any) => ({
            storeId: s.storeId,
            storeName: s.storeName ?? `Store ${s.storeId}`,
            series: Array.isArray(s.series)
              ? s.series.map((p: any) => ({ date: String(p.date), revenue: Number(p.revenue ?? 0) }))
              : [],
          }));
          setStores(mapped);
        }
      } catch (err: any) {
        console.error('loadStoresRevenue error', err);
        setStores([]);
        setErrorStores(err?.message ?? 'Lỗi tải dữ liệu doanh thu cửa hàng');
      } finally {
        setLoadingStores(false);
      }
    };

    loadStores();
  }, [selectedDays]);

  // Chart data for top products (use truncated labels visually, tooltip uses labelsFull)
  const chartDataTop = useMemo(() => {
    const arr = topProducts
      .slice()
      .sort((a, b) => {
        const va = metric === 'quantity' ? a.totalQuantitySold : a.totalQuantitySold * a.unitPrice;
        const vb = metric === 'quantity' ? b.totalQuantitySold : b.totalQuantitySold * b.unitPrice;
        return vb - va;
      })
      .slice(0, 8);

    const labelsFull = arr.map((p) => p.name);
    const labelsShort = labelsFull.map((s) => truncate(s, 36));
    const data = arr.map((p) => (metric === 'quantity' ? p.totalQuantitySold : Math.round(p.totalQuantitySold * p.unitPrice)));

    return {
      labels: labelsShort,
      labelsFull,
      datasets: [
        {
          label: metric === 'quantity' ? 'Số lượng bán' : 'Doanh thu (VND)',
          data,
          backgroundColor: ['rgba(59,130,246,0.85)', 'rgba(34,197,94,0.85)', 'rgba(245,158,11,0.85)', 'rgba(168,85,247,0.85)', 'rgba(239,68,68,0.85)'],
          borderColor: ['rgba(59,130,246,1)', 'rgba(34,197,94,1)', 'rgba(245,158,11,1)', 'rgba(168,85,247,1)', 'rgba(239,68,68,1)'],
          borderWidth: 1,
        },
      ],
    };
  }, [topProducts, metric]);

  const chartOptionsTop = useMemo(() => {
    return {
      indexAxis: 'y' as const,
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // show full name in tooltip title
            title: (ctx: any[]) => (chartDataTop.labelsFull?.[ctx?.[0]?.dataIndex] ?? ctx?.[0]?.label ?? ''),
            label: (ctx: any) => {
              const v = ctx.parsed?.x ?? ctx.raw;
              return metric === 'quantity' ? `${formatNumber(Number(v))} sp` : formatPrice(Number(v));
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (val: any) => (metric === 'quantity' ? formatNumber(Number(val)) : formatPrice(Number(val))),
          },
        },
        y: { ticks: { autoSkip: false } },
      },
      maintainAspectRatio: false,
    };
  }, [chartDataTop, metric]);

  // Chart data for stores revenue (aggregate over series -> sum), truncated labels visually, tooltip full
  const chartDataStores = useMemo(() => {
    if (!stores || stores.length === 0) return { labels: [], labelsFull: [], datasets: [] };

    const arr = stores
      .map((s) => {
        const total = (s.series || []).reduce((acc, p) => acc + (Number(p.revenue) || 0), 0);
        return { storeId: s.storeId, storeName: s.storeName, total };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // show top 8 stores

    const labelsFull = arr.map((a) => a.storeName);
    const labelsShort = labelsFull.map((s) => truncate(s, 36));
    const data = arr.map((a) => Math.round(a.total));

    const backgroundPalette = [
      'rgba(59,130,246,0.85)',
      'rgba(34,197,94,0.85)',
      'rgba(245,158,11,0.85)',
      'rgba(168,85,247,0.85)',
      'rgba(239,68,68,0.85)',
      'rgba(6,182,212,0.85)',
      'rgba(99,102,241,0.85)',
      'rgba(16,185,129,0.85)',
    ];

    const borderPalette = backgroundPalette.map((c) => c.replace(/0\.85/, '1'));

    return {
      labels: labelsShort,
      labelsFull,
      datasets: [
        {
          label: `Tổng doanh thu trong ${selectedDays} ngày (VND)`,
          data,
          backgroundColor: backgroundPalette.slice(0, data.length),
          borderColor: borderPalette.slice(0, data.length),
          borderWidth: 1,
        },
      ],
    };
  }, [stores, selectedDays]);

  const chartOptionsStores = useMemo(() => {
    return {
      indexAxis: 'y' as const,
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (ctx: any[]) => (chartDataStores.labelsFull?.[ctx?.[0]?.dataIndex] ?? ctx?.[0]?.label ?? ''),
            label: (ctx: any) => {
              const v = ctx.parsed?.x ?? ctx.raw;
              return formatPrice(Number(v));
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (val: any) => formatPrice(Number(val)),
          },
        },
        y: { ticks: { autoSkip: false } },
      },
      maintainAspectRatio: false,
    };
  }, [chartDataStores]);

  // Export functions
  const exportCSVTop = () => {
    const header = ['id', 'sku', 'name', 'unitPrice', 'totalQuantitySold'];
    const rows = topProducts.map((p) => [p.id, p.sku ?? '', p.name, String(p.unitPrice), String(p.totalQuantitySold)]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `top_products_${selectedDays}d.csv`);
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNGTop = () => {
    try {
      const url = chartRefTop.current?.toBase64Image();
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.download = `top_products_${selectedDays}d.png`;
      a.click();
    } catch (e) {
      console.error('Export PNG failed', e);
    }
  };

  const exportCSVStores = () => {
    const header = ['storeId', 'storeName', 'totalRevenue'];
    const arr = stores
      .map(s => ({ storeId: s.storeId, storeName: s.storeName, total: (s.series || []).reduce((acc, p) => acc + (Number(p.revenue) || 0), 0) }))
      .sort((a,b) => b.total - a.total);
    const rows = arr.map((p) => [String(p.storeId), p.storeName, String(Math.round(p.total))]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `stores_revenue_${selectedDays}d.csv`);
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNGStores = () => {
    try {
      const url = chartRefStores.current?.toBase64Image();
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.download = `stores_revenue_${selectedDays}d.png`;
      a.click();
    } catch (e) {
      console.error('Export PNG failed', e);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Top sản phẩm bán chạy</h1>
          <p className="text-gray-600">Top sản phẩm bán chạy theo khoảng thời gian</p>
        </header>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Trong:</span>
          <div className="flex space-x-1">
            {[1, 3, 7, 15, 30].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDays(d)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${selectedDays === d ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                disabled={loadingProducts || loadingStores}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="inline-flex rounded-md bg-gray-100 p-1">
                <button className={`px-3 py-1 text-sm rounded-md font-medium ${metric === 'quantity' ? 'bg-primary text-white' : 'text-gray-600'}`} onClick={() => setMetric('quantity')}>
                  Số lượng
                </button>
                <button className={`px-3 py-1 text-sm rounded-md font-medium ${metric === 'revenue' ? 'bg-primary text-white' : 'text-gray-600'}`} onClick={() => setMetric('revenue')}>
                  Doanh thu
                </button>
              </div>

              <button onClick={exportCSVTop} className="px-3 py-1 text-sm rounded bg-gray-100">Export CSV</button>
              <button onClick={exportPNGTop} className="px-3 py-1 text-sm rounded bg-gray-100">Export PNG</button>
            </div>
          </div>

          {errorProducts && <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-3">{errorProducts}</div>}

          <div style={{ width: '100%', height: 420 }}>
            {loadingProducts ? (
              <div className="flex items-center justify-center h-full">Đang tải...</div>
            ) : topProducts.length === 0 ? (
              <div className="text-center text-gray-500 p-8">Không có dữ liệu</div>
            ) : (
              <Bar ref={chartRefTop} data={chartDataTop} options={chartOptionsTop as any} />
            )}
          </div>
        </div>

        {/* --- Stores revenue --- */}
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Doanh thu các cửa hàng</h1>
          <p className="text-gray-600">Doanh thu các cửa hàng theo khoảng thời gian</p>
        </header>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button onClick={exportCSVStores} className="px-3 py-1 text-sm rounded bg-gray-100">Export CSV</button>
              <button onClick={exportPNGStores} className="px-3 py-1 text-sm rounded bg-gray-100">Export PNG</button>
            </div>
          </div>

          {errorStores && <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-3">{errorStores}</div>}

          <div style={{ width: '100%', height: 420 }}>
            {loadingStores ? (
              <div className="flex items-center justify-center h-full">Đang tải...</div>
            ) : stores.length === 0 ? (
              <div className="text-center text-gray-500 p-8">Không có dữ liệu doanh thu cửa hàng</div>
            ) : (
              <Bar ref={chartRefStores} data={chartDataStores} options={chartOptionsStores as any} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
