import {NavLink, Outlet} from "react-router";

export default function Navbar() {
  return <div>
    <div>
      <div>
        <nav className='bg-gradient-to-br from-red-600 to-purple-600 shadow-md p-4'>
          <div className='w-full mx-auto flex items-center justify-start gap-24 px-4'>
            <NavLink to='/' className='flex items-center mb:md-0'> <span className='text-4xl font-black text-gray-900 select-none'> STORE <span className='text-lime-500'>maN</span> </span> </NavLink>
            <div className='flex space-x-4 ml-6'>
              <NavLink to='/dashboard' className={({isActive}) => isActive ? 'text-2xl/9 text-white-800 font-bold' : 'text-2xl/9 text-gray-800 hover:text-white font-bold'}> DASHBOARD </NavLink>
              <NavLink to='/info' className={({isActive}) => isActive ? 'text-2xl/9 text-white-800 font-bold' : 'text-2xl/9 text-gray-800 hover:text-white font-bold'}> INFO </NavLink>
              <NavLink to='/settings' className={({isActive}) => isActive ? 'text-2xl/9 text-white-800 font-bold' : 'text-2xl/9 text-gray-800 hover:text-white font-bold'}> SETTINGS </NavLink>
              <NavLink to='/auth' className={({isActive}) => isActive ? 'text-2xl/9 text-white-800 font-bold' : 'text-2xl/9 text-gray-800 hover:text-white font-bold'}> LOGIN </NavLink>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>
}