import { useState, useEffect, useCallback } from 'react';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Pagination } from '~/components/Pagination';
import { OrderForm } from '~/components/OrderForm';
import { OrderDetailsModal } from '~/components/OrderDetailsModal';
import { ordersApi } from '~/utils/api';

interface Order {
	id: string;
	customerId: string;
	storeId: number;
	voucherId: string | null;
	finalPrice: number;
	note: string;
	paymentId: number;
}

export default function Orders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [itemsPerPage] = useState(20);

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [editingOrder, setEditingOrder] = useState<Order | null>(null);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		customerId: '',
		storeId: '',
		voucherId: '',
		note: '',
		paymentId: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		loadOrders();
	}, []);

	const loadOrders = async (page: number = currentPage) => {
		try {
			setLoading(true);
			const offset = (page - 1) * itemsPerPage;
			const response = await ordersApi.getAll({
				offset,
				limit: itemsPerPage,
        sort: '-createdTime, +finalPrice',
			});
			setOrders(response.elements);
			setTotalElements(response.totalElements);
			setError('');
		} catch (err: any) {
			setError('Không thể tải danh sách đơn hàng');
			console.error('Error loading orders:', err);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		loadOrders(page);
	};

	const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	}, []);

	const resetForm = () => {
		setFormData({
			customerId: '',
			storeId: '',
			voucherId: '',
			note: '',
			paymentId: '',
		});
	};

	const handleAdd = async () => {
		try {
			setIsSubmitting(true);
			setError('');
			await ordersApi.create(formData);
			setIsAddModalOpen(false);
			resetForm();
			loadOrders(currentPage);
		} catch (err: any) {
			setError('Không thể thêm đơn hàng');
			console.error('Error adding order:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleViewDetails = (orderId: string) => {
		setSelectedOrderId(orderId);
		setIsDetailsModalOpen(true);
	};

	const handleEdit = (order: Order) => {
		setEditingOrder(order);
		setFormData({
			customerId: order.customerId.toString(),
			storeId: order.storeId.toString(),
			voucherId: order.voucherId?.toString() || '',
			note: order.note,
			paymentId: order.paymentId.toString(),
		});
		setIsEditModalOpen(true);
	};

	const handleUpdate = async () => {
		if (!editingOrder) return;

		try {
			setIsSubmitting(true);
			setError('');
			await ordersApi.update(editingOrder.id, formData);
			setIsEditModalOpen(false);
			setEditingOrder(null);
			resetForm();
			loadOrders(currentPage);
		} catch (err: any) {
			setError('Không thể cập nhật đơn hàng');
			console.error('Error updating order:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
			try {
				setError('');
				await ordersApi.delete(id);
				const newTotal = totalElements - 1;
				const maxPage = Math.ceil(newTotal / itemsPerPage);
				const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
				setCurrentPage(targetPage);
				loadOrders(targetPage);
			} catch (err: any) {
				setError('Không thể xóa đơn hàng');
				console.error('Error deleting order:', err);
			}
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price);
	};

	return (
		<Layout>
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>Quản lý Đơn hàng</h1>
						<p className='text-gray-600'>Theo dõi và xử lý đơn hàng</p>
					</div>
					<Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
						Thêm đơn hàng
					</Button>
				</div>

				{error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

				<div className='bg-surface rounded-lg shadow-md border border-gray-200'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b border-gray-200'>
									<th className='text-left p-4 font-semibold text-gray-900'>ID</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Mã Khách hàng</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Cửa hàng</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Voucher</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Ghi chú</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Tổng tiền</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={7} className='text-center p-8'>
											<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
											<p className='mt-2 text-gray-600'>Đang tải...</p>
										</td>
									</tr>
								) : orders.length === 0 ? (
									<tr>
										<td colSpan={7} className='text-center p-8 text-gray-600'>
											Chưa có đơn hàng nào
										</td>
									</tr>
								) : (
									orders.map((order) => (
										<tr key={order.id} className='border-b border-gray-100 hover:bg-gray-50'>
											<td className='p-4 font-medium text-gray-900 text-sm'>
												<button
													onClick={() => handleViewDetails(order.id)}
													className='text-primary hover:text-primary-dark hover:underline cursor-pointer'
												>
													{order.id}
												</button>
											</td>
											<td className='p-4 text-gray-900'>{order.customerId}</td>
											<td className='p-4 text-gray-900'>{order.storeId}</td>
											<td className='p-4 text-gray-600'>{order.voucherId || 'Không có'}</td>
											<td className='p-4 text-gray-600 max-w-xs truncate'>{order.note}</td>
											<td className='p-4 text-gray-900 font-medium'>{formatPrice(order.finalPrice)}</td>
											<td className='p-4'>
												<div className='flex space-x-2'>
													<Button size='sm' variant='outline' onClick={() => handleEdit(order)}>
														Sửa
													</Button>
													<Button size='sm' variant='danger' onClick={() => handleDelete(order.id)}>
														Xóa
													</Button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{!loading && orders.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={Math.ceil(totalElements / itemsPerPage)}
							totalItems={totalElements}
							itemsPerPage={itemsPerPage}
							onPageChange={handlePageChange}
							loading={loading}
						/>
					)}
				</div>

				{/* Add Modal */}
				<Modal
					isOpen={isAddModalOpen}
					onClose={() => {
						setIsAddModalOpen(false);
						resetForm();
					}}
					title='Thêm đơn hàng mới'
					footer={
						<>
							<Button
								variant='outline'
								onClick={() => {
									setIsAddModalOpen(false);
									resetForm();
								}}
							>
								Hủy
							</Button>
							<Button onClick={handleAdd} disabled={isSubmitting}>
								{isSubmitting ? 'Đang thêm...' : 'Thêm'}
							</Button>
						</>
					}
				>
					<OrderForm formData={formData} onChange={handleFormChange} />
				</Modal>

				{/* Edit Modal */}
				<Modal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setEditingOrder(null);
						resetForm();
					}}
					title='Chỉnh sửa đơn hàng'
					footer={
						<>
							<Button
								variant='outline'
								onClick={() => {
									setIsEditModalOpen(false);
									setEditingOrder(null);
									resetForm();
								}}
							>
								Hủy
							</Button>
							<Button onClick={handleUpdate} disabled={isSubmitting}>
								{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
							</Button>
						</>
					}
				>
					<OrderForm formData={formData} onChange={handleFormChange} />
				</Modal>

				{/* Order Details Modal */}
				<OrderDetailsModal
					isOpen={isDetailsModalOpen}
					onClose={() => {
						setIsDetailsModalOpen(false);
						setSelectedOrderId(null);
					}}
					orderId={selectedOrderId}
				/>
			</div>
		</Layout>
	);
}
