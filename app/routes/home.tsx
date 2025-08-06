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
];

export default function Home() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {/* Tiêu đề */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Vanh Store
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Hệ thống quản lý cửa hàng toàn diện, dễ sử dụng và hiện đại
          </p>
        </div>

        {/* Grid các tính năng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-6 flex flex-col items-center text-center"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600 mb-6 text-sm">{f.desc}</p>
              <Link to={f.link} className="mt-auto">
                <Button size="sm">{f.btn}</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
