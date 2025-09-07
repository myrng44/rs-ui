import { useState, useEffect, useCallback } from "react";
import { Layout } from "~/components/Layout";
import { Button } from "~/components/Button";
import { Modal } from "~/components/Modal";
import { DataTable } from "~/components/DataTable";
import { Pagination } from "~/components/Pagination";
import { ProductForm } from "~/components/products/ProductForm";
import { productsApi, batchApi } from "~/utils/api";
import { AutocompleteSearchBar, type SearchField, type SearchResult } from "~/components/AutoCompleteSearchBar";
import { Toast } from "~/components/Toast";
import { Grid as GridIcon, List as ListIcon, Pencil, Trash2, Plus, Eye, Calendar, AlertTriangle, Package } from "lucide-react";

interface BatchInfo {
  id: string;
  batchCode: string;
  manufactureDate: string;  
  expiryDate: string;
  originalQty: number;
  importedPrice?: number;
  arrivalDate?: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  categoryId: number | string;
  supplierId: number | string;
  imageUrl?: string;
  stockQuantity?: number;
  category?: { name?: string } | null;
  supplier?: { name?: string } | null;
  batches?: BatchInfo[];
  batchCount?: number;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}

function BatchModal({
  isOpen,
  onClose,
  product,
  batches,
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  batches: BatchInfo[];
  loading?: boolean;
}) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const daysLeft = getDaysUntilExpiry(expiryDate);
    if (daysLeft < 0) return { text: "Đã hết hạn", color: "text-red-600", bg: "bg-red-50 border-red-200" };
    if (daysLeft <= 7) return { text: `${daysLeft} ngày`, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" };
    if (daysLeft <= 30) return { text: `${daysLeft} ngày`, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
    return { text: `${daysLeft} ngày`, color: "text-green-600", bg: "bg-green-50 border-green-200" };
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Danh sách Batch - ${product.name}`} >
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Thông tin sản phẩm</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">SKU:</span> <span className="font-medium">{product.sku}</span>
            </div>
            <div>
              <span className="text-gray-600">Giá bán:</span> <span className="font-medium">{formatPrice(product.unitPrice)}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Spinner className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500">Đang tải batch...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Chưa có batch nào cho sản phẩm này</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Danh sách Batch ({batches.length})</h4>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {batches.map((batch, index) => {
                const expiryStatus = getExpiryStatus(batch.expiryDate);
                return (
                  <div key={batch.id} className={`border rounded-lg p-4 ${expiryStatus.bg}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-1">
                          Batch #{index + 1}: {batch.batchCode}
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Số lượng:</span>{" "}
                            <span className="font-medium">{batch.originalQty?.toLocaleString() || 0}</span>
                          </div>
                          {batch.importedPrice !== undefined && batch.importedPrice !== null && (
                            <div>
                              <span className="text-gray-600">Giá nhập:</span>{" "}
                              <span className="font-medium">{formatPrice(batch.importedPrice)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${expiryStatus.bg} ${expiryStatus.color}`}>
                        {expiryStatus.text}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <div>
                          <div className="text-gray-600">Ngày sản xuất</div>
                          <div className="font-medium">{formatDate(batch.manufactureDate)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                        <div>
                          <div className="text-gray-600">Ngày hết hạn</div>
                          <div className={`font-medium ${expiryStatus.color}`}>{formatDate(batch.expiryDate)}</div>
                        </div>
                      </div>
                      {batch.arrivalDate ? (
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2 text-green-500" />
                          <div>
                            <div className="text-gray-600">Ngày nhập kho</div>
                            <div className="font-medium">{formatDate(batch.arrivalDate)}</div>
                          </div>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function ProductCardGrid({
  products,
  onEdit,
  onDelete,
  onViewBatches,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onViewBatches: (p: Product) => void;
}) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-surface rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description || "Không có mô tả"}</p>

        

            <div className="mt-auto pt-2">
              <p className="text-primary font-bold mb-2">{formatPrice(product.unitPrice)}</p>
              {product.stockQuantity !== undefined && (
                <p className={`text-sm font-medium ${product.stockQuantity > 0 ? "text-green-600" : "text-red-500"}`}>
                  {product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sp` : "Hết hàng"}
                </p>
              )}
            </div>
          </div>
          <div className="p-4 border-t flex justify-between gap-2">
            <Button size="sm" variant="outline" onClick={() => onViewBatches(product)}>
              <Eye className="w-4 h-4 mr-1" />
              Xem batch
            </Button>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(product)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage] = useState(10);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Batch modal states
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductBatches, setSelectedProductBatches] = useState<BatchInfo[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    unitPrice: "",
    categoryId: "",
    supplierId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"info" | "success" | "error" | "warning">("info");

  const productSearchFields: SearchField[] = [
    { value: "sku", label: "Mã SKU", type: "text", operator: "~" },
    { value: "name", label: "Tên sản phẩm", type: "text", operator: "~" },
    { value: "description", label: "Mô tả", type: "text", operator: "~" },
    { value: "unitPrice", label: "Giá bán", type: "number", operator: ":" },
  ];

  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    loadProducts(page);
  };

  const handleAutocompleteSearch = async (query: string): Promise<SearchResult[]> => {
    try {
      return (await productsApi.search(query)) as any;
    } catch (err) {
      console.error("Autocomplete search error:", err);
      return [];
    }
  };

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const loadProductBatchCounts = async (productIds: string[]): Promise<Record<string, number>> => {
    try {
      if (productIds.length === 0) {
        return {};
      }

      console.log("Loading batch counts for products:", productIds);
      const batches = await batchApi.getByProducts(productIds);
      console.log("Batch data received:", batches);

      const batchCounts: Record<string, number> = {};

      batches.forEach((batch: any) => {
        const batchProductId = String(batch.productId);
        if (!batchCounts[batchProductId]) {
          batchCounts[batchProductId] = 0;
        }
        batchCounts[batchProductId]++;
      });

      console.log("Final batch counts:", batchCounts);
      return batchCounts;
    } catch (err) {
      console.error("Error loading batch counts:", err);
      return {};
    }
  };

  const loadProducts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError("");
      const offset = (page - 1) * itemsPerPage;
      const sort = "-createdTime";
      const response = await productsApi.getAll({
        offset,
        limit: itemsPerPage,
        sort,
      });

      const elems = (response && (response as any).elements) || [];
      const productsData = elems.map((p: any) => ({
        id: String(p.id),
        sku: p.sku,
        name: p.name,
        description: p.desc ?? p.description ?? "",
        unitPrice: Number(p.unitPrice ?? 0),
        categoryId: p.categoryId ?? "",
        supplierId: p.supplierId ?? "",
        imageUrl: p.imageUrl ?? undefined,
        stockQuantity: p.stockQuantity ?? undefined,
        category: p.category ?? null,
        supplier: p.supplier ?? null,
      }));

      // Load batch counts for all products
      const productIds = productsData.map((p: Product) => p.id);
      const batchCounts = await loadProductBatchCounts(productIds);

      const productsWithBatchCounts = productsData.map((product: Product) => ({
        ...product,
        batchCount: batchCounts[product.id] || 0,
      }));

      setProducts(productsWithBatchCounts);
      setTotalElements(response?.totalElements ?? 0);
    } catch (err: any) {
      setError("Không thể tải danh sách sản phẩm");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBatches = async (product: Product) => {
    setSelectedProduct(product);
    setLoadingBatches(true);
    setIsBatchModalOpen(true);

    try {
      console.log("Loading batches for product:", product.id);
      const batches = await batchApi.getByProduct(product.id);
      console.log("Batches loaded:", batches);

      // Format dates from backend
      const formatDate = (dateValue: any): string => {
        if (!dateValue) return "";

        if (typeof dateValue === "string") return dateValue;

        if (typeof dateValue === "object" && dateValue.year) {
          const { year, month, day, hour = 0, minute = 0, second = 0 } = dateValue;
          return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second || 0).padStart(2, "0")}`;
        }

        return String(dateValue);
      };

      const formattedBatches: BatchInfo[] = (batches || []).map((batch: any) => ({
        id: String(batch.id),
        batchCode: batch.batchCode,
        manufactureDate: formatDate(batch.manufactureDate),
        expiryDate: formatDate(batch.expiryDate),
        originalQty: batch.originalQty || 0,
        importedPrice: batch.importedPrice,
        arrivalDate: batch.arrivalDate ? formatDate(batch.arrivalDate) : undefined,
      }));

      setSelectedProductBatches(formattedBatches);
    } catch (err) {
      console.error("Error loading batches:", err);
      setToastMessage("Không thể tải danh sách batch");
      setToastType("error");
      setShowToast(true);
      setSelectedProductBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      description: "",
      unitPrice: "",
      categoryId: "",
      supplierId: "",
    });
  };

  const validateForm = () => {
    if (!formData.sku?.trim()) {
      setToastMessage("Mã SKU là bắt buộc");
      setToastType("warning");
      setShowToast(true);
      return false;
    }
    if (!formData.name?.trim()) {
      setToastMessage("Tên sản phẩm là bắt buộc");
      setToastType("warning");
      setShowToast(true);
      return false;
    }
    const priceNum = Number(formData.unitPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setToastMessage("Giá bán không hợp lệ");
      setToastType("warning");
      setShowToast(true);
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError("");
      await productsApi.create({
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        unitPrice: formData.unitPrice,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
      });
      setToastMessage("Thêm sản phẩm thành công!");
      setToastType("success");
      setShowToast(true);
      setIsAddModalOpen(false);
      resetForm();
      await loadProducts(currentPage);
    } catch (err: any) {
      setError("Không thể thêm sản phẩm");
      console.error("Error adding product:", err);
      setToastMessage("Lỗi khi thêm sản phẩm!");
      setToastType("error");
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
      unitPrice: product.unitPrice?.toString() ?? "0",
      categoryId: String(product.categoryId ?? ""),
      supplierId: String(product.supplierId ?? ""),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError("");
      await productsApi.update(editingProduct.id, {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        unitPrice: formData.unitPrice,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
      });
      setToastMessage("Cập nhật sản phẩm thành công!");
      setToastType("success");
      setShowToast(true);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
      await loadProducts(currentPage);
    } catch (err: any) {
      setError("Không thể cập nhật sản phẩm");
      console.error("Error updating product:", err);
      setToastMessage("Lỗi khi cập nhật sản phẩm!");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (idOrProduct: string | Product) => {
    const id = typeof idOrProduct === "string" ? idOrProduct : idOrProduct.id;
    if (!window.confirm("Xác nhận xóa sản phẩm này?")) return;

    try {
      setError("");
      await productsApi.delete(id);
      setToastMessage("Xóa sản phẩm thành công!");
      setToastType("success");
      setShowToast(true);

      const newTotal = Math.max(0, totalElements - 1);
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      setCurrentPage(targetPage);
      await loadProducts(targetPage);
    } catch (err: any) {
      setError("Không thể xóa sản phẩm");
      console.error("Error deleting product:", err);
      setToastMessage("Lỗi khi xóa sản phẩm!");
      setToastType("error");
      setShowToast(true);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

const totalUnitPriceSum = products.reduce((s, p) => s + Number(p.unitPrice || 0), 0);

return (
  <Layout>
    <div className="space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-800">Quản lý Sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa và quản lý sản phẩm</p>
          </div>
        </div>
        
      {/* TOP search bar + actions (mimic screenshot) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* search bar full width */}
            <AutocompleteSearchBar
              searchFields={productSearchFields}
              onSearch={handleAutocompleteSearch}
              placeholder="Tìm kiếm theo tên khách hàng, mã đơn, sản phẩm..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setIsAddModalOpen(true)} className="ml-1">
              <Plus className="w-4 h-4 mr-1.5" />
              Tạo đơn hàng
            </Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-col justify-between min-h-[88px]">
            <div className="text-sm text-gray-500">Tổng sản phẩm</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{totalElements ?? products.length}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-col justify-between min-h-[88px]">
            <div className="text-sm text-gray-500">Đang hiển thị</div>
            <div className="mt-2 text-2xl font-bold text-blue-600">{products.length}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-col justify-between min-h-[88px]">
            <div className="text-sm text-gray-500">Trang hiện tại</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {currentPage}/{Math.max(1, Math.ceil((totalElements ?? 0) / itemsPerPage))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-col justify-between min-h-[88px]">
            <div className="text-sm text-gray-500">Tổng giá trị kho</div>
            <div className="mt-2 text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalUnitPriceSum)}
            </div>
          </div>
        </div>
      </div>


      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table or Grid */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Danh sách sản phẩm</div>
              <div className="text-sm text-gray-500">Tìm thấy {totalElements ?? products.length} kết quả</div>
            </div>
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">MÃ SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500"> ID SẢN PHẨM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">TÊN SẢN PHẨM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">NHÀ CUNG CẤP</th>
                  {/* <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">BATCH</th> */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">GIÁ BÁN</th>
                  {/* <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">TỒN</th> */}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">THAO TÁC</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Spinner className="w-8 h-8 text-gray-400 mx-auto" />
                      <div className="mt-2">Đang tải sản phẩm...</div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Chưa có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 align-top w-48">
                        <div className="font-medium text-gray-900 truncate">{p.sku}</div>
                        {/* <div className="text-xs text-gray-400 mt-1">ID: {p.id}</div> */}
                      </td>

                      <td className="px-6 py-4 align-top w-48">
                        <div className="font-medium text-gray-900 truncate">{p.id}</div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{p.description || "-"}</div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-gray-700">{p.supplier?.name ?? "-"}</div>
                      </td>
{/* 
                      <td className="px-6 py-4 text-center align-top">
                        <button
                          onClick={() => handleViewBatches(p)}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {p.batchCount ?? 0} batch
                        </button>
                      </td> */}

                      <td className="px-6 py-4 text-right align-top">
                        <div className="text-lg font-bold text-green-600">{formatPrice(Number(p.unitPrice || 0))}</div>
                      </td>

                      {/* <td className="px-6 py-4 text-center align-top">
                        {p.stockQuantity !== undefined ? (
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            p.stockQuantity > 0 ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                          }`}>
                            {p.stockQuantity > 0 ? `Còn ${p.stockQuantity}` : "Hết hàng"}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td> */}

                      <td className="px-6 py-4 text-center align-top">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewBatches(p)}
                            title="Xem batch"
                            className="p-2 rounded-md hover:bg-gray-100"
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>

                          <button
                            onClick={() => handleEdit(p)}
                            title="Sửa"
                            className="p-2 rounded-md hover:bg-gray-100"
                          >
                            <Pencil className="w-5 h-5 text-orange-500" />
                          </button>

                          <button
                            onClick={() => handleDelete(p)}
                            title="Xóa"
                            className="p-2 rounded-md hover:bg-gray-100"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          {/* <div className="px-6 py-4 border-t flex items-center justify-between"> */}
            {/* <div className="text-sm text-gray-500">
              Hiển thị {products.length} / {totalElements ?? products.length} sản phẩm
            </div> */}
            <div>
              {!loading && products.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil((totalElements ?? 0) / itemsPerPage))}
                  totalItems={totalElements ?? products.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </div>
          {/* </div> */}
        </div>
      ) : (
        /* Grid view (keeps your existing card grid) */
        <ProductCardGrid
          products={products}
          onEdit={handleEdit}
          onDelete={(p) => handleDelete(p)}
          onViewBatches={handleViewBatches}
        />
      )}

      {/* Batch Modal */}
      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setSelectedProduct(null);
          setSelectedProductBatches([]);
        }}
        product={selectedProduct}
        batches={selectedProductBatches}
        loading={loadingBatches}
      />

      {/* Add / Edit Modals kept unchanged below */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Thêm sản phẩm mới"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? "Đang thêm..." : "Thêm"}
            </Button>
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
        title="Chỉnh sửa sản phẩm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingProduct(null);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </>
        }
      >
        <ProductForm formData={formData} onChange={handleFormChange} readonlyFields={["sku"]} />
      </Modal>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  </Layout>
);
}