import { Layout } from '~/components/Layout';
import { useCallback, useEffect, useState } from 'react';
import { supplierApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Pagination } from '~/components/Pagination';
import { Modal } from '~/components/Modal';
import { SupplierForm } from '~/components/SupplierForm';

interface Supplier {
	id: string;
	name: string;
	address: string;
	contact: string;
}

export default function Suppliers() {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [itemsPerPage] = useState(10);

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		address: '',
		contact: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		loadSuppliers();
	}, []);

	const loadSuppliers = async (page: number = currentPage) => {
		try {
			setLoading(true);
			const offset = (page - 1) * itemsPerPage;
			const sort = '-lastUpdatedTime';
			const response = await supplierApi.getAll({
				offset,
				limit: itemsPerPage,
				sort: sort,
			});
			setSuppliers(response.elements);
			setTotalElements(response.totalElements);
			setError('');
		} catch (error: any) {
			setError('Không thể tải danh sách các danh mục');
			console.log('Error loading categories:', error);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		loadSuppliers(page);
	};

	const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	}, []);

	const resetForm = () => {
		setFormData({
			name: '',
			address: '',
			contact: '',
		});
	};

	const handleAdd = async () => {
		try {
			setIsSubmitting(true);
			setError('');
			await supplierApi.create(formData);
			setIsAddModalOpen(false);
			resetForm();
			//preload current page -> show new supplier
			await loadSuppliers();
		} catch (error: any) {
			setError('Không thể thêm nhà cung cấp');
			console.log('Error adding product:', error);
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleEdit = (supplier: Supplier) => {
		setEditingSupplier(supplier);
		setFormData({
			name: supplier.name,
			address: supplier.address,
			contact: supplier.contact,
		});
		setIsEditModalOpen(true);
	};

	const handleUpdate = async () => {
		if (!editingSupplier) return;

		try {
			setIsSubmitting(true);
			setError('');
			await supplierApi.update(editingSupplier.id, {
				name: formData.name,
				address: formData.address,
				contact: formData.contact,
			});
			setIsEditModalOpen(false);
			setEditingSupplier(null);
			resetForm();
			//reload current page to show updated supplier
			await loadSuppliers(currentPage);
		} catch (error: any) {
			setError('Không thể cập nhật danh mục');
			console.log('Error updating supplier:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Xác nhận xóa nhà phân phối này?')) {
			try {
				setError('');
				await supplierApi.delete(id);
				//check if current page is empty after delete supplier
				const newTotal = totalElements - 1;
				const maxPage = Math.ceil(newTotal / itemsPerPage);
				const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
				setCurrentPage(targetPage);
				await loadSuppliers(targetPage); //refresh after delete
			} catch (error: any) {
				setError('Không thể xóa nhà phân phối');
				console.log('Error deleting supplier:', error);
			}
		}
	};

	return (
		<Layout>
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>Quản lý Nhà Phân Phối</h1>
						<p className='text-gray-600'>Thêm, sửa, xóa và quản lý nhà phân phối</p>
					</div>
					<Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
						Thêm nhà phân phối mới
					</Button>
				</div>

				{error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

				<div className='bg-surface rounded-lg shadow-md border border-gray-200'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b border-gray-200'>
									<th className='text-left p-4 font-semibold text-gray-900'>Tên nhà phân phối</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Địa chỉ</th>
									<th className='text-left p-4 font-semibold text-gray-900'>Liên hệ</th>
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
								) : suppliers.length === 0 ? (
									<tr>
										<td colSpan={5} className='text-center p-8 text-gray-600'>
											Chưa có sản phẩm nào
										</td>
									</tr>
								) : (
									suppliers.map((supplier) => (
										<tr key={supplier.id} className='border-b border-gray-100 hover:bg-gray-50'>
											<td className='p-4 text-gray-900'>{supplier.name}</td>
											<td className='p-4 text-gray-600'>{supplier.address}</td>
											<td className='p-4 text-gray-600'>{supplier.contact}</td>
											<td className='p-4'>
												<div className='flex space-x-2'>
													<Button size='sm' variant='outline' onClick={() => handleEdit(supplier)}>
														Sửa
													</Button>
													<Button size='sm' variant='danger' onClick={() => handleDelete(supplier.id)}>
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

					{!loading && suppliers.length > 0 && (
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
					title='Thêm nhà phân phối mới'
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
					<SupplierForm formData={formData} onChange={handleFormChange} />
				</Modal>

				{/* Edit Modal */}
				<Modal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setEditingSupplier(null);
						resetForm();
					}}
					title='Chỉnh sửa nhà phân phối'
					footer={
						<>
							<Button
								variant='outline'
								onClick={() => {
									setIsEditModalOpen(false);
									setEditingSupplier(null);
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
					<SupplierForm formData={formData} onChange={handleFormChange} />
				</Modal>
			</div>
		</Layout>
	);
}
