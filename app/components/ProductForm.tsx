import { useState, useEffect, useCallback } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import Dropdown from "./Dropdown";
import { Pagination } from "./Pagination";

interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  categoryId: number;
  categoryName?: string;
  supplierId: number;
  supplierName?: string;
  deleted?: boolean;
}

interface Option {
  label: string;
  value: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: number;
    message: string;
  };
}

interface FormData {
  name: string;
  sku: string;
  description: string;
  unitPrice: string;
  categoryId: string;
  supplierId: string;
}

interface FormErrors {
  name?: string;
  sku?: string;
  unitPrice?: string;
  categoryId?: string;
  supplierId?: string;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categories, setCategories] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);

  const [form, setForm] = useState<FormData>({
    name: "",
    sku: "",
    description: "",
    unitPrice: "",
    categoryId: "",
    supplierId: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // const apiCall = async <T,>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  //   try {
  //     const response = await fetch(url, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         ...options.headers,
  //       },
  //       ...options,
  //     });

  //     const data = await response.json();
      
  //     if (!response.ok) {
  //       throw new Error(data.message || `HTTP ${response.status}`);
  //     }
      
  //     return data;
  //   } catch (error: any) {
  //     throw new Error(error.message || 'Network error');
  //   }
  // };
  
  const apiCall = async <T,>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  try {
    // Lấy token từ localStorage, sessionStorage hoặc một nguồn khác
    const token = localStorage.getItem('token') || ''; // Thay 'authToken' bằng key phù hợp

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Thêm Authorization header nếu token tồn tại
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      // Xử lý lỗi cụ thể, ví dụ: token hết hạn
      if (response.status === 401) {
        // Có thể thêm logic để xử lý token hết hạn, như đăng xuất hoặc làm mới token
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Lỗi kết nối mạng');
  }
};

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");
      const response = await apiCall<Product[]>(`/api/products/active`);
      
      if (response.success) {
        setProducts(response.data || []);
      } else {
        setApiError(response.message || "Không thể tải danh sách sản phẩm");
        setProducts([]);
      }
    } catch (error: any) {
      console.error("Fetch products failed:", error);
      setApiError("Lỗi kết nối. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiCall<any[]>(`/api/categories/active`);
      if (response.success && response.data) {
        setCategories(
          response.data.map((c: any) => ({
            label: c.name,
            value: String(c.id)
          }))
        );
      }
    } catch (error) {
      console.error("Fetch categories failed:", error);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await apiCall<any[]>(`/api/suppliers/active`);
      if (response.success && response.data) {
        setSuppliers(
          response.data.map((s: any) => ({
            label: s.name,
            value: String(s.id)
          }))
        );
      }
    } catch (error) {
      console.error("Fetch suppliers failed:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, [fetchProducts, fetchCategories, fetchSuppliers]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!form.name.trim()) {
      errors.name = "Tên sản phẩm không được để trống";
    }

    if (!form.sku.trim()) {
      errors.sku = "SKU không được để trống";
    }

    if (!form.unitPrice.trim()) {
      errors.unitPrice = "Giá không được để trống";
    } else {
      const price = Number(form.unitPrice);
      if (isNaN(price) || price < 0) {
        errors.unitPrice = "Giá phải là số dương";
      }
    }

    if (!form.categoryId) {
      errors.categoryId = "Vui lòng chọn danh mục";
    }

    if (!form.supplierId) {
      errors.supplierId = "Vui lòng chọn nhà cung cấp";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Search function
  const handleSearch = async () => {
    if (!search.trim()) {
      await fetchProducts();
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      const response = await apiCall<Product[]>(
        `/api/products/search?name=${encodeURIComponent(search.trim())}`
      );
      
      if (response.success) {
        setProducts(response.data || []);
        setCurrentPage(1);
      } else {
        setApiError(response.message || "Tìm kiếm thất bại");
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      setApiError("Lỗi tìm kiếm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Delete function
  const handleDelete = async (id: number, productName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${productName}"?`)) return;

    try {
      setLoading(true);
      const response = await apiCall<string>(`/api/products/${id}/soft-delete`, {
        method: 'PUT'
      });
      
      if (response.success) {
        await fetchProducts();
        // Reset to first page if current page becomes empty
        const remainingProducts = products.length - 1;
        const maxPage = Math.ceil(remainingProducts / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
          setCurrentPage(maxPage);
        }
      } else {
        setApiError(response.message || "Xóa sản phẩm thất bại");
      }
    } catch (error: any) {
      console.error("Delete failed:", error);
      setApiError("Lỗi xóa sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Create function
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setApiError("");
      
      const response = await apiCall<Product>(`/api/products/create`, {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          sku: form.sku.trim(),
          description: form.description.trim(),
          unitPrice: Number(form.unitPrice),
          categoryId: Number(form.categoryId),
          supplierId: Number(form.supplierId),
        })
      });

      if (response.success) {
        setModalOpen(false);
        resetForm();
        await fetchProducts();
      } else {
        setApiError(response.message || "Tạo sản phẩm thất bại");
      }
    } catch (error: any) {
      console.error("Create failed:", error);
      setApiError("Lỗi tạo sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      description: "",
      unitPrice: "",
      categoryId: "",
      supplierId: "",
    });
    setFormErrors({});
    setApiError("");
  };

  const handleModalClose = () => {
    setModalOpen(false);
    resetForm();
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* API Error Display */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {apiError}
          <button
            onClick={() => setApiError("")}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <input
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={loading}
          />
          <Button
            variant="secondary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
        </div>
        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          disabled={loading}
        >
          + Thêm sản phẩm
        </Button>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Tên</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">SKU</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Giá</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Danh mục</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Nhà cung cấp</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700 w-32">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {search ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{product.sku}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {product.unitPrice?.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-4 py-3">{product.categoryName || 'N/A'}</td>
                  <td className="px-4 py-3">{product.supplierName || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={loading}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={products.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          loading={loading}
        />
      )}

      {/* Create Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Thêm sản phẩm mới"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleModalClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <input
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Tên sản phẩm *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={isSubmitting}
            />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <input
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                formErrors.sku ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="SKU *"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              disabled={isSubmitting}
            />
            {formErrors.sku && <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>}
          </div>

          <div>
            <textarea
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Mô tả"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <input
              type="number"
              min="0"
              step="1"
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                formErrors.unitPrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Giá (VND) *"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              disabled={isSubmitting}
            />
            {formErrors.unitPrice && <p className="text-red-500 text-sm mt-1">{formErrors.unitPrice}</p>}
          </div>

          <Dropdown
            label="Danh mục"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            options={[{ label: "Chọn danh mục", value: "" }, ...categories]}
            required
            error={formErrors.categoryId}
            readOnly={isSubmitting}
          />

          <Dropdown
            label="Nhà cung cấp"
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            options={[{ label: "Chọn nhà cung cấp", value: "" }, ...suppliers]}
            required
            error={formErrors.supplierId}
            readOnly={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
}