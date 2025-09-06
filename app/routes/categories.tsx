import { useEffect, useState } from 'react';
import { categoryApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Toast } from '~/components/Toast';
import { Pagination } from '~/components/Pagination';
import { Layout } from '~/components/Layout';
import { Pencil, Trash2 } from 'lucide-react';

import { CategoryForm } from '~/components/category/CategoryForm';
import { AutocompleteSearchBar, type SearchField, type SearchResult } from '~/components/AutoCompleteSearchBar';

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
  const itemsPerPage = 9; // card view: 9 per page

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
      console.error('Load categories error', err);
      setToast({ message: 'Lỗi tải danh mục', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
    try {
      return (await categoryApi.search(query)) as any;
    } catch (err) {
      console.error('Autocomplete search error:', err);
      return [];
    }
  };

  useEffect(() => {
    // reset to page 1 when search or sort changes
    setCurrentPage(1);
    loadCategories(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      loadCategories(currentPage);
    } catch (err) {
      console.error('Save category error', err);
      setToast({ message: 'Lỗi lưu danh mục', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá danh mục này?')) return;
    try {
      await categoryApi.delete(id);
      setToast({ message: 'Xoá thành công', type: 'success' });
      // nếu xóa làm trang hiện tại trống, chuyển trang trước đó
      const newTotal = Math.max(0, totalItems - 1);
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      setCurrentPage(targetPage);
      loadCategories(targetPage);
    } catch (err) {
      console.error('Delete category error', err);
      setToast({ message: 'Lỗi xoá danh mục', type: 'error' });
    }
  };

  const categoriesSearchFields: SearchField[] = [{ value: 'name', label: 'Tên', type: 'text', operator: '~' }];

  // ===== Render =====
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh Mục</h1>
            <p className="text-sm text-gray-600 mt-1">Danh sách danh mục sản phẩm</p>
          </div>

          <div className="flex-1 md:mx-6">
            <AutocompleteSearchBar
              searchFields={categoriesSearchFields}
              onSearch={handleAutocompleteSearch}
              placeholder="Tìm danh mục..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={openCreateModal}>+ Thêm danh mục</Button>
          </div>
        </div>

        {/* Sort + optional controls (kept simple) */}
        <div className="flex items-center justify-between gap-4">
          {/* <div className="text-sm text-gray-500">Sắp xếp:</div> */}
          <div className="flex items-center gap-2">
            <select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="-createdTime">Mới nhất</option>
              <option value="createdTime">Cũ nhất</option>
              <option value="name">Tên A→Z</option>
              <option value="-name">Tên Z→A</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có danh mục nào</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{cat.description || '—'}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-400">ID: <span className="text-gray-500">{cat.id}</span></div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        title="Sửa"
                        className="p-2 rounded-md hover:bg-gray-100"
                      >
                        <Pencil className="w-4 h-4 text-orange-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        title="Xóa"
                        className="p-2 rounded-md hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
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
            </div>
          </>
        )}

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
