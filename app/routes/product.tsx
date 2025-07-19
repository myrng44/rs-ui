import {Outlet} from "react-router";


export default function Product() {
  return <div className='text-center'>
    Product page! <Outlet />
  </div>
}