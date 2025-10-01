import { useEffect, useState, useCallback } from 'react';
import { storesApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Toast } from '~/components/Toast';
import { Pagination } from '~/components/Pagination';
import { Layout } from '~/components/Layout';
import { Trash2, Plus } from 'lucide-react';
import AutocompleteSearchBar, { type SearchField, type SearchResult } from '~/components/AutoCompleteSearchBar';
import { Input } from '~/components/Input';

interface Store {
  id: string;
  name: string;
  address?: string;
  locationId?: string | null;
  phone?: string | null;
}

function StoreForm({
  formData,
  onChange,
}: {
  formData: { name: string; address: string; locationId: string; phone: string };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên cửa hàng</label>
        <Input
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Nhập tên cửa hàng"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Điện thoại</label>
        <Input
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="Số điện thoại liên hệ (tùy chọn)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location ID (tùy chọn)</label>
        <Input
          value={formData.locationId}
          onChange={(e) => onChange('locationId', e.target.value)}
          placeholder="Ví dụ: 123 (hoặc để trống)"
        />
      </div>
    </div>
  );
}

// ----- Page -----
export default function StoresPage() {
  // state
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('-createdTime'); // changed name

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // modal + form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', locationId: '', phone: '' });

  // toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ----- Load stores -----
  const loadStores = async (page: number = currentPage, queryText: string = searchText) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;

      const apiParams: any = {
        offset,
        limit: itemsPerPage,
        sort: sortBy,
      };

      if (queryText && queryText.trim()) {
        const q = queryText.includes('~') || queryText.includes('=') ? queryText : `name~${queryText}`;
        apiParams.query = q;
      }

      const response = await storesApi.getAll(apiParams);

      const elems = ((response && (response as any).elements) || []).map((e: any) => ({
        ...e,
        id: e.id !== undefined && e.id !== null ? String(e.id) : '',
        locationId: e.locationId !== undefined && e.locationId !== null ? String(e.locationId) : '',
      }));

      const total = (response && (response as any).totalElements) ?? elems.length;

      setStores(elems);
      setTotalItems(total);
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
    } catch (err) {
      console.error('Load stores error', err);
      setToast({ message: 'Lỗi tải cửa hàng', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadStores(1, searchText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, sortBy]);

  const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
    try {
      return await storesApi.search(query);
    } catch (err) {
      console.error('Autocomplete store error', err);
      return [];
    }
  };

  // ----- Handlers -----
  const openCreateModal = () => {
    setEditingStore(null);
    setFormData({ name: '', address: '', locationId: '', phone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (s: Store) => {
    setEditingStore(s);
    setFormData({
      name: s.name || '',
      address: s.address || '',
      locationId: s.locationId != null ? String(s.locationId) : '',
      phone: s.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        setToast({ message: 'Tên cửa hàng không được để trống', type: 'error' });
        return;
      }

      if (editingStore) {
        await storesApi.update(editingStore.id, {
          name: formData.name,
          locationId: formData.locationId,
          phone: formData.phone,
        });
        setToast({ message: 'Cập nhật thành công', type: 'success' });
      } else {
        await storesApi.create({
          name: formData.name,
          locationId: formData.locationId,
          phone: formData.phone,
        });
        setToast({ message: 'Thêm mới thành công', type: 'success' });
      }

      setIsModalOpen(false);
      loadStores(currentPage, searchText);
    } catch (err) {
      console.error('Save store error', err);
      setToast({ message: 'Lỗi lưu cửa hàng', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá cửa hàng này?')) return;
    try {
      await storesApi.delete(id);
      setToast({ message: 'Xoá thành công', type: 'success' });
      const newTotal = Math.max(0, totalItems - 1);
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      setCurrentPage(targetPage);
      loadStores(targetPage, searchText);
    } catch (err) {
      console.error('Delete store error', err);
      setToast({ message: 'Lỗi xoá cửa hàng', type: 'error' });
    }
  };

  const storeSearchFields: SearchField[] = [
    { value: 'name', label: 'Tên', type: 'text', operator: '~' },
    { value: 'phone', label: 'Điện thoại', type: 'text', operator: '~' },
  ];

  const handleSearchSubmit = (query: string) => {
    setSearchText(query);
    setCurrentPage(1);
  };

  // Sort handler similar to OrdersTable
  const handleSort = useCallback((field: string) => {
    setSortBy((prev) => (prev === field ? `-${field}` : prev === `-${field}` ? field : field));
    setCurrentPage(1);
  }, []);

  const getSortIcon = (field: string) => {
    if (sortBy === field) return ' ↑';
    if (sortBy === `-${field}`) return ' ↓';
    return '';
  };

  // ----- Render -----
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">Quản lý Cửa Hàng</h1>
              <p className="mt-2 text-gray-600">Danh sách cửa hàng</p>
            </div>
            <div className="flex items-center gap-2">
            </div>
          </div>
        </div>

        {/* Search + Add */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 md:mx-6">
              <AutocompleteSearchBar
                searchFields={storeSearchFields}
                onSearch={handleAutocompleteSearch}
                onSubmit={handleSearchSubmit}
                placeholder="Tìm cửa hàng..."
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={openCreateModal}>
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Thêm cửa hàng
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('id')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    ID{getSortIcon('id')}
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    TÊN{getSortIcon('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ĐIỆN THOẠI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">THAO TÁC</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Không có cửa hàng
                    </td>
                  </tr>
                ) : (
                  stores.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="font-medium text-gray-900 truncate">{s.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="font-medium text-gray-900 truncate">{s.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="font-medium text-gray-900 truncate">{s.phone || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="font-medium text-gray-900 truncate">{s.locationId ?? '—'}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(s.id)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              loadStores(page, searchText);
            }}
            loading={loading}
          />
        </div>

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </Layout>
  );
}
