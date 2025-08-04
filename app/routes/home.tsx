import { Link } from 'react-router';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';

export default function Home() {
	return (
		<Layout>
			<div className='space-y-8'>
				<div className='text-center'>
					<h1 className='text-4xl font-bold text-gray-900 mb-4'>Chào mừng đến với Store maN</h1>
					<p className='text-xl text-gray-600 mb-8'>Hệ thống quản lý cửa hàng toàn diện</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					<div className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
						<div className='text-3xl mb-4'>📊</div>
						<h3 className='text-lg font-semibold mb-2'>Dashboard</h3>
						<p className='text-gray-600 mb-4'>Xem tổng quan và thống kê</p>
						<Link to='/dashboard'>
							<Button size='sm'>Xem Dashboard</Button>
						</Link>
					</div>

					<div className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
						<div className='text-3xl mb-4'>📦</div>
						<h3 className='text-lg font-semibold mb-2'>Quản lý Sản phẩm</h3>
						<p className='text-gray-600 mb-4'>Thêm, sửa, xóa và quản lý sản phẩm</p>
						<Link to='/products'>
							<Button size='sm'>Quản lý Sản phẩm</Button>
						</Link>
					</div>

					<div className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
						<div className='text-3xl mb-4'>🛒</div>
						<h3 className='text-lg font-semibold mb-2'>Đơn hàng</h3>
						<p className='text-gray-600 mb-4'>Theo dõi và xử lý đơn hàng</p>
						<Link to='/orders'>
							<Button size='sm'>Xem Đơn hàng</Button>
						</Link>
					</div>

					<div className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
						<div className='text-3xl mb-4'>📂</div>
						<h3 className='text-lg font-semibold mb-2'>Danh mục</h3>
						<p className='text-gray-600 mb-4'>Quản lý danh mục sản phẩm</p>
						<Link to='/categories'>
							<Button size='sm'>Quản lý Danh mục</Button>
						</Link>
					</div>

					<div className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
						<div className='text-3xl mb-4'>🏭</div>
						<h3 className='text-lg font-semibold mb-2'>Nhà cung cấp</h3>
						<p className='text-gray-600 mb-4'>Quản lý thông tin nhà cung cấp</p>
						<Link to='/suppliers'>
							<Button size='sm'>Quản lý Nhà cung cấp</Button>
						</Link>
					</div>

					<div className='bg-surface p-6 rounded-lg shadow-md border border-gray-200'>
						<div className='text-3xl mb-4'>📋</div>
						<h3 className='text-lg font-semibold mb-2'>Kho</h3>
						<p className='text-gray-600 mb-4'>Quản lý tồn kho và nhập xuất</p>
						<Link to='/stock'>
							<Button size='sm'>Quản lý Kho</Button>
						</Link>
					</div>
				</div>
			</div>
		</Layout>
	);
}
