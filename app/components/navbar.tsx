import { NavLink } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { useState } from "react";


export default function Navbar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-gradient-to-br from-red-600 to-purple-600 shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--dashboard-primary] to-[--dashboard-secondary] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <NavLink to='/'><span className="text-2xl font-bold text-gray-900">Store <span className='text-lime-500'>maN</span></span></NavLink>
          </div>

          <div className="flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-xl text-gray-200 text-shadow-md text-shadow-red-500"
                    : "text-xl text-white hover:text-red-300"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-xl text-gray-200 text-shadow-md text-shadow-red-500"
                    : "text-xl text-white hover:text-red-300"
                }`
              }
            >
              Sản Phẩm
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-xl text-gray-200 text-shadow-md text-shadow-red-500"
                    : "text-xl text-white hover:text-red-300"
                }`
              }
            >
              Đơn Hàng
            </NavLink>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-[--dashboard-primary] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BEE4D0] to-[#FF6363] flex items-center justify-center">
                    <span className="text-xl text-white font-medium">
                      {user.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xl font-medium">{user.userName}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.roleName === "ADMIN"
                          ? "Quản trị viên"
                          : user.roleName === "MANAGER"
                            ? "Quản lý"
                            : "Nhân viên"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Đăng xuất</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
