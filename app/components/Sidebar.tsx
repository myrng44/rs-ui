import { Link, useLocation } from 'react-router';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/statistics', label: 'Thống kê', icon: '📈' },
  { path: '/products', label: 'Sản phẩm', icon: '📦' },
  { path: '/categories', label: 'Danh mục', icon: '📂' },
  { path: '/orders', label: 'Đơn hàng', icon: '🛒' },
  { path: '/customers', label: 'Khách hàng', icon: '👥' },
  { path: '/suppliers', label: 'Nhà cung cấp', icon: '🏭' },
  { path: '/stores', label: 'Cửa hàng', icon: '🏪' },
  { path: '/stock', label: 'Kho', icon: '📋' },
  { path: '/vouchers', label: 'Mã giảm giá', icon: '🎫' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-surface border-r border-gray-200 h-screen fixed left-0 top-16 overflow-y-auto scrollbar-thin transition-all duration-300 ease-in-out z-40`}
    >
      {/* Toggle Button */}
      <div className='p-3 border-b border-gray-200'>
        <button
          onClick={onToggle}
          className='w-full flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors duration-200'
          title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
					<span className='text-lg transform transition-transform duration-200'>
						{isCollapsed ? '→' : '←'}
					</span>
        </button>
      </div>

      <nav className={`p-${isCollapsed ? '2' : '4'}`}>
        <div className='space-y-2'>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-lg transition-all duration-200 group
                  ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary hover:shadow-sm'
                }
                `}
                title={isCollapsed ? item.label : undefined}
              >
								<span className={`text-lg ${isCollapsed ? '' : 'flex-shrink-0'}`}>
									{item.icon}
								</span>
                {!isCollapsed && (
                  <span className='font-medium truncate'>{item.label}</span>
                )}
                {isCollapsed && (
                  <div className='absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50'>
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

