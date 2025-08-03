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
        <nav className="w-64 bg-gray-800 text-white h-full">
        <div className="p-4">
            <h1 className="text-xl font-bold">Quản lý cửa hàng</h1>
        </div>
        <ul className="mt-4">
            {menuItems.map((item) => (
            <li key={item.path}>
                <Link
                to={item.path}
                className={`flex items-center p-3 hover:bg-gray-700 transition-colors ${
                    location.pathname === item.path ? "bg-gray-700" : ""
                }`}
                >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                </Link>
            </li>
            ))}
        </ul>
        </nav>
    );
}