import { Layout } from '~/components/Layout';

export default function About() {
	return (
		<Layout>
			<div className='space-y-8'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900 mb-4'>Về chúng tôi</h1>
					<p className='text-xl text-gray-600'>Store maN - Hệ thống quản lý cửa hàng toàn diện</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<div className='bg-surface p-8 rounded-lg shadow-md border border-gray-200'>
						<h2 className='text-xl font-semibold text-gray-900 mb-4'>Tầm nhìn</h2>
						<p className='text-gray-600 leading-relaxed'>
							Chúng tôi mong muốn trở thành giải pháp quản lý cửa hàng đáng tin cậy, giúp các doanh nghiệp tối ưu hóa
							quy trình kinh doanh và nâng cao hiệu quả vận hành.
						</p>
					</div>

					<div className='bg-surface p-8 rounded-lg shadow-md border border-gray-200'>
						<h2 className='text-xl font-semibold text-gray-900 mb-4'>Sứ mệnh</h2>
						<p className='text-gray-600 leading-relaxed'>
							Cung cấp các công cụ quản lý hiện đại, dễ sử dụng và toàn diện để hỗ trợ doanh nghiệp phát triển bền vững
							trong thời đại số.
						</p>
					</div>
				</div>

				<div className='bg-surface p-8 rounded-lg shadow-md border border-gray-200'>
					<h2 className='text-xl font-semibold text-gray-900 mb-6'>Tính năng chính</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						<div className='text-center'>
							<div className='text-3xl mb-3'>📊</div>
							<h3 className='font-semibold text-gray-900 mb-2'>Dashboard thông minh</h3>
							<p className='text-sm text-gray-600'>Theo dõi thống kê kinh doanh real-time</p>
						</div>
						<div className='text-center'>
							<div className='text-3xl mb-3'>📦</div>
							<h3 className='font-semibold text-gray-900 mb-2'>Quản lý sản phẩm</h3>
							<p className='text-sm text-gray-600'>Thêm, sửa, xóa sản phẩm dễ dàng</p>
						</div>
						<div className='text-center'>
							<div className='text-3xl mb-3'>🛒</div>
							<h3 className='font-semibold text-gray-900 mb-2'>Xử lý đơn hàng</h3>
							<p className='text-sm text-gray-600'>Theo dõi đơn hàng từ A đến Z</p>
						</div>
						<div className='text-center'>
							<div className='text-3xl mb-3'>📋</div>
							<h3 className='font-semibold text-gray-900 mb-2'>Quản lý kho</h3>
							<p className='text-sm text-gray-600'>Kiểm soát tồn kho hiệu quả</p>
						</div>
						<div className='text-center'>
							<div className='text-3xl mb-3'>🏭</div>
							<h3 className='font-semibold text-gray-900 mb-2'>Nhà cung cấp</h3>
							<p className='text-sm text-gray-600'>Quản lý đối tác, nhà phân phối</p>
						</div>
						<div className='text-center'>
							<div className='text-3xl mb-3'>🎫</div>
							<h3 className='font-semibold text-gray-900 mb-2'>Mã giảm giá</h3>
							<p className='text-sm text-gray-600'>Tạo và quản lý khuyến mãi</p>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
