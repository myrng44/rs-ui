
import { useState, useEffect } from "react";
import { Layout } from "~/components/Layout";
import { dashboardApi } from "~/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Package, ShoppingCart, DollarSign, Users } from "lucide-react";

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

interface Order {
  id: string;
  customer: string;
  total: string;
  status: string;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, productsData, ordersData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getTopProducts(7, 4),
        dashboardApi.getRecentOrders(4),
      ]);
      setSummary(summaryData);
      setTopProducts(productsData);
      setRecentOrders(
        ordersData.map((order) => ({
          id: order.id,
          customer: order.customer,
          total: formatPrice(order.total),
          status: order.status,
        }))
      );
      setError("");
    } catch (err: any) {
      if (err.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.status === 404) {
        setError("Không tìm thấy dữ liệu.");
      } else {
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  const formatNumber = (num: number) => new Intl.NumberFormat("vi-VN").format(num);

  const stats = summary
    ? [
        {
          label: "Tổng sản phẩm",
          value: formatNumber(summary.totalProducts),
          icon: Package,
          color: "bg-gradient-to-br from-blue-600 to-blue-400",
        },
        {
          label: "Đơn hàng hôm nay",
          value: formatNumber(summary.todayOrders),
          icon: ShoppingCart,
          color: "bg-gradient-to-br from-green-600 to-emerald-400",
        },
        {
          label: "Doanh thu tháng",
          value: formatPrice(summary.monthlyRevenue),
          icon: DollarSign,
          color: "bg-gradient-to-br from-yellow-600 to-orange-400",
        },
        {
          label: "Tổng khách hàng",
          value: formatNumber(summary.totalCustomer),
          icon: Users,
          color: "bg-gradient-to-br from-purple-600 to-pink-400",
        },
      ]
    : [];

  const statusStyles: { [key: string]: string } = {
    "Đã giao": "bg-green-100 text-green-700",
    "Đang xử lý": "bg-yellow-100 text-yellow-700",
    "Đã xác nhận": "bg-blue-100 text-blue-700",
    "Đang giao": "bg-purple-100 text-purple-700",
  };

  return (
    <Layout>
      <div className="container mx-auto space-y-8 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">📊</span> Dashboard
          </h1>
          <p className="text-black mt-1">Tổng quan kinh doanh và thống kê hiệu suất</p>
        </motion.div>
        {/* <button
          onClick={loadDashboardData}
          className=" mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:to-blue-500 transition-colors duration-200"        >
          Làm mới dữ liệu
        </button> */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-2"
            >
              <span>{error}</span>
              <button
                onClick={loadDashboardData}
                className="ml-auto text-sm text-red-600 hover:text-red-800"
              >
                Thử lại
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 animate-pulse rounded-xl shadow-sm"
                />
              ))
            : stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className={`p-6 rounded-xl text-white shadow-lg ${stat.color} transform transition-all duration-300`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium opacity-90">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className="w-10 h-10 opacity-80" />
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" /> Đơn hàng gần đây
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-3 font-semibold">Mã</th>
                    <th className="py-3 font-semibold">Khách hàng</th>
                    <th className="py-3 font-semibold">Tổng</th>
                    <th className="py-3 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">
                            <div className="h-4 bg-gray-100 animate-pulse rounded" />
                          </td>
                          <td>
                            <div className="h-4 bg-gray-100 animate-pulse rounded" />
                          </td>
                          <td>
                            <div className="h-4 bg-gray-100 animate-pulse rounded" />
                          </td>
                          <td>
                            <div className="h-4 bg-gray-100 animate-pulse rounded" />
                          </td>
                        </tr>
                      ))
                    : recentOrders.map((order, i) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 font-medium">{order.id}</td>
                          <td className="py-3">{order.customer}</td>
                          <td className="py-3">{order.total}</td>
                          <td className="py-3">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[order.status]}`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-600">🔥</span> Sản phẩm bán chạy
            </h2>
            <div className="space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-100 animate-pulse rounded-lg"
                    />
                  ))
                : topProducts.length > 0
                ? topProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex justify-between items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">Top #{i + 1}</p>
                      </div>
                      <p className="font-semibold text-blue-600">{formatPrice(product.unitPrice)}</p>
                    </motion.div>
                  ))
                : (
                  <p className="text-gray-500 text-center py-4">Không có dữ liệu sản phẩm</p>
                )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}