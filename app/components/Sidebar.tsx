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
    <aside className="w-64 bg-surface border-r border-gray-200 h-screen fixed left-0 top-16 overflow-y-auto scrollbar-thin">
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
