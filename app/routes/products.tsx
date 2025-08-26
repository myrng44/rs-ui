import { useState, useEffect, useCallback } from 'react';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { DataTable } from '~/components/DataTable';
import { Pagination } from '~/components/Pagination';
import { ProductForm } from '~/components/ProductForm';
import { productsApi } from '~/utils/api';
import { AutocompleteSearchBar, type SearchField, type SearchResult } from "~/components/AutoCompleteSearchBar";
import {Toast} from "~/components/Toast";


interface Product {
  id: string;
  sku: string;
  name: string;
  desc: string;
  unitPrice: number;
  categoryId: string;
}

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

  const productSearchFields: SearchField[] = [
    { value: "sku", label: "Mã SKU", type: "text", operator: "~" },
    { value: "name", label: "Tên sản phẩm", type: "text", operator: "~" },
    { value: "description", label: "Mô tả", type: "text", operator: "~" },
    { value: "unitPrice", label: "Giá bán", type: "number", operator: ":" },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

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

  const loadProducts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const sort = '-createdTime';
      const response = await productsApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: sort,
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
      //reload current page -> show the new product
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
      description: product.desc,
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
      //reload current page to show updated product
      await loadProducts(currentPage);
    } catch (err: any) {
      setError('Không thể cập nhật sản phẩm');
      console.error('Error updating product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xác nhận xóa sản phẩm này?')) {
      try {
        setError('');
        await productsApi.delete(id);
        setToastMessage('Xóa sản phẩm thành công!');
        setToastType('success');
        setShowToast(true);
        //check if current page becomes empty after deletion
        const newTotal = totalElements - 1;
        const maxPage = Math.ceil(newTotal / itemsPerPage);
        const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setCurrentPage(targetPage);
        await loadProducts(targetPage); //refresh sau khi delete
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

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Quản lý Sản phẩm</h1>
            <p className='text-gray-600'>Thêm, sửa, xóa và quản lý sản phẩm</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
            Thêm mới sản phẩm
          </Button>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        <AutocompleteSearchBar
          searchFields={productSearchFields}
          onSearch={handleAutocompleteSearch}
          placeholder="Tìm kiếm sản phẩm..."
        />

        <DataTable
          data={products}
          columns={[
            {
              key: 'sku',
              label: 'Mã SKU',
              render: (value) => <span className='font-medium text-gray-900'>{value}</span>,
            },
            {
              key: 'name',
              label: 'Tên sản phẩm',
              render: (value) => <span className='text-gray-900'>{value}</span>,
            },
            {
              key: 'desc',
              label: 'Mô tả',
              render: (value) => <span className='text-gray-600'>{value}</span>,
            },
            {
              key: 'unitPrice',
              label: 'Giá bán',
              render: (value) => <span className='text-gray-900'>{formatPrice(value)}</span>,
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
              onClick: (product) => handleDelete(product.id),
            },
          ]}
          loading={loading}
          emptyMessage='Chưa có sản phẩm nào'
        />

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

        {/* Add Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title='Thêm sản phẩm mới'
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
          <ProductForm formData={formData} onChange={handleFormChange} />
        </Modal>

        {/* Edit Modal */}
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
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
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
          <ProductForm formData={formData} onChange={handleFormChange} readonlyFields={['sku']} />
        </Modal>
      </div>
      {showToast && (
        <Toast className={'mt-6'}
               message={toastMessage}
               type={toastType}
               duration={3000}
               onClose={() => setShowToast(false)}
        />
      )}

    </Layout>
  );
}
