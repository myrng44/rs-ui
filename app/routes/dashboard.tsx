import { useState, useEffect } from "react";
import { Layout } from "~/components/Layout";
import { dashboardApi } from "~/utils/api";

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

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, productsData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getTopProducts(7, 4),
      ]);

      setSummary(summaryData);
      setTopProducts(
        productsData.map((product: TopProduct) => ({
          id: product.id,
          name: product.name,
          unitPrice: product.unitPrice,
        }))
      );
      setError("");
    } catch (err: unknown) {
    setError("Không thể tải dữ liệu dashboard");
    console.error("Error loading dashboard data:", err);
    } finally {
    setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const getStatsData = () => {
    if (!summary) return [];

    return [
      {
        label: "Tổng sản phẩm",
        value: formatNumber(summary.totalProducts),
        icon: "📦",
      },
      {
        label: "Đơn hàng hôm nay",
        value: formatNumber(summary.todayOrders),
        icon: "🛒",
      },
      {
        label: "Doanh thu tháng",
        value: formatPrice(summary.monthlyRevenue),
        icon: "💰",
      },
      {
        label: "Tổng khách hàng",
        value: formatNumber(summary.totalCustomer),
        icon: "👥",
      },
    ];
  };

  const recentOrders = [
    {
      id: "ORD001",
      customer: "Nguyễn Văn A",
      total: "₫450,000",
      status: "Đã giao",
    },
    {
      id: "ORD002",
      customer: "Trần Thị B",
      total: "₫320,000",
      status: "Đang xử lý",
    },
    {
      id: "ORD003",
      customer: "Lê Văn C",
      total: "₫890,000",
      status: "Đã xác nhận",
    },
    {
      id: "ORD004",
      customer: "Phạm Thị D",
      total: "₫156,000",
      status: "Đang giao",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Tổng quan kinh doanh và thống kê</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-surface p-6 rounded-lg shadow-md border border-gray-200"
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                </div>
              </div>
            ))
          ) : (
            getStatsData().map((stat, index) => (
              <div
                key={index}
                className="bg-surface p-6 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.total}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === "Đã giao"
                          ? "bg-success text-white"
                          : order.status === "Đang xử lý"
                          ? "bg-warning text-white"
                          : order.status === "Đã xác nhận"
                          ? "bg-primary text-white"
                          : "bg-secondary text-accent"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h2>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
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
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">Top #{index + 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(product.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-600">
                  Không có dữ liệu sản phẩm
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}