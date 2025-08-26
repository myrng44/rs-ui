import { useState, useEffect, useCallback } from 'react';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { DataTable } from '~/components/DataTable';
import { Pagination } from '~/components/Pagination';
import { customersApi } from '~/utils/api';
import { Input } from '~/components/Input';
import { AutocompleteSearchBar, type SearchField, type SearchResult } from '~/components/AutoCompleteSearchBar';
import { Toast } from '~/components/Toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  gender: string;
  point: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    point: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'error' | 'warning'>('info');

  const customerSearchFields: SearchField[] = [
    { value: 'name', label: 'Tên khách hàng', type: 'text', operator: '~' },
    { value: 'phone', label: 'Số điện thoại', type: 'text', operator: '~' },
    { value: 'gender', label: 'Giới tính', type: 'text', operator: '=' },
  ];

  useEffect(() => {
    loadCustomers();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCustomers(page);
  };

  const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
    return await customersApi.search(query);
  };

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const loadCustomers = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const sort = '-createdTime';
      const response = await customersApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: sort,
      });
      setCustomers(response.elements);
      setTotalElements(response.totalElements);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách khách hàng');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      gender: '',
      point: '',
    });
  };

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await customersApi.create({
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        point: parseInt(formData.point) || 0,
      });
      setToastMessage('Thêm khách hàng thành công!');
      setToastType('success');
      setShowToast(true);
      setIsAddModalOpen(false);
      resetForm();
      await loadCustomers(currentPage);
    } catch (err: any) {
      setError('Không thể thêm khách hàng');
      console.error('Error adding customer:', err);
      setToastMessage('Lỗi khi thêm khách hàng!');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      gender: customer.gender,
      point: customer.point.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCustomer) return;

    try {
      setIsSubmitting(true);
      setError('');
      await customersApi.update(editingCustomer.id, {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        point: parseInt(formData.point) || 0,
      });
      setToastMessage('Cập nhật khách hàng thành công!');
      setToastType('success');
      setShowToast(true);
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      resetForm();
      await loadCustomers(currentPage);
    } catch (err: any) {
      setError('Không thể cập nhật khách hàng');
      console.error('Error updating customer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xác nhận xóa khách hàng này?')) {
      try {
        setError('');
        await customersApi.delete(id);
        setToastMessage('Xóa khách hàng thành công!');
        setToastType('success');
        setShowToast(true);
        const newTotal = totalElements - 1;
        const maxPage = Math.ceil(newTotal / itemsPerPage);
        const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setCurrentPage(targetPage);
        await loadCustomers(targetPage);
      } catch (err: any) {
        setError('Không thể xóa khách hàng');
        console.error('Error deleting customer:', err);
      }
    }
  };

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Quản lý Khách hàng</h1>
            <p className='text-gray-600'>Thêm, sửa, xóa và quản lý khách hàng</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
            Thêm khách hàng mới
          </Button>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        <AutocompleteSearchBar
          searchFields={customerSearchFields}
          onSearch={handleAutocompleteSearch}
          placeholder='Tìm kiếm khách hàng...'
        />

        <DataTable
          data={customers}
          columns={[
            {
              key: 'name',
              label: 'Tên khách hàng',
              render: (value) => <span className='font-medium text-gray-900'>{value}</span>,
            },
            {
              key: 'phone',
              label: 'Số điện thoại',
              render: (value) => <span className='text-gray-900'>{value}</span>,
            },
            {
              key: 'gender',
              label: 'Giới tính',
              render: (value) => <span className='text-gray-600'>{value === 'M' ? 'Nam' : value === 'F' ? 'Nữ' : 'Khác'}</span>,
            },
            {
              key: 'point',
              label: 'Điểm tích lũy',
              render: (value) => <span className='font-medium text-green-600'>{new Intl.NumberFormat('vi-VN').format(value)}</span>,
            },
          ]}
          actions={[
            {
              label: 'Sửa',
              variant: 'outline',
              onClick: handleEdit,
            },
            {
              label: 'Xóa',
              variant: 'danger',
              onClick: (customer) => handleDelete(customer.id),
            },
          ]}
          loading={loading}
          emptyMessage='Chưa có khách hàng nào'
        />

        {!loading && customers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalElements / itemsPerPage)}
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        {/* Add Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title='Thêm khách hàng mới'
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
          <div className='space-y-4'>
            <Input
              label='Tên khách hàng'
              type='text'
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
            />
            <Input
              label='Số điện thoại'
              type='tel'
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              required
            />
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => handleFormChange('gender', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              >
                <option value=''>Chọn giới tính</option>
                <option value='M'>Nam</option>
                <option value='F'>Nữ</option>
                <option value='O'>Khác</option>
              </select>
            </div>
            <Input
              label='Điểm tích lũy'
              type='number'
              value={formData.point}
              onChange={(e) => handleFormChange('point', e.target.value)}
              min='0'
            />
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCustomer(null);
            resetForm();
          }}
          title='Chỉnh sửa khách hàng'
          footer={
            <>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCustomer(null);
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
          <div className='space-y-4'>
            <Input
              label='Tên khách hàng'
              type='text'
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
            />
            <Input
              label='Số điện thoại'
              type='tel'
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              required
            />
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => handleFormChange('gender', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              >
                <option value=''>Chọn giới tính</option>
                <option value='M'>Nam</option>
                <option value='F'>Nữ</option>
                <option value='O'>Khác</option>
              </select>
            </div>
            <Input
              label='Điểm tích lũy'
              type='number'
              value={formData.point}
              onChange={(e) => handleFormChange('point', e.target.value)}
              min='0'
            />
          </div>
        </Modal>
      </div>
      {showToast && (
        <Toast
          className={'mt-6'}
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </Layout>
  );
}
