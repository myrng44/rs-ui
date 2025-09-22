import { Link, useLocation } from 'react-router';

// simple heroicon-ish paths for distinct icons
const ICONS: Record<string, string> = {
  dashboard: 'M3 3h18v4H3V3zm0 7h18v11H3V10z',
  statistics: 'M3 3v18h18V3H3zm5 11h2V8H8v6zm4 0h2V5h-2v9zm4 0h2v-4h-2v4z',
  products: 'M3 7h18v2H3V7zm0 6h18v2H3v-2z',
  categories: 'M4 6h7v7H4z M13 6h7v7h-7z M4 15h7v3H4z M13 15h7v3h-7z',
  orders: 'M3 3h18v2H3V3zm2 5h14l-1.5 9h-11L5 8z',
  customers: 'M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z',
  suppliers: 'M4 4h16v2H4V4zm0 6h16v2H4v-2zm0 6h10v2H4v-2z',
  stores: 'M3 7l9-4 9 4v11H3V7zm5 2v7h2V9H8z',
  stock: 'M12 2L2 7l10 5 10-5-10-5zm0 11l-8-4v6l8 4 8-4v-6l-8 4z',
  vouchers: 'M12 2L2 7l10 5 10-5L12 2zm0 7a3 3 0 110-6 3 3 0 010 6z',
};

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
  { path: '/statistics', label: 'Thống kê', icon: ICONS.statistics },
  { path: '/products', label: 'Sản phẩm', icon: ICONS.products },
  { path: '/categories', label: 'Danh mục', icon: ICONS.categories },
  { path: '/orders', label: 'Đơn hàng', icon: ICONS.orders },
  { path: '/customers', label: 'Khách hàng', icon: ICONS.customers },
  { path: '/suppliers', label: 'Nhà cung cấp', icon: ICONS.suppliers },
  { path: '/stores', label: 'Cửa hàng', icon: ICONS.stores },
  { path: '/stock', label: 'Kho', icon: ICONS.stock },
  { path: '/vouchers', label: 'Mã giảm giá', icon: ICONS.vouchers },
];

interface SidebarProps {
  isCollapsed: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export function Sidebar({ isCollapsed, onHoverChange }: SidebarProps) {
  const location = useLocation();

  const collapsed = isCollapsed;

  const handleMouseEnter = () => onHoverChange?.(true);
  const handleMouseLeave = () => onHoverChange?.(false);

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${collapsed ? 'w-16' : 'w-72'} bg-surface border-r border-gray-200 overflow-y-auto scrollbar-thin transition-all duration-300 ease-in-out z-40`}
      aria-hidden={collapsed}
    >
      <div className='flex flex-col h-full'>
        <div className={`flex items-center gap-3 ${collapsed ? 'px-2 py-4 justify-center' : 'px-6 py-4'}`}>
          <div className={`w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold transition-transform duration-200 ${collapsed ? 'scale-90' : 'scale-100'}`}>
            SM
          </div>
          {!collapsed && (
            <div>
              <div className='text-lg font-semibold text-gray-900'>Store maN</div>
              <div className='text-xs text-gray-500'>Quản trị cửa hàng</div>
            </div>
          )}
        </div>

        <nav className='px-2 py-3 flex-1'>
          <ul className='space-y-1'>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className='relative'>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg w-full ${collapsed ? 'justify-center py-3' : 'px-4 py-3'} transition-all duration-200 group ${isActive ? 'bg-primary text-on-primary shadow-md' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className='flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 group-hover:bg-gray-200 text-gray-700'>
                      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' xmlns='http://www.w3.org/2000/svg'>
                        <path d={item.icon} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    </span>

                    {!collapsed && (
                      <span className='flex-1 text-sm font-medium truncate'>{item.label}</span>
                    )}

                    {isActive && !collapsed && <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-md' />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`px-4 py-4 ${collapsed ? 'text-center' : ''}`}>
          <div className='flex items-center justify-between'>
            {!collapsed ? (
              <div className='text-sm text-gray-600'>Phiên: Admin</div>
            ) : (
              <div className='text-xs text-gray-500'>A</div>
            )}
            {!collapsed && <button className='text-sm text-gray-500 hover:text-primary transition-colors'>Đăng xuất</button>}
          </div>
        </div>
      </div>
    </aside>
  );
}
