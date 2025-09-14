import { useEffect, useState } from 'react';
import { supplierApi } from '~/utils/api';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Toast } from '~/components/Toast';
import { Pagination } from '~/components/Pagination';
import { Layout } from '~/components/Layout';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AutocompleteSearchBar, { type SearchField, type SearchResult } from '~/components/AutoCompleteSearchBar';
import { Input } from '~/components/Input';

interface Supplier {
  id: string; 
  name: string;
  address: string;
  locationId?: string;
  contact?: string | null;
}

function SupplierForm({
  formData,
  onChange,
}: {
  formData: { name: string; address: string; locationId: string; contact: string };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên nhà cung cấp</label>
        <Input
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Nhập tên nhà cung cấp"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Liên hệ</label>
        <Input
          value={formData.contact}
          onChange={(e) => onChange('contact', e.target.value)}
          placeholder="Số điện thoại, email hoặc thông tin liên hệ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location ID (tùy chọn)</label>
        <Input
          value={formData.locationId}
          onChange={(e) => onChange('locationId', String(e.target.value))}
          placeholder="Ví dụ: 123 (hoặc để trống)"
        />
      </div>
    </div>
  );
}

// ----- Page -----
export default function SuppliersPage() {
  // state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState<string>('');
  const [sortValue, setSortValue] = useState('-createdTime');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // modal + form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', locationId: '', contact: '' });

  // toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ----- Load suppliers -----
  const loadSuppliers = async (page: number = currentPage, queryText: string = searchText) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;

      const apiParams: any = {
        offset,
        limit: itemsPerPage,
        sort: sortValue,
      };

      if (queryText && queryText.trim()) {
        const q = queryText.includes('~') || queryText.includes('=') ? queryText : `name~${queryText}`;
        apiParams.query = q;
      }

      const response = await supplierApi.getAll(apiParams);

      const elems = ((response && (response as any).elements) || []).map((e: any) => ({
        ...e,
        id: e.id !== undefined && e.id !== null ? String(e.id) : '',
        locationId: e.locationId !== undefined && e.locationId !== null ? String(e.locationId) : '',
      }));

      const total = (response && (response as any).totalElements) ?? elems.length;

      setSuppliers(elems);
      setTotalItems(total);
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
    } catch (err) {
      console.error('Load suppliers error', err);
      setToast({ message: 'Lỗi tải nhà cung cấp', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadSuppliers(1, searchText);
  }, [searchText, sortValue]);

  const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
    try {
      return await supplierApi.search(query);
    } catch (err) {
      console.error('Autocomplete supplier error', err);
      return [];
    }
  };

  // ----- Handlers -----
  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({ name: '', address: '', locationId: '', contact: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name || '',
      address: s.address || '',
      locationId: s.locationId = String(s.locationId) != null ? String(s.locationId) : '',
      contact: s.contact || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        setToast({ message: 'Tên nhà cung cấp không được để trống', type: 'error' });
        return;
      }

      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, {
          name: formData.name,
          locationId: formData.locationId ? formData.locationId : null ,
          contact: formData.contact,
        });
        setToast({ message: 'Cập nhật thành công', type: 'success' });
      } else {
        await supplierApi.create({
          name: formData.name,
          locationId: formData.locationId ? formData.locationId : null ,
          contact: formData.contact,
        });
        setToast({ message: 'Thêm mới thành công', type: 'success' });
      }

      setIsModalOpen(false);
      loadSuppliers(currentPage, searchText);
    } catch (err) {
      console.error('Save supplier error', err);
      setToast({ message: 'Lỗi lưu nhà cung cấp', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá nhà cung cấp này?')) return;
    try {
      await supplierApi.delete(id);
      setToast({ message: 'Xoá thành công', type: 'success' });
      const newTotal = Math.max(0, totalItems - 1);
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      setCurrentPage(targetPage);
      loadSuppliers(targetPage, searchText);
    } catch (err) {
      console.error('Delete supplier error', err);
      setToast({ message: 'Lỗi xoá nhà cung cấp', type: 'error' });
    }
  };

  const supplierSearchFields: SearchField[] = [
    { value: 'name', label: 'Tên', type: 'text', operator: '~' },
    { value: 'contact', label: 'Liên hệ', type: 'text', operator: '~' },
  ];

  const handleSearchSubmit = (query: string) => {
    setSearchText(query);
    setCurrentPage(1);
  };

  // ----- Render -----
return (
  <Layout>
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">Quản lý Nhà Cung Cấp</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách nhà cung cấp</p>
        </div>
      </div>

      {/* Search + Add */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 md:mx-6">
            <AutocompleteSearchBar
              searchFields={supplierSearchFields}
              onSearch={handleAutocompleteSearch}
              onSubmit={handleSearchSubmit}
              placeholder="Tìm nhà cung cấp..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={openCreateModal}>
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm nhà cung cấp
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between gap-4">
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

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">TÊN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">LIÊN HỆ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">LOCATION</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Không có nhà cung cấp
                  </td>
                </tr>
              ) : (
                suppliers.map((s, idx) => (
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
                          <div className="font-medium text-gray-900 truncate">{s.contact || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="font-medium text-gray-900 truncate">{s.locationId ? String(s.locationId) : '—'}</div>
                        </td>                    

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(s)}
                          className="text-amber-600 hover:text-amber-900 hover:bg-amber-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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
            loadSuppliers(page, searchText);
          }}
          loading={loading}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Cập nhật Nhà cung cấp' : 'Thêm mới Nhà cung cấp'}
      >
        <SupplierForm
          formData={formData}
          onChange={(field, value) => setFormData({ ...formData, [field]: value })}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setIsModalOpen(false)} variant="secondary">
            Hủy
          </Button>
          <Button onClick={handleSave}>{editingSupplier ? 'Cập nhật' : 'Thêm mới'}</Button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  </Layout>
);
}
