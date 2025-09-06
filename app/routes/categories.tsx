import { useEffect, useState } from 'react';
import { categoryApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Toast } from '~/components/Toast';
import { Pagination } from '~/components/Pagination';
import { Layout } from '~/components/Layout';

import { CategoryForm } from '~/components/category/CategoryForm';
import { CategoryGrid } from '~/components/category/CategoryGrid';
import { CategorySearch } from '~/components/category/CategorySearch';

import { AutocompleteSearchBar, type SearchField, type SearchResult } from "~/components/AutoCompleteSearchBar";


interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
}

export default function CategoriesPage() {
  // ===== State =====
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [sortValue, setSortValue] = useState('-createdTime');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9; // ✅ Card view: nên để 9 item / trang

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ===== API call =====
  const loadCategories = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const response = await categoryApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: sortValue,
        ...(searchText ? { search: `name~${searchText}` } : {}),
      });

      const elems = (response && (response as any).elements) || [];
      const total = (response && (response as any).totalElements) || elems.length;

      setCategories(elems);
      setTotalItems(total);
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
    } catch (err) {
      setToast({ message: 'Lỗi tải danh mục', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

    const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
      try {
        return (await categoryApi.search(query)) as any;
      } catch (err) {
        console.error("Autocomplete search error:", err);
        return [];
      }
    };

  useEffect(() => {
    loadCategories(1);
    setCurrentPage(1);
  }, [searchText, sortValue]);

  // ===== Handlers =====
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', parentId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description,
      parentId: cat.parentId || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        setToast({ message: 'Tên danh mục không được để trống', type: 'error' });
        return;
      }

      if (editingCategory) {
        await categoryApi.update(editingCategory.id, formData);
        setToast({ message: 'Cập nhật thành công', type: 'success' });
      } else {
        await categoryApi.create(formData);
        setToast({ message: 'Thêm mới thành công', type: 'success' });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setToast({ message: 'Lỗi lưu danh mục', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá danh mục này?')) return;
    try {
      await categoryApi.delete(id);
      setToast({ message: 'Xoá thành công', type: 'success' });
      loadCategories();
    } catch (err) {
      setToast({ message: 'Lỗi xoá danh mục', type: 'error' });
    }
  };

    const categoriesSearchFields: SearchField[] = [
    { value: "name", label: "Tên", type: "text", operator: "~" }
  ];

  // ===== Render =====
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Quản lý Danh Mục</h1>

        {/* Search + Sort */}
        <CategorySearch
          searchText={searchText}
          onSearchChange={setSearchText}
          sortValue={sortValue}
          onSortChange={setSortValue}
        />

        <AutocompleteSearchBar
          searchFields={categoriesSearchFields}
          onSearch={handleAutocompleteSearch}
          placeholder="Tìm kiếm sản phẩm..."
        />

        {/* Add button */}
        <div className="flex justify-end">
          <Button onClick={openCreateModal}>+ Thêm danh mục</Button>
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="text-center py-4">
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            <CategoryGrid
              categories={categories}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
            {categories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không có danh mục nào
              </div>
            )}
          </>
        )}



        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            loadCategories(page);
          }}
          loading={loading}
        />

        {/* Modal Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Cập nhật danh mục' : 'Thêm mới danh mục'}
        >
          <CategoryForm
            formData={formData}
            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Modal>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Layout>
  );
}
