import { Layout } from '~/components/Layout';
import { useCallback, useEffect, useState } from 'react';
import { categoryApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Pagination } from '~/components/Pagination';
import { Modal } from '~/components/Modal';
import { CategoryForm } from '~/components/CategoryForm';
import { DataTable } from '~/components/DataTable';
import { AutocompleteSearchBar, type SearchField, type SearchResult } from "~/components/AutoCompleteSearchBar";

interface Category {
  id: string;
  name: string;
  description: string;
}

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search configuration for categories
  const categorySearchFields: SearchField[] = [
    { value: "name", label: "Tên danh mục", type: "text", operator: "~" },
    { value: "description", label: "Mô tả", type: "text", operator: "~" },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const sort = '-createdTime';
      const response = await categoryApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: sort,
      });
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

  const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
    return await categoryApi.search(query);
  };

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await categoryApi.create(formData);
      setIsAddModalOpen(false);
      resetForm();
      //preload current page -> show new category
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
    setFormData({
      name: category.name,
      description: category.description,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      setIsSubmitting(true);
      setError('');
      await categoryApi.update(editingCategory.id, {
        name: formData.name,
        description: formData.description,
      });
      setIsEditModalOpen(false);
      setEditingCategory(null);
      resetForm();
      //reload current page to show updated category
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
        //check if current page is empty after delete category
        const newTotal = totalElements - 1;
        const maxPage = Math.ceil(newTotal / itemsPerPage);
        const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setCurrentPage(targetPage);
        await loadCategories(targetPage); //refresh after delete
      } catch (error: any) {
        setError('Không thể xóa danh mục');
        console.log('Error deleting category:', error);
      }
    }
  };

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Quản lý Danh Mục</h1>
            <p className='text-gray-600'>Thêm, sửa, xóa và quản lý danh mục</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
            Thêm danh mục mới
          </Button>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        <AutocompleteSearchBar
          searchFields={categorySearchFields}
          onSearch={handleAutocompleteSearch}
          placeholder="Tìm kiếm danh mục..."
        />

        <DataTable
          data={categories}
          columns={[
            {
              key: 'name',
              label: 'Tên danh mục',
              render: (value) => <span className='text-gray-900'>{value}</span>,
            },
            {
              key: 'description',
              label: 'Mô tả',
              render: (value) => <span className='text-gray-600'>{value}</span>,
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
              onClick: (category) => handleDelete(category.id),
            },
          ]}
          loading={loading}
          emptyMessage='Chưa có danh mục nào'
        />

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

        {/* Add Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title='Thêm danh mục mới'
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
          <CategoryForm formData={formData} onChange={handleFormChange} />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCategory(null);
            resetForm();
          }}
          title='Chỉnh sửa sản phẩm'
          footer={
            <>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategory(null);
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
          <CategoryForm formData={formData} onChange={handleFormChange} />
        </Modal>
      </div>
    </Layout>
  );
}
