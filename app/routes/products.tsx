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
import { Grid as GridIcon, List as ListIcon, Pencil, Trash2, Plus, Calendar, AlertTriangle } from "lucide-react";

interface BatchInfo {
  id: string;
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  originalQty: number;
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
  selectedBatch?: BatchInfo | null; 
}

function ProductCardGrid({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
    if (daysLeft < 0) return { text: "Đã hết hạn", color: "text-red-600", bg: "bg-red-50" };
    if (daysLeft <= 7) return { text: `${daysLeft} ngày`, color: "text-orange-600", bg: "bg-orange-50" };
    if (daysLeft <= 30) return { text: `${daysLeft} ngày`, color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: `${daysLeft} ngày`, color: "text-green-600", bg: "bg-green-50" };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const nearestExpiry = product.batches && product.batches.length > 0 
          ? product.batches.reduce((nearest, batch) => 
              new Date(batch.expiryDate) < new Date(nearest.expiryDate) ? batch : nearest
            )
          : null;

        return (
          <div
            key={product.id}
            className="bg-surface rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col"
          >
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <div className="flex-1 p-4 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.description || "Không có mô tả"}
              </p>
              
              {/* Batch information */}
              {nearestExpiry && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>SX: {formatDate(nearestExpiry.manufactureDate)}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    <span className={getExpiryStatus(nearestExpiry.expiryDate).color}>
                      HSD: {formatDate(nearestExpiry.expiryDate)} 
                      ({getExpiryStatus(nearestExpiry.expiryDate).text})
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-2">
                <p className="text-primary font-bold mb-2">
                  {formatPrice(product.unitPrice)}
                </p>
                {product.stockQuantity !== undefined && (
                  <p
                    className={`text-sm font-medium ${
                      product.stockQuantity > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {product.stockQuantity > 0
                      ? `Còn ${product.stockQuantity} sp`
                      : "Hết hàng"}
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
                <Pencil className="w-4 h-4 mr-1" />
                Sửa
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(product)}>
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa
              </Button>
            </div>
          </div>
        );
      })}
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


const loadProductBatches = async (
  productIds: string[]
): Promise<{
  batchesByProduct: Record<string, BatchInfo[]>;
  selectedByProduct: Record<string, BatchInfo | null>;
}> => {
  try {
    if (productIds.length === 0) {
      return { batchesByProduct: {}, selectedByProduct: {} };
    }

    console.log('🔍 Loading batches for products:', productIds);
    const batches = await batchApi.getByProducts(productIds);
    console.log('📦 Raw batch data from API:', batches);

    const batchesByProduct: Record<string, BatchInfo[]> = {};
    const selectedByProduct: Record<string, BatchInfo | null> = {};

    // Helper function to format dates từ backend
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return '';
      
      // Nếu là string, return trực tiếp
      if (typeof dateValue === 'string') return dateValue;
      
      // Nếu là LocalDateTime object từ Java
      if (typeof dateValue === 'object' && dateValue.year) {
        const { year, month, day, hour = 0, minute = 0, second = 0 } = dateValue;
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second || 0).padStart(2, '0')}`;
        console.log('📅 Converted LocalDateTime:', dateValue, '→', formattedDate);
        return formattedDate;
      }
      
      return String(dateValue);
    };

    batches.forEach((batch) => {
      // Đảm bảo productId luôn là string để match với product.id
      const batchProductId = String(batch.productId);
      
      console.log(`📋 Processing batch ${batch.batchCode} for product ${batchProductId}:`, {
        originalProductId: batch.productId,
        convertedProductId: batchProductId,
        rawManufactureDate: batch.manufactureDate,
        rawExpiryDate: batch.expiryDate
      });
      
      if (!batchesByProduct[batchProductId]) {
        batchesByProduct[batchProductId] = [];
      }

      const processedBatch: BatchInfo = {
        id: batch.id,
        batchCode: batch.batchCode,
        manufactureDate: formatDate(batch.manufactureDate),
        expiryDate: formatDate(batch.expiryDate),
        originalQty: batch.originalQty || 0,
      };

      console.log(`✅ Processed batch:`, processedBatch);
      batchesByProduct[batchProductId].push(processedBatch);
    });

    console.log('📊 Final batches grouped by product:', batchesByProduct);

    // Select best batch for each product
    Object.keys(batchesByProduct).forEach((productId) => {
      const selected = selectBatchForDisplay(batchesByProduct[productId]);
      selectedByProduct[productId] = selected;
      console.log(`🎯 Selected batch for product ${productId}:`, selected ? selected.batchCode : 'none');
    });

    console.log('✅ Final selected batches by product:', selectedByProduct);
    return { batchesByProduct, selectedByProduct };
    
  } catch (err) {
    console.error("❌ Error loading batches:", err);
    return { batchesByProduct: {}, selectedByProduct: {} };
  }
};


const selectBatchForDisplay = (batches: BatchInfo[] | undefined): BatchInfo | null => {
  if (!batches || batches.length === 0) {
    console.log('🚫 No batches to select from');
    return null;
  }

  console.log('🔄 Selecting best batch from:', batches.length, 'batches');

  // Đơn giản hóa: Chọn batch với expiry date sớm nhất (FIFO)
  const validBatches = batches.filter(batch => {
    const expiryDate = new Date(batch.expiryDate);
    const isValidDate = !isNaN(expiryDate.getTime());
    
    console.log(`📅 Batch ${batch.batchCode}: expiry=${batch.expiryDate}, valid=${isValidDate}`);
    return isValidDate;
  });

  if (validBatches.length === 0) {
    // Nếu không có batch nào có ngày hợp lệ, lấy batch đầu tiên
    console.log('⚠️ No batches with valid expiry dates, selecting first batch');
    return batches[0];
  }

  // Sắp xếp theo expiry date và lấy cái sớm nhất
  const sortedBatches = validBatches.sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  const selected = sortedBatches[0];
  console.log(`✅ Selected batch: ${selected.batchCode} (expires: ${selected.expiryDate})`);
  
  return selected;
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
      const productIds = productsData.map((p: Product) => p.id);
      const { batchesByProduct, selectedByProduct } = await loadProductBatches(productIds);

      const productsWithBatches = productsData.map((product: Product) => ({
        ...product,
        batches: batchesByProduct[product.id] || [],
        selectedBatch: selectedByProduct[product.id] || null,
      }));

      setProducts(productsWithBatches);


      setTotalElements(response?.totalElements ?? 0);
    } catch (err: any) {
      setError("Không thể tải danh sách sản phẩm");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

const renderExpiryInfo = (product: Product) => {
  console.log('🎨 Rendering expiry for product:', product.id, product.selectedBatch);
  
  const b = product.selectedBatch;
  if (!b) {
    console.log('❌ No selected batch for product:', product.id);
    return <span className="text-gray-400">-</span>;
  }

  const expiry = new Date(b.expiryDate);
  if (isNaN(expiry.getTime())) {
    console.log('❌ Invalid expiry date for batch:', b.expiryDate);
    return <span className="text-gray-400">Ngày không hợp lệ</span>;
  }

  const daysLeft = getDaysUntilExpiry(b.expiryDate);
  console.log('📊 Days until expiry:', daysLeft);
  
  const statusColor =
    daysLeft < 0 ? "text-red-600" :
    daysLeft <= 7 ? "text-orange-500" : "text-green-600";
  const bgColor =
    daysLeft < 0 ? "bg-red-100" :
    daysLeft <= 7 ? "bg-orange-100" : "bg-green-100";

  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-700">{formatDate(b.expiryDate)}</div>
      <div className={`text-xs px-2 py-1 rounded-full ${bgColor} ${statusColor} inline-block`}>
        {daysLeft < 0 ? "Đã hết hạn" : `Còn ${daysLeft} ngày`}
      </div>
    </div>
  );
};

const renderManufactureInfo = (product: Product) => {
  console.log('🏭 Rendering manufacture for product:', product.id, product.selectedBatch);
  
  const b = product.selectedBatch;
  if (!b) {
    console.log('❌ No selected batch for product:', product.id);
    return <span className="text-gray-400">-</span>;
  }

  const manu = new Date(b.manufactureDate);
  if (isNaN(manu.getTime())) {
    console.log('❌ Invalid manufacture date for batch:', b.manufactureDate);
    return <span className="text-gray-400">Ngày không hợp lệ</span>;
  }

  return (
    <div className="text-sm text-gray-700">
      {formatDate(b.manufactureDate)}
    </div>
  );
};


  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
            <p className="text-gray-600">Thêm, sửa, xóa và quản lý sản phẩm</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "primary" : "outline"}
                onClick={() => setViewMode("table")}
                size="sm"
              >
                <ListIcon className="w-4 h-4 mr-2" />
                Bảng
              </Button>
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                onClick={() => setViewMode("grid")}
                size="sm"
              >
                <GridIcon className="w-4 h-4 mr-2" />
                Card
              </Button>
            </div>

            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới sản phẩm
            </Button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

        <AutocompleteSearchBar
          searchFields={productSearchFields}
          onSearch={handleAutocompleteSearch}
          placeholder="Tìm kiếm sản phẩm..."
        />

        {viewMode === "table" ? (
          <DataTable
            data={products}
            columns={[
              {
                key: "sku",
                label: "Mã SKU",
                render: (value) => <span className="font-medium text-gray-900">{value}</span>,
              },
              {
                key: "name",
                label: "Tên sản phẩm",
                render: (value) => <span className="text-gray-900">{value}</span>,
              },
              {
                key: "description",
                label: "Mô tả",
                render: (value) => <span className="text-gray-600">{value}</span>,
              },
              {
                key: "unitPrice",
                label: "Giá bán",
                render: (value) => <span className="text-gray-900">{formatPrice(Number(value))}</span>,
              },
              {
                key: "supplier.name",
                label: "Nhà cung cấp",
                render: (value, item) => <span className="text-gray-700">{item.supplier?.name ?? "-"}</span>,
              },
              {
                key: "selectedBatch.manufactureDate",
                label: "Ngày sản xuất",
                render: (value, item) => renderManufactureInfo(item),
              },
              {
                key: "selectedBatch.expiryDate",
                label: "Ngày hết hạn",
                render: (value, item) => renderExpiryInfo(item),
              },

            ]}
            actions={[
              {
                label: "Sửa",
                variant: "outline",
                onClick: handleEdit,
              },
              {
                label: "Xóa",
                variant: "danger",
                onClick: (product) => handleDelete(product.id),
              },
            ]}
            loading={loading}
            emptyMessage="Chưa có sản phẩm nào"
          />
        ) : (
          <ProductCardGrid
            products={products}
            onEdit={handleEdit}
            onDelete={(p) => handleDelete(p)}
          />
        )}

        {!loading && products.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(totalElements / itemsPerPage))}
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

        {/* Edit Modal */}
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
      </div>

      {showToast && (
        <Toast
          className={"mt-6"}
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </Layout>
  );
}