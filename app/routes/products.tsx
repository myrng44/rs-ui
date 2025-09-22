import { useState, useEffect, useCallback } from 'react';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { DataTable } from '~/components/DataTable';
import { Pagination } from '~/components/Pagination';
import { ProductForm } from '~/components/ProductForm';
import { productsApi, categoryApi } from '~/utils/api';
import { AutocompleteSearchBar, type SearchField, type SearchResult } from "~/components/AutoCompleteSearchBar";
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
  const [filterQuery, setFilterQuery] = useState<string>('');

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const productSearchFields: SearchField[] = [
    { value: "sku", label: "Mã SKU", type: "text", operator: "~" },
    { value: "name", label: "Tên sản phẩm", type: "text", operator: "~" },
    { value: "description", label: "Mô tả", type: "text", operator: "~" },
    { value: "unitPrice", label: "Giá bán", type: "number", operator: ":" },
  ];

  useEffect(() => {
    loadProducts();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      loadProducts(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page);
  };

  const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
    return await productsApi.search(query);
  };

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getAll({ limit: 100, offset: 0, sort: 'name' });
      setCategories([{ value: '', label: 'Tất cả danh mục' }, ...res.elements.map((c: any) => ({ value: c.id, label: c.name }))]);
    } catch (e) {
      console.error('Error loading categories', e);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const buildFilterQuery = () => {
    const parts: string[] = [];
    if (selectedCategoryIds.length > 0) {
      parts.push(`categoryid:${selectedCategoryIds.join(',')}`);
    }
    if (minPrice && maxPrice) {
      parts.push(`unitPrice(${minPrice},${maxPrice})`);
    }
    return parts.join(';');
  };

  const applyFilters = async () => {
    const q = buildFilterQuery();
    setFilterQuery(q);
    setCurrentPage(1);
    await loadProducts(1, q);
    setIsFilterOpen(false);
  };

  const clearFilters = async () => {
    setSelectedCategoryIds([]);
    setMinPrice('');
    setMaxPrice('');
    setFilterQuery('');
    setCurrentPage(1);
    await loadProducts(1, '');
  };

  const loadProducts = async (page: number = currentPage, q: string = filterQuery) => {    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const sort = q ? '+name,+unitPrice' : '-createdTime';
      const parts: string[] = [];
      if (searchText) parts.push(`name~${searchText}`);
      if (selectedCategory) parts.push(`categoryId:${selectedCategory}`);
      const query = parts.length ? parts.join(' AND ') : undefined;
      const response = await productsApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: sort,
        query: q || undefined,
      });
      setProducts(response.elements);
      setTotalElements(response.totalElements);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

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
                  searchFields={productSearchFields}
                  onSearch={(q) => { setSearchText(q); return handleAutocompleteSearch(q); }}
                  placeholder='Tìm sản phẩm...'
                />
              </div>
            )}

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary'
            >
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <div className='hidden sm:block h-6 w-px bg-gray-200' />
            <div className='flex rounded-lg border border-gray-300 overflow-hidden'>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'hover:bg-gray-50 text-gray-700'}`}
                title='Chế độ danh sách'
              >
                ⋮
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'hover:bg-gray-50 text-gray-700'}`}
                title='Chế độ lưới'
              >
                ⬚
              </button>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setIsFilterOpen(true)} disabled={loading}>
                Lọc
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
                Thêm mới sản phẩm
              </Button>
            </div>
          </div>

          {(selectedCategoryIds.length > 0 || (minPrice && maxPrice)) && (
            <div className='bg-white p-3 rounded-lg border border-gray-200 flex items-center flex-wrap gap-2'>
              <span className='text-sm text-gray-600 mr-2'>Đã chọn:</span>
              {selectedCategoryIds.map((id) => {
                const cat = allCategories.find((c) => c.id === id);
                return (
                  <span key={id} className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border'>
                  {cat?.name || id}
                    <button onClick={() => toggleCategory(id)} className='ml-1 text-gray-500 hover:text-gray-700'>×</button>
                </span>
                );
              })}
              {(minPrice && maxPrice) && (
                <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200'>
                Giá: {new Intl.NumberFormat('vi-VN').format(parseInt(minPrice))} - {new Intl.NumberFormat('vi-VN').format(parseInt(maxPrice))}
              </span>
              )}
              <button onClick={clearFilters} className='ml-auto text-sm text-blue-600 hover:underline'>Xóa tất cả</button>
            </div>
          )}
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}


        {viewMode === 'list' ? (
          <DataTable
            data={products}
            columns={[
              { key: 'sku', label: 'Mã SKU', render: (value) => <span className='font-medium text-gray-900'>{value}</span> },
              { key: 'name', label: 'Tên sản phẩm', render: (value) => <span className='text-gray-900'>{value}</span> },
              { key: 'desc', label: 'Mô tả', render: (value) => <span className='text-gray-600'>{value}</span> },
              { key: 'unitPrice', label: 'Giá bán', render: (value) => <span className='text-gray-900'>{formatPrice(value)}</span> },
            ]}
            actions={[
              { label: 'Sửa', variant: 'outline', onClick: handleEdit },
              { label: 'Xóa', variant: 'danger', onClick: (product) => handleDelete(product.id) },
            ]}
            loading={loading}
            emptyMessage='Chưa có sản phẩm nào'
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

        {/* Filter Modal */}
        <Modal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title='Bộ lọc sản phẩm'
          size='3xl'
          footer={
            <div className='flex justify-between w-full'>
              <Button variant='outline' onClick={clearFilters}>Bỏ chọn</Button>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setIsFilterOpen(false)}>Đóng</Button>
                <Button onClick={applyFilters}>Xem kết quả</Button>
              </div>
            </div>
          }
        >
          <div className='space-y-6'>
            {(selectedCategoryIds.length > 0 || (minPrice && maxPrice)) && (
              <div className='flex items-center flex-wrap gap-2'>
                <span className='text-sm text-gray-600 mr-2'>Đã chọn:</span>
                {selectedCategoryIds.map((id) => {
                  const cat = allCategories.find((c) => c.id === id);
                  return (
                    <span key={id} className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border'>
                      {cat?.name || id}
                      <button onClick={() => toggleCategory(id)} className='ml-1 text-gray-500 hover:text-gray-700'>×</button>
                    </span>
                  );
                })}
                {(minPrice && maxPrice) && (
                  <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200'>
                    Giá: {new Intl.NumberFormat('vi-VN').format(parseInt(minPrice))} - {new Intl.NumberFormat('vi-VN').format(parseInt(maxPrice))}
                  </span>
                )}
              </div>
            )}

            <div>
              <h4 className='font-semibold text-gray-900 mb-3'>Danh mục</h4>
              <div className='flex flex-wrap gap-2'>
                {allCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selectedCategoryIds.includes(c.id) ? 'bg-primary text-on-primary border-primary' : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold text-gray-900 mb-3'>Giá</h4>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='col-span-1'>
                  <label className='block text-sm text-gray-600 mb-1'>Tối thiểu</label>
                  <input
                    type='number'
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                    placeholder='0'
                  />
                </div>
                <div className='col-span-1'>
                  <label className='block text-sm text-gray-600 mb-1'>Tối đa</label>
                  <input
                    type='number'
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                    placeholder=''
                  />
                </div>
                <div className='flex items-end'>
                  <div className='flex flex-wrap gap-2'>
                    {[['0','30000'], ['30000','100000'], ['100000','300000'], ['300000','1000000']].map(([min,max]) => (
                      <button key={`${min}-${max}`}
                              onClick={() => { setMinPrice(min); setMaxPrice(max); }}
                              className='px-3 py-2 rounded-lg border text-sm bg-white hover:bg-gray-50 border-gray-300 text-gray-700'>
                        {new Intl.NumberFormat('vi-VN').format(parseInt(min))} - {new Intl.NumberFormat('vi-VN').format(parseInt(max))}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
