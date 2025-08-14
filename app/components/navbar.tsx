import { Link } from 'react-router'
// import { useAuth } from '~/contexts/authContext'
// import { Button } from '@/components/button'

export function Navbar() {
  // const { user, logout } = useAuth()

  // const handleLogout = () => {
  //   // logout()
  //   window.location.href = '/login'
  // }

  return (
    <nav className='h-16 bg-surface border-b border-gray-200 px-6 flex items-center justify-between shadow-sm fixed top-0 left-0 right-0 z-50'>
      <div className='flex items-center space-x-8'>
        <Link to='/' className='text-xl font-bold text-primary'>
          Store maN
        </Link>
        <div className='flex items-center space-x-6'>
          <Link to='/' className='text-gray-700 hover:text-primary transition-colors duration-200 font-medium'>
            Trang chủ
          </Link>
          <Link to='/about' className='text-gray-700 hover:text-primary transition-colors duration-200 font-medium'>
            Về chúng tôi
          </Link>
        </div>
      </div>

      {/* <div className='flex items-center space-x-4'>
        {user ? (
          <>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-secondary rounded-full flex items-center justify-center'>
                <span className='text-sm font-medium text-accent'>
                  {user.fullName?.charAt(0) || user.userName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className='text-sm'>
                <div className='font-medium text-gray-900'>{user.fullName || user.userName}</div>
                <div className='text-gray-500'>{user.roleName || 'User'}</div>
              </div>
            </div>
            <Button size='sm' variant='outline' onClick={handleLogout}>
              Đăng xuất
            </Button>
          </>
        ) : (
          <Link to='/login'>
            <Button size='sm'>Đăng nhập</Button>
          </Link>
        )}
      </div> */}
    </nav>
  )
}
