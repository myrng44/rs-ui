import { Link, useLocation } from "react-router";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/products", label: "Sản phẩm", icon: "📦" },
  { path: "/categories", label: "Danh mục", icon: "📂" },
  { path: "/orders", label: "Đơn hàng", icon: "🛒" },
  { path: "/suppliers", label: "Nhà cung cấp", icon: "🏭" },
  { path: "/stores", label: "Cửa hàng", icon: "🏪" },
  { path: "/stock", label: "Kho", icon: "📋" },
  { path: "/vouchers", label: "Mã giảm giá", icon: "🎫" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <nav className="w-64 h-screen bg-white border-r border-gray-200 shadow-sm fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center space-x-3 border-b border-gray-200">
        <img
          src="https://www.circlek.com.vn/wp-content/themes/circlek/images/img/ckclub.png"
          alt="Logo"
          className="w-10 h-10 rounded-lg"
        />
        <h1 className="text-lg font-bold tracking-wide text-gray-800">
          Vanh Store
        </h1>
      </div>

      {/* Menu */}
      <ul className="flex-1 mt-4">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg mx-2 mb-1 transition-all duration-200
                  ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-400 border-t border-gray-200">
        © 2025 Vanh Store
      </div>
    </nav>
  );
}
