import { Outlet } from 'react-router'
// Outlet display the child component nếu nó tồn tại và được truy cập

export default function Finances() {
  return (
    <div>
      <p>Welcome to the dashboard</p>
      <Outlet />
    </div>
  )
}
