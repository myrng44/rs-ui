import { Layout } from '~/components/Layout';
import { useCallback, useEffect, useState } from 'react';
import { categoryApi, voucherApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Pagination } from '~/components/Pagination';
import { Modal } from '~/components/Modal';
import { CategoryForm } from '~/components/CategoryForm';
import { VoucherForm } from '~/components/VoucherForm';

interface Voucher {
	id: string;
	code: string;
	description: string;
	discountPercent: number;
	discountValue: number;
	startTime: any;
	expirationTime: any;
}

export default function Vouchers() {
	const [vouchers, setVouchers] = useState<Voucher[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [itemsPerPage] = useState(10);

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
	const [formData, setFormData] = useState({
		code: '',
		description: '',
		discountPercent: 0,
		discountValue: 0,
		startTime: null,
		expirationTime: null,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		loadVouchers();
	}, []);

	const loadVouchers = async (page: number = currentPage) => {
		try {
			setLoading(true);
			const offset = (page - 1) * itemsPerPage;
			const sort = '-lastUpdatedTime';
			const response = await voucherApi.getAll({
				offset,
				limit: itemsPerPage,
				sort: sort,
			});
			setVouchers(response.elements);
			setTotalElements(response.totalElements);
			setError('');
		} catch (error: any) {
			setError('Không thể tải danh sách các mã giảm giá');
			console.log('Error loading vouchers:', error);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		loadVouchers(page);
	};

	const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	}, []);

	const resetForm = () => {
		setFormData({
			code: '',
			description: '',
			discountPercent: 0,
			discountValue: 0,
			startTime: null,
			expirationTime: null,
		});
	};

	const handleAdd = async () => {
		try {
			setIsSubmitting(true);
			setError('');
			await voucherApi.create(formData);
			setIsAddModalOpen(false);
			resetForm();
			//preload current page -> show new category
			await loadVouchers();
		} catch (error: any) {
			setError('Không thể thêm mã giảm giá');
			console.log('Error adding voucher:', error);
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleEdit = (voucher: Voucher) => {
		setEditingVoucher(voucher);
		setFormData({
			code: voucher.code,
			description: voucher.description,
			discountPercent: voucher.discountPercent,
			discountValue: voucher.discountValue,
			startTime: voucher.startTime,
			expirationTime: voucher.expirationTime,
		});
		setIsEditModalOpen(true);
	};

	const handleUpdate = async () => {
		if (!editingVoucher) return;

		try {
			setIsSubmitting(true);
			setError('');
			await voucherApi.update(editingVoucher.id, {
				code: formData.code,
				description: formData.description,
				discountPercent: formData.discountPercent,
				discountValue: formData.discountValue,
				startTime: formData.startTime,
				expirationTime: formData.expirationTime,
			});
			setIsEditModalOpen(false);
			setEditingVoucher(null);
			resetForm();
			//reload current page to show updated category
			await loadVouchers(currentPage);
		} catch (error: any) {
			setError('Không thể cập nhật danh mục');
			console.log('Error updating category:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Xác nhận xóa mã giảm giá này?')) {
			try {
				setError('');
				await voucherApi.delete(id);
				//check if current page is empty after delete category
				const newTotal = totalElements - 1;
				const maxPage = Math.ceil(newTotal / itemsPerPage);
				const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
				setCurrentPage(targetPage);
				await loadVouchers(targetPage); //refresh after delete
			} catch (error: any) {
				setError('Không thể xóa mã giảm giá');
				console.log('Error deleting voucher:', error);
			}
		}
	};

	return (
		<Layout>
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>Quản lý Mã Giảm Giá</h1>
						<p className='text-gray-600'>Thêm, sửa, xóa và quản lý mã giảm giá</p>
					</div>
					<Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
						Thêm mã giảm giá mới
					</Button>
				</div>

				{error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

				<div className='bg-surface rounded-lg shadow-md border border-gray-200'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b border-gray-200'>
									<th className='text-left p-4 font-semibold text-gray-900'>Mã giảm giá</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Mô tả</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Giảm theo %</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Giảm theo giá trị</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Ngayf bắt đầu</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Ngày hết hạn</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={5} className='text-center p-8'>
											<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
											<p className='mt-2 text-gray-600'>Đang tải...</p>
										</td>
									</tr>
								) : vouchers.length === 0 ? (
									<tr>
										<td colSpan={5} className='text-center p-8 text-gray-600'>
											Chưa có sản phẩm nào
										</td>
									</tr>
								) : (
									vouchers.map((voucher) => (
										<tr key={voucher.id} className='border-b border-gray-100 hover:bg-gray-50'>
											<td className='p-4 text-gray-900'>{voucher.code}</td>
											<td className='p-4 text-gray-600'>{voucher.description}</td>
											<td className='p-4 text-gray-600'>{voucher.discountPercent}</td>
											<td className='p-4 text-gray-600'>{voucher.discountValue}</td>
											<td className='p-4 text-gray-600'>{voucher.startTime}</td>
											<td className='p-4 text-gray-600'>{voucher.expirationTime}</td>
											<td className='p-4'>
												<div className='flex space-x-2'>
													<Button size='sm' variant='outline' onClick={() => handleEdit(voucher)}>
														Sửa
													</Button>
													<Button size='sm' variant='danger' onClick={() => handleDelete(voucher.id)}>
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

					{!loading && vouchers.length > 0 && (
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
					title='Thêm mã giảm giá mới'
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
					<VoucherForm formData={formData} onChange={handleFormChange} />
				</Modal>

				{/* Edit Modal */}
				<Modal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setEditingVoucher(null);
						resetForm();
					}}
					title='Chỉnh sửa mã giảm giá'
					footer={
						<>
							<Button
								variant='outline'
								onClick={() => {
									setIsEditModalOpen(false);
									setEditingVoucher(null);
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
					<VoucherForm formData={formData} onChange={handleFormChange} />
				</Modal>
			</div>
		</Layout>
	);
}
