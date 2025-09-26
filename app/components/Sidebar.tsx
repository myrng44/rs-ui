import { Link, useLocation } from 'react-router';
import { useAuth } from '~/contexts/authContext';
import { useState } from 'react';

// simple heroicon-ish paths for distinct icons
const ICONS: Record<string, string> = {
  dashboard: 'M3 3h18v4H3V3zm0 7h18v11H3V10z',
  reports: 'M3 3v18h18V3H3zm5 11h2V8H8v6zm4 0h2V5h-2v9zm4 0h2v-4h-2v4z',
  products: 'M3 7h18v2H3V7zm0 6h18v2H3v-2z',
  categories: 'M4 6h7v7H4z M13 6h7v7h-7z M4 15h7v3H4z M13 15h7v3h-7z',
  orders: 'M3 3h18v2H3V3zm2 5h14l-1.5 9h-11L5 8z',
  customers: 'M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z',
  suppliers: 'M4 4h16v2H4V4zm0 6h16v2H4v-2zm0 6h10v2H4v-2z',
  stores: 'M3 7l9-4 9 4v11H3V7zm5 2v7h2V9H8z',
  stock: 'M12 2L2 7l10 5 10-5-10-5zm0 11l-8-4v6l8 4 8-4v-6l-8 4z',
  vouchers: 'M12 2L2 7l10 5 10-5L12 2zm0 7a3 3 0 110-6 3 3 0 010 6z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z'
};

// Organized menu items by groups
const menuGroups = [
  {
    title: 'CHÍNH',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
      { path: '/reports', label: 'Báo cáo', icon: ICONS.reports },
    ]
  },
  {
    title: 'QUẢN LÝ',
    items: [
      { path: '/products', label: 'Sản phẩm', icon: ICONS.products },
      { path: '/categories', label: 'Danh mục', icon: ICONS.categories },
      { path: '/orders', label: 'Đơn hàng', icon: ICONS.orders },
      { path: '/customers', label: 'Khách hàng', icon: ICONS.customers },
      { path: '/suppliers', label: 'Nhà cung cấp', icon: ICONS.suppliers },
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      { path: '/stores', label: 'Cửa hàng', icon: ICONS.stores },
      { path: '/stock', label: 'Kho', icon: ICONS.stock },
      { path: '/vouchers', label: 'Mã giảm giá', icon: ICONS.vouchers },
      { path: '/settings', label: 'Cài đặt', icon: ICONS.settings },
    ]
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export function Sidebar({ isCollapsed, onHoverChange }: SidebarProps) {
  const location = useLocation();
  const { user, canAccess, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserSectionCollapsed, setIsUserSectionCollapsed] = useState(false);

  const handleMouseEnter = () => onHoverChange?.(true);
  const handleMouseLeave = () => onHoverChange?.(false);

  // Filter menu items based on access permissions
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => canAccess(item.path))
  })).filter(group => group.items.length > 0);

  // Filter items based on search query
  const getFilteredItems = () => {
    if (!searchQuery.trim()) return filteredMenuGroups;

    const query = searchQuery.toLowerCase();
    return filteredMenuGroups.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.label.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query)
      )
    })).filter(group => group.items.length > 0);
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${
        isCollapsed ? 'w-16' : 'w-72'
      } bg-surface border-r border-gray-200 overflow-y-auto scrollbar-thin transition-all duration-300 ease-in-out z-40`}
      aria-hidden={isCollapsed}
    >
      <div className='flex flex-col h-full'>
        {/* Header with logo */}
        <div className={`flex items-center gap-3 ${isCollapsed ? 'px-2 py-4 justify-center' : 'px-6 py-4'}`}>
          <div className={`w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold transition-transform duration-200 ${
            isCollapsed ? 'scale-90' : 'scale-100'
          }`}>
            SM
          </div>
          {!isCollapsed && (
            <div>
              <div className='text-lg font-semibold text-gray-900'>Store maN</div>
              <div className='text-xs text-gray-500'>Quản trị cửa hàng</div>
            </div>
          )}
        </div>

        {/* Search bar */}
        {!isCollapsed && (
          <div className='px-4 pb-4'>
            <div className='relative'>
              <svg className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                <path d={ICONS.search} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              <input
                type='text'
                placeholder='Tìm kiếm...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className='px-2 flex-1 space-y-6'>
          {getFilteredItems().map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  {group.title}
                </div>
              )}
              <ul className='space-y-1'>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path} className='relative'>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 rounded-lg w-full ${
                          isCollapsed
                            ? 'justify-center py-3 px-2'
                            : 'px-4 py-3'
                        } transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className={`flex items-center justify-center w-6 h-6 ${
                          isActive ? 'text-on-primary' : 'text-gray-600 group-hover:text-primary'
                        }`}>
                          <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' xmlns='http://www.w3.org/2000/svg'>
                            <path d={item.icon} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                          </svg>
                        </div>

                        {!isCollapsed && (
                          <span className='flex-1 text-sm font-medium truncate'>{item.label}</span>
                        )}

                        {isActive && !isCollapsed && (
                          <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-on-primary rounded-r-md' />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className='border-t border-gray-200 p-4'>
          {!isCollapsed ? (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  TÀI KHOẢN
                </div>
                <button
                  onClick={() => setIsUserSectionCollapsed(!isUserSectionCollapsed)}
                  className='p-1 rounded hover:bg-gray-100 transition-colors'
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isUserSectionCollapsed ? 'rotate-180' : ''}`}
                    fill='none' stroke='currentColor' viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
              </div>

              {!isUserSectionCollapsed && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-3 p-2 bg-gray-50 rounded-lg'>
                    <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary text-sm font-medium'>
                      {user?.fullName?.charAt(0) || user?.userName?.charAt(0) || 'U'}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='text-sm font-medium text-gray-900 truncate'>
                        {user?.fullName || user?.userName || 'User'}
                      </div>
                      <div className='text-xs text-gray-500 truncate'>
                        {user?.roleName || 'User'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col items-center space-y-2'>
              <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary text-xs font-medium'>
                {user?.fullName?.charAt(0) || user?.userName?.charAt(0) || 'U'}
              </div>
              <button
                onClick={logout}
                className='p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors'
                title='Đăng xuất'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}