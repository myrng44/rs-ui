import {Outlet} from "react-router";


export default function DashBoard() {
  return <div className='text-center text-gray-800'>
    Dashboard page! <Outlet />
  </div>;
}