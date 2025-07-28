import { Layout } from "~/components/layout";

export default function Dashboard() {
  const stats = [
    { label: "Tổng sản phẩm", value: "1,234", change: "+12%", icon: "📦" },
    { label: "Đơn hàng hôm nay", value: "45", change: "+8%", icon: "🛒" },
    { label: "Doanh thu tháng", value: "₫45,678,900", change: "+15%", icon: "💰" },
    { label: "Khách hàng", value: "567", change: "+5%", icon: "👥" },
  ];

  const recentOrders = [
    { id: "ORD001", customer: "Nguyễn Văn A", total: "₫450,000", status: "Đã giao" },
    { id: "ORD002", customer: "Trần Thị B", total: "₫320,000", status: "Đang xử lý" },
    { id: "ORD003", customer: "Lê Văn C", total: "₫890,000", status: "Đã xác nhận" },
    { id: "ORD004", customer: "Phạm Thị D", total: "₫156,000", status: "Đang giao" },
  ];

  const topProducts = [
    { name: "Sản phẩm A", sold: 145, revenue: "₫2,900,000" },
    { name: "Sản phẩm B", sold: 123, revenue: "₫2,460,000" },
    { name: "Sản phẩm C", sold: 98, revenue: "₫1,960,000" },
    { name: "Sản phẩm D", sold: 87, revenue: "₫1,740,000" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Tổng quan kinh doanh và thống kê</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-success">{stat.change}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.total}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === "Đã giao" ? "bg-success text-white" :
                        order.status === "Đang xử lý" ? "bg-warning text-white" :
                          order.status === "Đã xác nhận" ? "bg-primary text-white" :
                            "bg-secondary text-accent"
                    }`}>
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
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sold} đã bán</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
