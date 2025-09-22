import { Layout } from '~/components/Layout';
import { useCallback, useEffect, useState } from 'react';
import { categoryApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Pagination } from '~/components/Pagination';
import { Modal } from '~/components/Modal';
import { CategoryForm } from '~/components/CategoryForm';
import { DataTable } from '~/components/DataTable';
import { AutocompleteSearchBar } from '~/components/AutoCompleteSearchBar';

interface Category {
  id: string;
  name: string;
  description: string;
}

type ViewMode = 'list' | 'grid';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categorySearchFields: import('~/components/AutoCompleteSearchBar').SearchField[] = [
    { value: 'name', label: 'Tên danh mục', type: 'text', operator: '~' },
    { value: 'description', label: 'Mô tả', type: 'text', operator: '~' },
  ];

  const handleAutocompleteSearch = async (query: string) => {
    return await categoryApi.search(query);
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      loadCategories(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const loadCategories = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const sort = '-createdTime';
      const query = searchText ? `name~${searchText}` : undefined;
      const response = await categoryApi.getAll({ offset, limit: itemsPerPage, sort, query });
      setCategories(response.elements);
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
    loadCategories(page);
  };

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '' });
  };

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await categoryApi.create(formData);
      setIsAddModalOpen(false);
      resetForm();
      await loadCategories();
    } catch (error: any) {
      setError('Không thể thêm danh mục');
      console.log('Error adding product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      setIsSubmitting(true);
      setError('');
      await categoryApi.update(editingCategory.id, { name: formData.name, description: formData.description });
      setIsEditModalOpen(false);
      setEditingCategory(null);
      resetForm();
      await loadCategories(currentPage);
    } catch (error: any) {
      setError('Không thể cập nhật danh mục');
      console.log('Error updating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xác nhận cóa danh mục này?')) {
      try {
        setError('');
        await categoryApi.delete(id);
        const newTotal = totalElements - 1;
        const maxPage = Math.ceil(newTotal / itemsPerPage);
        const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setCurrentPage(targetPage);
        await loadCategories(targetPage);
      } catch (error: any) {
        setError('Không thể xóa danh mục');
        console.log('Error deleting category:', error);
      }
    }
  };

  const renderGrid = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <div key={i} className='card p-4 h-28 animate-pulse' />)
      ) : categories.length === 0 ? (
        <div className='col-span-full text-center text-gray-600 p-6'>Chưa có danh mục nào</div>
      ) : (
        categories.map((c) => (
          <div key={c.id} className='card p-4 flex items-center gap-4 hover:shadow-lg'>
            <div className='w-12 h-12 rounded-full bg-secondary text-accent flex items-center justify-center font-semibold shadow'>
              {c.name.charAt(0)}
            </div>
            <div className='flex-1'>
              <div className='font-semibold text-gray-900'>{c.name}</div>
              <div className='text-sm text-gray-600 mt-1 line-clamp-2'>{c.description}</div>
              <div className='mt-3 flex gap-2'>
                <Button size='sm' variant='outline' onClick={() => handleEdit(c)}>Sửa</Button>
                <Button size='sm' variant='danger' onClick={() => handleDelete(c.id)}>Xóa</Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Quản lý Danh Mục</h1>
            <p className='text-gray-600'>Thêm, sửa, xóa và quản lý danh mục</p>
          </div>
          <div className='flex items-center gap-2 relative'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='p-2 rounded-md hover:bg-gray-50 transition-colors'
              title='Bộ lọc'
            >
              <svg className='w-5 h-5 text-gray-600' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                <path strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' d='M4 6h16M6 12h12M10 18h4' />
              </svg>
            </button>

            {showFilters && (
              <div className='absolute right-0 top-full mt-2 z-50 w-80 md:w-[32rem]'>
                <AutocompleteSearchBar
                  searchFields={categorySearchFields}
                  onSearch={(q) => { setSearchText(q); return handleAutocompleteSearch(q); }}
                  placeholder='Tìm kiếm danh mục...'
                />
              </div>
            )}

            <div className='flex rounded-lg border border-gray-300 overflow-hidden'>
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'hover:bg-gray-50 text-gray-700'}`} title='Chế độ danh sách'>⋮</button>
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'hover:bg-gray-50 text-gray-700'}`} title='Chế độ lưới'>⬚</button>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>Thêm danh mục mới</Button>
          </div>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        {viewMode === 'list' ? (
          <DataTable
            data={categories}
            columns={[
              { key: 'name', label: 'Tên danh mục', render: (value) => <span className='text-gray-900'>{value}</span> },
              { key: 'description', label: 'Mô tả', render: (value) => <span className='text-gray-600'>{value}</span> },
            ]}
            actions={[
              { label: 'Sửa', variant: 'outline', onClick: handleEdit },
              { label: 'Xóa', variant: 'danger', onClick: (category) => handleDelete(category.id) },
            ]}
            loading={loading}
            emptyMessage='Chưa có danh mục nào'
          />
        ) : (
          renderGrid()
        )}

        {!loading && categories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalElements / itemsPerPage)}
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => { setIsAddModalOpen(false); resetForm(); }}
          title='Thêm danh mục mới'
          footer={<>
            <Button variant='outline' onClick={() => { setIsAddModalOpen(false); resetForm(); }}>Hủy</Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>{isSubmitting ? 'Đang thêm...' : 'Thêm'}</Button>
          </>}
        >
          <CategoryForm formData={formData} onChange={handleFormChange} />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingCategory(null); resetForm(); }}
          title='Chỉnh sửa sản phẩm'
          footer={<>
            <Button variant='outline' onClick={() => { setIsEditModalOpen(false); setEditingCategory(null); resetForm(); }}>Hủy</Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}</Button>
          </>}
        >
          <CategoryForm formData={formData} onChange={handleFormChange} />
        </Modal>
      </div>
    </Layout>
  );
}
