import { Link } from "react-router";
import { Button } from "~/components/Button";
import { Layout } from "~/components/Layout";

const features = [
  {
    icon: "📊",
    title: "Dashboard",
    desc: "Xem tổng quan và thống kê",
    link: "/dashboard",
    btn: "Xem Dashboard",
  },
  {
    icon: "📈",
    title: "Thống kê",
    desc: "Phân tích doanh thu và hiệu suất",
    link: "/statistics",
    btn: "Xem Thống kê",
  },
  {
    icon: "📦",
    title: "Quản lý Sản phẩm",
    desc: "Thêm, sửa, xóa và quản lý sản phẩm",
    link: "/products",
    btn: "Quản lý Sản phẩm",
  },
  {
    icon: "🛒",
    title: "Đơn hàng",
    desc: "Theo dõi và xử lý đơn hàng",
    link: "/orders",
    btn: "Xem Đơn hàng",
  },
  {
    icon: "📂",
    title: "Danh mục",
    desc: "Quản lý danh mục sản phẩm",
    link: "/categories",
    btn: "Quản lý Danh mục",
  },
  {
    icon: "🏭",
    title: "Nhà cung cấp",
    desc: "Quản lý thông tin nhà cung cấp",
    link: "/suppliers",
    btn: "Quản lý Nhà cung cấp",
  },
  {
    icon: "📋",
    title: "Kho",
    desc: "Quản lý tồn kho và nhập xuất",
    link: "/stock",
    btn: "Quản lý Kho",
  },
  {
    icon: "🎫",
    title: "Mã giảm giá",
    desc: "Tạo và quản lý mã giảm giá",
    link: "/vouchers",
    btn: "Quản lý Mã giảm giá",
  }
];

export default function Home() {
  return (
    <Layout>
      <div className="relative bg-gradient-to-b from-indigo-50 via-white to-white">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            CK Store
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Hệ thống quản lý cửa hàng toàn diện, dễ sử dụng và hiện đại – từ quản lý sản phẩm đến xử lý đơn hàng.
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Glow background */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

                <div className="relative text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="relative text-xl font-semibold text-gray-900 mb-3">
                  {f.title}
                </h3>
                <p className="relative text-gray-600 mb-8 text-sm leading-relaxed">
                  {f.desc}
                </p>
                <Link to={f.link} className="relative mt-auto">
                  <Button size="sm" className="shadow-md hover:shadow-lg">
                    {f.btn}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
