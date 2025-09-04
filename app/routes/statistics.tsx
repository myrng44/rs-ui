import { useState } from 'react';
import { Layout } from '~/components/Layout';
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
  const [timeRange, setTimeRange] = useState('month');

  // Fake data for revenue chart
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: [12000000, 19000000, 15000000, 25000000, 22000000, 30000000, 28000000, 35000000, 32000000, 40000000, 38000000, 45000000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Fake data for top products
  const topProductsData = {
    labels: ['Strongbow Blueberry', 'Mì Hảo Hảo', 'Trà Shan Tuyết', 'Sand witch', 'Product 28'],
    datasets: [
      {
        label: 'Số lượng bán',
        data: [120, 95, 80, 65, 55],
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
  };

  // Fake data for payment methods
  const paymentMethodsData = {
    labels: ['MOMO', 'CASH', 'Banking', 'Credit Card'],
    datasets: [
      {
        data: [45, 30, 15, 10],
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
  };

  // Fake data for daily orders
  const dailyOrdersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Số đơn hàng',
        data: [25, 35, 40, 30, 45, 55, 50],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

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

  // Summary stats with fake data
  const summaryStats = [
    {
      title: 'Tổng doanh thu tháng này',
      value: '45.000.000 ₫',
      change: '+12.5%',
      changeType: 'increase',
      icon: '💰',
    },
    {
      title: 'Đơn hàng trong tháng',
      value: '1,234',
      change: '+8.2%',
      changeType: 'increase',
      icon: '📦',
    },
    {
      title: 'Sản phẩm bán chạy nhất',
      value: 'Strongbow Blueberry',
      change: '120 sản phẩm',
      changeType: 'neutral',
      icon: '⭐',
    },
    {
      title: 'Khách hàng mới',
      value: '156',
      change: '+15.3%',
      changeType: 'increase',
      icon: '👥',
    },
  ];

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
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Doanh thu theo tháng</h3>
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

          {/* Daily Orders Chart */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Đơn hàng theo ngày trong tuần</h3>
            <Bar data={dailyOrdersData} options={chartOptions} />
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
