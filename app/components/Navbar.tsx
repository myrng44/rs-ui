import { Link } from 'react-router';
import { useAuth } from '~/contexts/authContext';
import { Button } from './Button';
import {useState} from "react";

export function Navbar() {
	const { user, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);


  const handleLogout = () => {
		logout();
		window.location.href = '/login';
	};

	return (
    <nav className='h-16 bg-surface border-b border-gray-200 px-6 flex items-center justify-between shadow-sm fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-opacity-95'>
      <div className='flex items-center space-x-8'>
        <Link to='/' className='text-xl font-bold text-primary hover:text-opacity-80 transition-all duration-200 transform hover:scale-105'>
          Store maN
        </Link>
        <div className='flex items-center space-x-6'>
          <Link to='/' className='text-gray-700 hover:text-primary transition-all duration-200 font-medium px-3 py-2 rounded-md hover:bg-gray-50'>
            Trang chủ
          </Link>
          <Link to='/about' className='text-gray-700 hover:text-primary transition-all duration-200 font-medium px-3 py-2 rounded-md hover:bg-gray-50'>
            Về chúng tôi
          </Link>
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        {user ? (
          <div className='relative'>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className='flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <div className='w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200'>
								<span className='text-sm font-medium text-accent'>
									{user.fullName?.charAt(0) || user.userName?.charAt(0) || 'U'}
								</span>
              </div>
              <div className='text-sm text-left'>
                <div className='font-medium text-gray-900'>{user.fullName || user.userName}</div>
                <div className='text-gray-500'>{user.roleName || 'User'}</div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  className='fixed inset-0 z-10'
                  onClick={() => setIsUserDropdownOpen(false)}
                />
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 animate-fade-in'>
                  <div className='py-1'>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        // TODO: Add settings navigation
                      }}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      <span>Cài đặt</span>
                    </button>
                    <hr className='border-gray-100' />
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center space-x-2'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                      </svg>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to='/login'>
            <Button size='sm'>Đăng nhập</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
