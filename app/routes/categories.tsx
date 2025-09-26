import { Layout } from '~/components/Layout';
import { useCallback, useEffect, useState } from 'react';
import { categoryApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Pagination } from '~/components/Pagination';
import { Modal } from '~/components/Modal';
import { CategoryForm } from '~/components/CategoryForm';
import { DataTable } from '~/components/DataTable';
import { FilterPanel } from '~/components/FilterPanel';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-createdTime');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const query = searchQuery ? `name~${searchQuery}` : undefined;
      const response = await categoryApi.getAll({ offset, limit: itemsPerPage, sort: sortBy, query });
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

  const filterGroups = [
    {
      key: 'search',
      label: 'Tìm kiếm',
      type: 'search' as const,
      value: searchQuery,
      placeholder: 'Tìm theo tên danh mục, mô tả...',
    },
  ];

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'search') {
      setSearchQuery(value);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadCategories(1);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('-createdTime');
    setCurrentPage(1);
    loadCategories(1);
  };

  const activeFiltersCount = [searchQuery].filter(Boolean).length;

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

          <div className='flex items-center gap-3'>
            {/* Quick search */}
            <div className='relative'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder='Tìm kiếm danh mục...'
                className='w-64 px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              />
              <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value='-createdTime'>Mới nhất</option>
              <option value='+name'>Tên A-Z</option>
              <option value='-name'>Tên Z-A</option>
            </select>

            {/* View mode toggle */}
            <div className='flex rounded-lg border border-gray-300 overflow-hidden'>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'hover:bg-gray-50 text-gray-700'}`}
                title='Chế độ danh sách'
              >
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z' />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'hover:bg-gray-50 text-gray-700'}`}
                title='Chế độ lưới'
              >
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z' />
                </svg>
              </button>
            </div>

            {/* Filter button */}
            <Button
              variant='outline'
              onClick={() => setIsFilterOpen(true)}
              disabled={loading}
              className='relative'
            >
              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z' />
              </svg>
              Bộ lọc
              {activeFiltersCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-primary text-on-primary text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            <Button onClick={() => setIsAddModalOpen(true)} disabled={loading} className='btn-gradient'>
              + Thêm danh mục
            </Button>
          </div>
        </div>

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className='bg-white p-4 rounded-lg border border-gray-200 flex items-center flex-wrap gap-2'>
            <span className='text-sm text-gray-600 mr-2'>Bộ lọc đang áp dụng:</span>
            {searchQuery && (
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200'>
                Tìm kiếm: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className='ml-1 text-blue-500 hover:text-blue-700'>×</button>
              </span>
            )}
            <button onClick={clearFilters} className='ml-auto text-sm text-primary hover:underline font-medium'>
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

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

        {/* Filter Panel */}
        <FilterPanel
          filters={filterGroups}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          activeFiltersCount={activeFiltersCount}
        />

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