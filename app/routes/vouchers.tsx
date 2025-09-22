import { Layout } from '~/components/Layout';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { voucherApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Pagination } from '~/components/Pagination';
import { Modal } from '~/components/Modal';
import { VoucherForm } from '~/components/VoucherForm';

interface Voucher {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  discountValue: number;
  startTime: string;
  expirationTime: string;
}

type ViewMode = 'list' | 'grid';

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
    startTime: '',
    expirationTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      loadVouchers(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const loadVouchers = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const sort = '-createdTime';
      const query = searchText ? `code~${searchText}` : undefined;
      const response = await voucherApi.getAll({ offset, limit: itemsPerPage, sort, query });
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

  const handleFormChange = useCallback((field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = () => {
    setFormData({ code: '', description: '', discountPercent: 0, discountValue: 0, startTime: '', expirationTime: '' });
  };

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await voucherApi.create(formData);
      setIsAddModalOpen(false);
      resetForm();
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
      await voucherApi.update(editingVoucher.id, formData);
      setIsEditModalOpen(false);
      setEditingVoucher(null);
      resetForm();
      await loadVouchers(currentPage);
    } catch (error: any) {
      setError('Không thể cập nhật mã giảm giá');
      console.log('Error updating voucher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xác nhận xóa mã giảm giá này?')) {
      try {
        setError('');
        await voucherApi.delete(id);
        const newTotal = totalElements - 1;
        const maxPage = Math.ceil(newTotal / itemsPerPage);
        const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setCurrentPage(targetPage);
        await loadVouchers(targetPage);
      } catch (error: any) {
        setError('Không thể xóa mã giảm giá');
        console.log('Error deleting voucher:', error);
      }
    }
  };

  const now = useMemo(() => new Date(), []);
  const getStatus = (v: Voucher) => {
    const start = new Date(v.startTime);
    const end = new Date(v.expirationTime);
    if (now < start) return { text: 'Sắp diễn ra', className: 'text-gray-700 bg-gray-100' };
    if (now > end) return { text: 'Hết hạn', className: 'text-white bg-error' };
    return { text: 'Đang hoạt động', className: 'text-on-primary bg-primary' };
  };

  const renderGrid = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <div key={i} className='card p-4 h-40 animate-pulse' />)
      ) : vouchers.length === 0 ? (
        <div className='col-span-full text-center text-gray-600 p-6'>Chưa có mã giảm giá nào</div>
      ) : (
        vouchers.map((v) => {
          const s = getStatus(v);
          return (
            <div key={v.id} className='card p-4 hover:shadow-lg'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Mã</div>
                  <div className='text-xl font-semibold text-gray-900'>{v.code}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>{s.text}</span>
              </div>
              <div className='text-gray-600 mt-2 line-clamp-2'>{v.description}</div>
              <div className='mt-3 flex items-center gap-3 text-sm'>
                {v.discountPercent ? <span className='px-2 py-1 rounded-md bg-gray-50 text-gray-700'>-{v.discountPercent}%</span> : null}
                {v.discountValue ? <span className='px-2 py-1 rounded-md bg-gray-50 text-gray-700'>-{v.discountValue.toLocaleString('vi-VN')}đ</span> : null}
              </div>
              <div className='mt-3 text-xs text-gray-500'>Từ {new Date(v.startTime).toLocaleDateString()} đến {new Date(v.expirationTime).toLocaleDateString()}</div>
              <div className='mt-4 flex gap-2'>
                <Button size='sm' variant='outline' onClick={() => handleEdit(v)}>Sửa</Button>
                <Button size='sm' variant='danger' onClick={() => handleDelete(v.id)}>Xóa</Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Quản lý Mã Giảm Giá</h1>
            <p className='text-gray-600'>Thêm, sửa, xóa và quản lý mã giảm giá</p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder='Tìm theo mã...'
                className='w-56 px-3 py-2 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-gray-400 hover:shadow-md'
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>🔎</span>
            </div>
            <div className='flex rounded-lg border border-gray-300 overflow-hidden'>
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'hover:bg-gray-50 text-gray-700'}`} title='Chế độ danh sách'>⋮</button>
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'hover:bg-gray-50 text-gray-700'}`} title='Chế độ lưới'>⬚</button>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>Tạo mới mã giảm giá</Button>
          </div>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        {viewMode === 'list' ? (
          <div className='bg-surface rounded-lg shadow-md border border-gray-200'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left p-4 font-semibold text-gray-900'>Mã giảm giá</th>
                  <th className='text-left p-4 font-semibold text-gray-900'>Mô tả</th>
                  <th className='text-left p-4 font-semibold text-gray-900'>Giảm theo %</th>
                  <th className='text-left p-4 font-semibold text-gray-900'>Gi���m theo giá trị</th>
                  <th className='text-left p-4 font-semibold text-gray-900'>Ngày bắt đầu</th>
                  <th className='text-left p-4 font-semibold text-gray-900'>Ngày hết hạn</th>
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
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='text-center p-8 text-gray-600'>Chưa có mã giảm giá nào</td>
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
                          <Button size='sm' variant='outline' onClick={() => handleEdit(voucher)}>Sửa</Button>
                          <Button size='sm' variant='danger' onClick={() => handleDelete(voucher.id)}>Xóa</Button>
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
        ) : (
          renderGrid()
        )}

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => { setIsAddModalOpen(false); resetForm(); }}
          title='Thêm mã giảm giá mới'
          footer={<>
            <Button variant='outline' onClick={() => { setIsAddModalOpen(false); resetForm(); }}>Hủy</Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>{isSubmitting ? 'Đang thêm...' : 'Thêm'}</Button>
          </>}
        >
          <VoucherForm formData={formData} onChange={handleFormChange} />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingVoucher(null); resetForm(); }}
          title='Chỉnh sửa mã giảm giá'
          footer={<>
            <Button variant='outline' onClick={() => { setIsEditModalOpen(false); setEditingVoucher(null); resetForm(); }}>Hủy</Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}</Button>
          </>}
        >
          <VoucherForm formData={formData} onChange={handleFormChange} />
        </Modal>
      </div>
    </Layout>
  );
}
