import React from "react";
import { Link, useLocation } from "react-router";

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/statistics", label: "Thống kê", icon: "📈" },
  { path: "/products", label: "Sản phẩm", icon: "📦" },
  { path: "/categories", label: "Danh mục", icon: "📂" },
  { path: "/orders", label: "Đơn hàng", icon: "🛒" },
  { path: "/suppliers", label: "Nhà cung cấp", icon: "🏭" },
  { path: "/stores", label: "Cửa hàng", icon: "🏪" },
  { path: "/stock", label: "Kho", icon: "📋" },
  { path: "/vouchers", label: "Mã giảm giá", icon: "🎫" }
];

export function Sidebar({ className = "", isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <nav
      className={`bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"} ${className}`}
      aria-label="Sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <img
              src="https://www.circlek.com.vn/wp-content/themes/circlek/images/img/ckclub.png"
              alt="Logo"
              className="w-10 h-10 rounded-lg"
            />
            <h1 className="text-lg font-bold tracking-wide text-gray-800">CK Mart</h1>
          </div>
        ) : (
          <img
            src="https://www.circlek.com.vn/wp-content/themes/circlek/images/img/ckclub.png"
            alt="Logo"
            className="w-10 h-10 rounded-lg mx-auto"
          />
        )}

        {/* Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow transition"
          aria-label={isCollapsed ? "Mở sidebar" : "Đóng sidebar"}
        >
          {/* Dùng đơn giản: ≡ khi collapsed, « khi mở */}
          <span className="text-sm">{isCollapsed ? "≡" : "«"}</span>
        </button>
      </div>

      {/* Menu */}
      <ul className="flex-1 mt-2">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 mb-1 transition-all duration-200
                  ${active ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-400 border-t border-gray-200 text-center">
        {!isCollapsed && "© 2025 Vanh Store"}
      </div>
    </nav>
  );
}
