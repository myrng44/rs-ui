import { useEffect, useState } from 'react';
import { Layout } from '~/components/Layout';
import { statsApi } from '~/utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function Statistics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
  const [topProductsData, setTopProductsData] = useState<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
  const [paymentMethodsData, setPaymentMethodsData] = useState<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
  const [summaryStats, setSummaryStats] = useState<Array<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease' | 'neutral'; icon: string }>>([]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

  const rangeMeta: Record<typeof timeRange, { totalDays: number; bucketDays: number; revenueTitle: string }> = {
    week: { totalDays: 7, bucketDays: 1, revenueTitle: 'Doanh thu 7 ngày gần đây' },
    month: { totalDays: 28, bucketDays: 7, revenueTitle: 'Doanh thu theo tuần (30 ngày qua)' },
    quarter: { totalDays: 90, bucketDays: 30, revenueTitle: 'Doanh thu theo tháng (3 tháng qua)' },
    year: { totalDays: 360, bucketDays: 30, revenueTitle: 'Doanh thu theo tháng (12 tháng qua)' },
  };

  const buildDescendingWindows = (total: number, bucket: number) => {
    const windows: number[] = [];
    for (let d = total; d >= bucket; d -= bucket) windows.push(d);
    return windows;
  };

  const getMonthLabelsBackwards = (count: number) => {
    const labels: string[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear() % 100}`);
    }
    return labels;
  };

  const loadData = async (range: typeof timeRange) => {
    const meta = rangeMeta[range];
    const windowsDesc = buildDescendingWindows(meta.totalDays, meta.bucketDays);

    const [revenueCum, topProducts, paymentUsage, totalCustomers] = await Promise.all([
      Promise.all(windowsDesc.map((d) => statsApi.getRevenue(d))),
      statsApi.getTopSoldProducts(range === 'week' ? 7 : range === 'month' ? 30 : range === 'quarter' ? 90 : 360, 5),
      statsApi.getPaymentMethodsUsage(range === 'week' ? 7 : range === 'month' ? 30 : range === 'quarter' ? 90 : 360),
      statsApi.getTotalCustomers(),
    ]);

    const deltas = revenueCum.map((v, i) => (i < revenueCum.length - 1 ? v - revenueCum[i + 1] : v));

    let labels: string[] = [];
    if (range === 'week') {
      labels = Array.from({ length: windowsDesc.length }, (_, i) => `Ngày ${i + 1}`);
    } else if (range === 'month') {
      labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
    } else if (range === 'quarter') {
      labels = ['Tháng 1', 'Tháng 2', 'Tháng 3'];
    } else {
      labels = getMonthLabelsBackwards(windowsDesc.length);
    }

    setRevenueData({
      labels,
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: deltas,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    });

    setTopProductsData({
      labels: topProducts.map((p) => p.name),
      datasets: [
        {
          label: 'Số lượng bán',
          data: topProducts.map((p) => p.totalQuantitySold),
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });

    setPaymentMethodsData({
      labels: paymentUsage.map((m) => m.name),
      datasets: [
        {
          data: paymentUsage.map((m) => m.usage),
          backgroundColor: [
            'rgba(236, 72, 153, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderColor: [
            'rgba(236, 72, 153, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 2,
        },
      ],
    });

    const totalRevenue = revenueCum[0] || 0;
    const bestProduct = topProducts[0];
    const topPayment = paymentUsage.reduce((max, cur) => (cur.usage > max.usage ? cur : max), paymentUsage[0] || { name: '', usage: 0 });

    setSummaryStats([
      {
        title: `${rangeMeta[range].revenueTitle}`,
        value: formatPrice(totalRevenue),
        change: '',
        changeType: 'neutral',
        icon: '💰',
      },
      {
        title: 'Sản phẩm bán chạy nhất',
        value: bestProduct ? bestProduct.name : 'Không có dữ liệu',
        change: bestProduct ? `${formatNumber(bestProduct.totalQuantitySold)} sản phẩm` : '',
        changeType: 'neutral',
        icon: '⭐',
      },
      {
        title: 'Khách hàng mới (tổng)',
        value: formatNumber(totalCustomers || 0),
        change: '',
        changeType: 'neutral',
        icon: '👥',
      },
      {
        title: 'PT thanh toán phổ biến',
        value: topPayment?.name || '—',
        change: topPayment ? `${formatNumber(topPayment.usage)} lần` : '',
        changeType: 'neutral',
        icon: '💳',
      },
    ]);
  };

  useEffect(() => {
    loadData(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Thống kê</h1>
            <p className='text-gray-600'>Theo dõi hiệu quả kinh doanh và xu hướng</p>
          </div>
          <div className='flex space-x-2'>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='week'>7 ngày qua</option>
              <option value='month'>30 ngày qua</option>
              <option value='quarter'>3 tháng qua</option>
              <option value='year'>12 tháng qua</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {summaryStats.map((stat, index) => (
            <div key={index} className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>{stat.title}</p>
                  <p className='text-2xl font-bold text-gray-900 mt-1'>{stat.value}</p>
                </div>
                <div className='text-2xl'>{stat.icon}</div>
              </div>
              <div className='mt-2'>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'increase'
                      ? 'text-green-600'
                      : stat.changeType === 'decrease'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Revenue Chart */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Doanh thu</h3>
            <Line data={revenueData} options={chartOptions} />
          </div>

          {/* Top Products Chart */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Top sản phẩm bán chạy</h3>
            <Bar data={topProductsData} options={chartOptions} />
          </div>

          {/* Payment Methods Chart */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Phương thức thanh toán</h3>
            <div className='flex justify-center'>
              <div className='w-80 h-80'>
                <Pie data={paymentMethodsData} options={pieChartOptions} />
              </div>
            </div>
          </div>

        </div>

        {/* Additional Stats Table */}
        <div className='bg-white rounded-lg shadow'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>Chi tiết thống kê</h3>
          </div>
          <div className='p-6'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Chỉ số
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Hôm nay
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Hôm qua
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Thay đổi
                  </th>
                </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    Doanh thu
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>1.500.000 ₫</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>1.200.000 ₫</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600'>+25%</td>
                </tr>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    Đơn hàng
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>45</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>38</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600'>+18%</td>
                </tr>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    Khách hàng mới
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>12</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>8</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600'>+50%</td>
                </tr>
                <tr>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    Giá trị đơn hàng TB
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>333.333 ₫</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>315.789 ₫</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600'>+5.6%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
