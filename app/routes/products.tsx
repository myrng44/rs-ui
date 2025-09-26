import { useState, useEffect, useCallback } from 'react';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { DataTable } from '~/components/DataTable';
import { Pagination } from '~/components/Pagination';
import { ProductForm } from '~/components/ProductForm';
import { productsApi, categoryApi } from '~/utils/api';
import { FilterPanel } from '~/components/FilterPanel';
import {Toast} from "~/components/Toast";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  categoryId: string;
}

type ViewMode = 'list' | 'grid';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unitPrice: '',
    categoryId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'error' | 'warning'>('info');

  // Filters state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('-createdTime');

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page);
  };

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getAll({ limit: 100, offset: 0, sort: 'name' });
      setCategories([{ value: '', label: 'Tất cả danh mục' }, ...res.elements.map((c: any) => ({ value: c.id, label: c.name }))]);
      setAllCategories(res.elements.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (e) {
      console.error('Error loading categories', e);
    }
  };

  const buildFilterQuery = () => {
    const parts: string[] = [];
    if (searchQuery) {
      parts.push(`name~${searchQuery}`);
    }
    if (selectedCategoryIds.length > 0) {
      parts.push(`categoryId:${selectedCategoryIds.join('_')}`);
    }
    return parts.join(' AND ');
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadProducts(1);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSortBy('-createdTime');
    setCurrentPage(1);
    loadProducts(1);
  };

  const loadProducts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const query = buildFilterQuery();
      const priceRange = minPrice && maxPrice ? { min: parseInt(minPrice), max: parseInt(maxPrice) } : undefined;

      const response = await productsApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: sortBy,
        query: query || undefined,
        unitPriceRange: priceRange,
      });
      setProducts(response.elements);
      setTotalElements(response.totalElements);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh s��ch sản phẩm');
      console.error('Error loading products:', err);
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
      placeholder: 'Tìm theo tên, SKU, mô tả...',
    },
    {
      key: 'categories',
      label: 'Danh mục',
      type: 'multiselect' as const,
      options: allCategories.map(c => ({ value: c.id, label: c.name })),
      value: selectedCategoryIds,
    },
    {
      key: 'price',
      label: 'Khoảng giá',
      type: 'range' as const,
      value: { min: minPrice, max: maxPrice },
    },
  ];

  const handleFilterChange = (key: string, value: any) => {
    switch (key) {
      case 'search':
        setSearchQuery(value);
        break;
      case 'categories':
        setSelectedCategoryIds(value);
        break;
      case 'price':
        setMinPrice(value.min || '');
        setMaxPrice(value.max || '');
        break;
    }
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategoryIds.length > 0,
    minPrice && maxPrice,
  ].filter(Boolean).length;

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      unitPrice: '',
      categoryId: '',
    });
  };

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await productsApi.create(formData);
      setToastMessage('Thêm sản phẩm thành công!');
      setToastType('success');
      setShowToast(true);
      setIsAddModalOpen(false);
      resetForm();
      await loadProducts(currentPage);
    } catch (err: any) {
      setError('Không thể thêm sản phẩm');
      console.error('Error adding product:', err);
      setToastMessage('Lỗi khi thêm sản phẩm!');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice.toString(),
      categoryId: product.categoryId.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      setError('');
      await productsApi.update(editingProduct.id, {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        unitPrice: formData.unitPrice,
        categoryId: formData.categoryId,
      });
      setToastMessage('Cập nhật sản phẩm thành công!');
      setToastType('success');
      setShowToast(true);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
      await loadProducts(currentPage);
    } catch (err: any) {
      setError('Không thể cập nhật sản phẩm');
      console.error('Error updating product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xác nh��n xóa sản phẩm này?')) {
      try {
        setError('');
        await productsApi.delete(id);
        setToastMessage('Xóa sản phẩm thành công!');
        setToastType('success');
        setShowToast(true);
        const newTotal = totalElements - 1;
        const maxPage = Math.ceil(newTotal / itemsPerPage);
        const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setCurrentPage(targetPage);
        await loadProducts(targetPage);
      } catch (err: any) {
        setError('Không thể xóa sản phẩm');
        console.error('Error deleting product:', err);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderGrid = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='card p-4 animate-pulse h-40' />
        ))
      ) : products.length === 0 ? (
        <div className='col-span-full text-center text-gray-600 p-6'>Chưa có sản phẩm nào</div>
      ) : (
        products.map((p) => (
          <div key={p.id} className='card p-4 flex gap-4 hover:shadow-lg transition-shadow'>
            <div className='w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 text-xl font-semibold shadow-inner'>
              {p.name?.charAt(0) || 'P'}
            </div>
            <div className='flex-1'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-gray-900'>{p.name}</h3>
                <span className='text-primary font-medium'>{formatPrice(p.unitPrice)}</span>
              </div>
              <div className='text-sm text-gray-600 mt-1'>{p.description}</div>
              <div className='mt-2 text-xs text-gray-500'>SKU: {p.sku}</div>
              <div className='mt-3 flex gap-2'>
                <Button size='sm' variant='outline' onClick={() => handleEdit(p)}>Sửa</Button>
                <Button size='sm' variant='danger' onClick={() => handleDelete(p.id)}>Xóa</Button>
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
            <h1 className='text-2xl font-bold text-gray-900'>Quản lý Sản phẩm</h1>
            <p className='text-gray-600'>Thêm, sửa, xóa và quản lý sản phẩm</p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Quick search */}
            <div className='relative'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder='Tìm kiếm sản phẩm...'
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
              <option value='+unitPrice'>Giá thấp đến cao</option>
              <option value='-unitPrice'>Giá cao đến thấp</option>
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

            {/* Filter and Add buttons */}
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
              + Thêm sản phẩm
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
            {selectedCategoryIds.map((id) => {
              const cat = allCategories.find((c) => c.id === id);
              return (
                <span key={id} className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200'>
                  {cat?.name || id}
                  <button
                    onClick={() => setSelectedCategoryIds(prev => prev.filter(cId => cId !== id))}
                    className='ml-1 text-green-500 hover:text-green-700'
                  >×</button>
                </span>
              );
            })}
            {(minPrice && maxPrice) && (
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700 border border-purple-200'>
                Giá: {new Intl.NumberFormat('vi-VN').format(parseInt(minPrice))} - {new Intl.NumberFormat('vi-VN').format(parseInt(maxPrice))}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className='ml-1 text-purple-500 hover:text-purple-700'>×</button>
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
            data={products}
            columns={[
              { key: 'sku', label: 'Mã SKU', render: (value) => <span className='font-medium text-gray-900'>{value}</span> },
              { key: 'name', label: 'Tên sản phẩm', render: (value) => <span className='text-gray-900'>{value}</span> },
              { key: 'description', label: 'Mô tả', render: (value) => <span className='text-gray-600'>{value}</span> },
              { key: 'unitPrice', label: 'Giá bán', render: (value) => <span className='text-gray-900'>{formatPrice(value)}</span> },
            ]}
            actions={[
              { label: 'Sửa', variant: 'outline', onClick: handleEdit },
              { label: 'Xóa', variant: 'danger', onClick: (product) => handleDelete(product.id) },
            ]}
            loading={loading}
            emptyMessage='Chưa có sản phẩm n��o'
          />
        ) : (
          renderGrid()
        )}

        {!loading && products.length > 0 && (
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
          title='Thêm sản phẩm mới'
          footer={
            <>
              <Button variant='outline' onClick={() => { setIsAddModalOpen(false); resetForm(); }}>Hủy</Button>
              <Button onClick={handleAdd} disabled={isSubmitting}>{isSubmitting ? 'Đang thêm...' : 'Thêm'}</Button>
            </>
          }
        >
          <ProductForm formData={formData} onChange={handleFormChange} />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
            resetForm();
          }}
          title='Chỉnh sửa sản phẩm'
          footer={
            <>
              <Button variant='outline' onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); resetForm(); }}>Hủy</Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}</Button>
            </>
          }
        >
          <ProductForm formData={formData} onChange={handleFormChange} readonlyFields={['sku']} />
        </Modal>
      </div>
      {showToast && (
        <Toast className={'mt-6'} message={toastMessage} type={toastType} duration={3000} onClose={() => setShowToast(false)} />
      )}

    </Layout>
  );
}