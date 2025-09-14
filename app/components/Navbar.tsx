import { Link } from "react-router";
import { useAuth } from "~/contexts/authContext";
import { Button } from "./Button";
import { Search, Bell } from "lucide-react";
import { List as ListIcon } from "lucide-react";

type NavbarProps = {
  toggleSidebar: () => void;
  isCollapsed: boolean;
};

export function Navbar({ toggleSidebar, isCollapsed }: NavbarProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const getRoleName = () => {
    if (!user?.roles) return "User";
    if (user.roles.includes("ADMIN")) return "Quản trị viên";
    if (user.roles.includes("MANAGER")) return "Quản lý";
    if (user.roles.includes("EMPLOYEE")) return "Nhân viên";
    return user.roles[0] || "User";
  };

  return (
    <nav className="h-16 bg-surface border-b border-gray-200 px-6 flex items-center justify-between shadow-sm fixed top-0 left-0 right-0 z-50">
      {/* Left: Logo + Trang chủ */}
      <div className="flex items-center space-x-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ?                     <ListIcon className="w-5 h-5" /> : <ListIcon className="w-5 h-5" />}
        </button>
        <Link to="/" className="text-xl font-bold text-primary">
          Store
        </Link>
        <Link
          to="/"
          className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium"
        >
          Trang chủ
        </Link>
      </div>

      {/* Right: Search + Về chúng tôi + Tools + User */}
      <div className="flex items-center space-x-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-4 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Về chúng tôi */}
        <Link
          to="/about"
          className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium"
        >
          Về chúng tôi
        </Link>

        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Info */}
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-accent">
                {user.fullName?.charAt(0) ||
                  user.userName?.charAt(0) ||
                  "U"}
              </span>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {user.fullName || user.userName}
              </div>
              <div className="text-gray-500">{getRoleName()}</div>
            </div>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Đăng xuất
            </Button>

            <Button size="sm" variant="outline">
              Cài đặt
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button size="sm">Đăng nhập</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
