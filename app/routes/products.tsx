
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Pagination } from '~/components/Pagination';
import { ProductForm } from '~/components/products/ProductForm';
import { productsApi, batchApi } from '~/utils/api';
import AutocompleteSearchBar, { type SearchField, type SearchResult } from '~/components/AutoCompleteSearchBar';
import { Toast } from '~/components/Toast';
import {
  Grid as GridIcon,
  List as ListIcon,
  Pencil,
  Trash2,
  Plus,
  Eye,
  Calendar,
  AlertTriangle,
  Package,
  X,
  Grid3X3,
  Maximize2,
} from 'lucide-react';

// --- Types -------------------------------------------------
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
  imageUrl?: string;
  stockQuantity?: number;
  category?: { name?: string } | null;
  batches?: BatchInfo[];
  batchCount?: number;
}

// ----------------- Small helpers ---------------------------
const Spinner = ({ className = '' }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

// ----------------- BatchModal (kept as component) ----------
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
  const [batchViewMode, setBatchViewMode] = useState<'compact' | 'detailed' | 'grid'>('detailed');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

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

  // Compact Table View
  const CompactTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch Code</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày SX</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hết hạn</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Giá nhập</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {batches.map((batch) => {
            const expiryStatus = getExpiryStatus(batch.expiryDate);
            const isExpanded = expandedBatch === batch.id;
            
            return (
              <React.Fragment key={batch.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{batch.batchCode}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{batch.originalQty?.toLocaleString() || 0}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{formatDate(batch.manufactureDate)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${expiryStatus.bg} ${expiryStatus.color}`}>
                      {expiryStatus.text}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{batch.importedPrice ? formatPrice(batch.importedPrice) : '-'}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => setExpandedBatch(isExpanded ? null : batch.id)}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={6} className="px-3 py-3 bg-gray-50">
                      <div className="text-sm space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Ngày sản xuất:</span> {formatDate(batch.manufactureDate)}
                          </div>
                          <div>
                            <span className="font-medium">Ngày hết hạn:</span> {formatDate(batch.expiryDate)}
                          </div>
                          <div>
                            <span className="font-medium">Ngày nhập kho:</span> {formatDate(batch.arrivalDate || "")}
                          </div>
                          <div>
                            <span className="font-medium">Trạng thái:</span> 
                            <span className={`ml-1 ${expiryStatus.color}`}>{expiryStatus.text}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Grid View
  const GridView = () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {batches.map((batch) => {
        const expiryStatus = getExpiryStatus(batch.expiryDate);
        return (
          <div key={batch.id} className={`border rounded-lg p-3 ${expiryStatus.bg}`}>
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-semibold text-sm text-gray-900 truncate">{batch.batchCode}</h5>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${expiryStatus.bg} ${expiryStatus.color}`}>
                {expiryStatus.text}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>SL: <span className="font-medium">{batch.originalQty?.toLocaleString() || 0}</span></div>
              <div>SX: <span className="font-medium">{formatDate(batch.manufactureDate)}</span></div>
              <div>HSD: <span className="font-medium">{formatDate(batch.expiryDate)}</span></div>
              {batch.importedPrice && (
                <div>Giá: <span className="font-medium">{formatPrice(batch.importedPrice)}</span></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Detailed View
  const DetailedView = () => (
    <div className="space-y-3">
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
  );

  // Fullscreen Modal Component
  const FullscreenModal = () => {
    if (!showFullscreen) return null;
    
    return (
      <div className="fixed inset-0 z-[60] bg-white">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div>
              <h2 className="text-2xl font-semibold">Danh sách Batch - {product?.name}</h2>
              <p className="text-gray-500">SKU: {product?.sku} | Tổng: {batches.length} batch</p>
            </div>
            <button
              onClick={() => setShowFullscreen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
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
              <DetailedView />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!product) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Danh sách Batch - ${product.name}`}>
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
            <>
              {/* View Mode Controls */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Danh sách Batch ({batches.length})</h4>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => setBatchViewMode('compact')}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        batchViewMode === 'compact' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Bảng thu gọn"
                    >
                      {/* <List className="w-3 h-3" /> */}
                    </button>
                    <button
                      onClick={() => setBatchViewMode('grid')}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        batchViewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Lưới"
                    >
                      <Grid3X3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setBatchViewMode('detailed')}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        batchViewMode === 'detailed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Chi tiết"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors"
                    title="Toàn màn hình"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Dynamic Content */}
              <div className={`${batchViewMode === 'detailed' ? 'max-h-[50vh]' : 'max-h-[60vh]'} overflow-y-auto`}>
                {batchViewMode === 'compact' && <CompactTableView />}
                {batchViewMode === 'grid' && <GridView />}
                {batchViewMode === 'detailed' && <DetailedView />}
              </div>
            </>
          )}
        </div>
      </Modal>

      <FullscreenModal />
    </>
  );
}

// ----------------- ProductCardGrid (kept) ------------------
function ProductCardGrid({ products, onEdit, onDelete, onViewBatches }: { products: Product[]; onEdit: (p: Product) => void; onDelete: (p: Product) => void; onViewBatches: (p: Product) => void; }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-surface rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-gray-400">No Image</span>}
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description || 'Không có mô tả'}</p>

            <div className="mt-auto pt-2">
              <p className="text-primary font-bold mb-2">{formatPrice(product.unitPrice)}</p>
              {product.stockQuantity !== undefined && (
                <p className={`text-sm font-medium ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>{product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sp` : 'Hết hàng'}</p>
              )}
            </div>
          </div>
          <div className="p-4 border-t flex justify-between gap-2">
            <Button size="sm" variant="outline" onClick={() => onViewBatches(product)}>
              <Eye className="w-4 h-4 mr-1" /> 
            </Button>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(product)}><Pencil className="w-4 h-4"/></Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(product)}><Trash2 className="w-4 h-4"/></Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ----------------- ProductsTable (new, sortable) -----------
function ProductsTable({
  products,
  loading,
  onViewBatches,
  onEdit,
  onDelete,
  sortBy,
  onSort,
}: {
  products: Product[];
  loading: boolean;
  onViewBatches: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  sortBy: string;
  onSort: (field: string) => void;
}) {
  const getSortIcon = (field: string) => {
    if (sortBy === field) return ' ↑';
    if (sortBy === `-${field}`) return ' ↓';
    return '';
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => onSort('sku')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                MÃ SKU{getSortIcon('sku')}
              </th>

              <th
                onClick={() => onSort('id')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                ID{getSortIcon('id')}
              </th>

              <th
                onClick={() => onSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                TÊN{getSortIcon('name')}
              </th>

              <th
                onClick={() => onSort('unitPrice')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                GIÁ BÁN{getSortIcon('unitPrice')}
              </th>

              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                THAO TÁC
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <Spinner className="w-8 h-8 text-gray-400 mx-auto" />
                  <div className="mt-2">Đang tải sản phẩm...</div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.sku}</div>
                  </td>

                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.id}</div>
                  </td>

                  <td className="px-6 py-3 whitespace-normal">
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description || '-'}</div>
                  </td>

                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatPrice(Number(p.unitPrice || 0))}</div>
                    </td>
                    
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewBatches(p)}
                        title="Xem batch"
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </button>

                      <button onClick={() => onEdit(p)} title="Sửa" className="p-1 rounded-md hover:bg-gray-100">
                        <Pencil className="h-4 w-4 text-orange-500" />
                      </button>

                      <button onClick={() => onDelete(p)} title="Xóa" className="p-1 rounded-md hover:bg-gray-100">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

 
// ----------------- Main Products Page ---------------------
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Batch modal states
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductBatches, setSelectedProductBatches] = useState<BatchInfo[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Add/Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ sku: '', name: '', description: '', unitPrice: '', categoryId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'error' | 'warning'>('info');

  // search + sort
  const [searchText, setSearchText] = useState<string>(''); // raw query
  const [sortBy, setSortBy] = useState<string>('-createdTime');

  const productSearchFields: SearchField[] = useMemo(() => [
    { value: 'sku', label: 'Mã SKU', type: 'text', operator: '~' },
    { value: 'name', label: 'Tên sản phẩm', type: 'text', operator: '~' },
  ], []);

  useEffect(() => {
    try {
      const v = localStorage.getItem('products_view');
      if (v === 'table' || v === 'grid') setViewMode(v as any);
    } catch (e) {}
  }, []);

  const changeView = (v: 'table' | 'grid') => {
    setViewMode(v);
    try { localStorage.setItem('products_view', v); } catch (e) {}
  };

  // load products (now respects sortBy)
  const loadProductBatchCounts = useCallback(async (productIds: string[]): Promise<Record<string, number>> => {
    try {
      if (productIds.length === 0) return {};
      const batches = await batchApi.getByProducts(productIds);
      const batchCountsMap: Record<string, Set<string>> = {};
      (batches || []).forEach((batch: any) => {
        const prodId = String(batch.productId ?? batch.product_id ?? (batch.batchItem?.productId ?? ''));
        if (!prodId) return;
        const batchItemId = batch.batchItemId ?? batch.batch_item_id ?? batch.id ?? batch.batchId ?? batch.batch_id;
        const key = String(prodId);
        if (!batchCountsMap[key]) batchCountsMap[key] = new Set<string>();
        batchCountsMap[key].add(String(batchItemId ?? `${batch.batchCode ?? Math.random()}`));
      });
      const result: Record<string, number> = {};
      Object.keys(batchCountsMap).forEach(k => { result[k] = batchCountsMap[k].size; });
      return result;
    } catch (err) {
      console.error('Error loading batch counts:', err);
      return {};
    }
  }, []);

  const loadProducts = useCallback(async (page: number = currentPage, queryText: string = '') => {
    try {
      setLoading(true);
      setError('');
      const offset = (page - 1) * itemsPerPage;
      const apiParams: any = { offset, limit: itemsPerPage, sort: sortBy };
      if (queryText && queryText.trim()) apiParams.query = queryText.includes('~') || queryText.includes('=') ? queryText : `name~${queryText}`;

      const response = await productsApi.getAll(apiParams);
      const elems = (response && (response as any).elements) || [];
      const productsData = elems.map((p: any) => ({ id: String(p.id), sku: p.sku, name: p.name, description: p.desc ?? p.description ?? '', unitPrice: Number(p.unitPrice ?? 0), categoryId: p.categoryId ?? '', imageUrl: p.imageUrl ?? undefined, stockQuantity: p.stockQuantity ?? undefined, category: p.category ?? null }));

      const productIds = productsData.map((p: Product) => p.id);
      const batchCounts = await loadProductBatchCounts(productIds);

      const productsWithBatchCounts = productsData.map((product: Product) => ({
        ...product,
        batchCount: batchCounts[product.id] || 0,
      }));
      setProducts(productsWithBatchCounts);
      setTotalElements(response?.totalElements ?? 0);
    } catch (err: any) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, loadProductBatchCounts, sortBy]);

  // watch searchText, sortBy and reload
  useEffect(() => {
    setCurrentPage(1);
    loadProducts(1, searchText);
  }, [searchText, sortBy, loadProducts]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    loadProducts(page, searchText);
  }, [loadProducts, searchText]);

  const handleAutocompleteSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    try { return (await productsApi.search(query)) as any; } catch (err) { console.error('Autocomplete search error:', err); return []; }
  }, []);

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); }, []);

  const handleViewBatches = useCallback(async (product: Product) => {
    setSelectedProduct(product);
    setLoadingBatches(true);
    setIsBatchModalOpen(true);
    try {
      const batches = await batchApi.getByProduct(product.id);
      const formatDate = (dateValue: any): string => {
        if (!dateValue) return '';
        if (typeof dateValue === 'string') return dateValue;
        if (typeof dateValue === 'object' && (dateValue.year || dateValue.month || dateValue.day)) {
          const { year, month, day, hour = 0, minute = 0, second = 0 } = dateValue;
          return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:${String(second||0).padStart(2,'0')}`;
        }
        return String(dateValue);
      };
      const formattedBatches: BatchInfo[] = (batches || []).map((batch: any, index: number) => {
        const batchCode = batch.batchCode ?? batch.batch_code ?? (batch.batch?.batchCode ?? batch.batch?.batch_code ?? '');
        const batchItemId = batch.batchItemId ?? batch.batch_item_id ?? batch.id ?? batch.batchId ?? batch.batch_id ?? `${batchCode}-${index}`;
        const manufactureDate = batch.manufactureDate ?? batch.manufacture_date ?? (batch.batch?.manufactureDate ?? batch.batch?.manufacture_date);
        const expiryDate = batch.expiryDate ?? batch.expiry_date ?? (batch.batch?.expiryDate ?? batch.batch?.expiry_date);
        const arrivalDate = batch.arrivalDate ?? batch.arrival_date ?? (batch.batch?.arrivalDate ?? batch.batch?.arrival_date);
        const importedPrice = batch.importedPrice ?? batch.import_price ?? batch.itemImportPrice ?? (batch.batchItem?.importPrice ?? batch.batch?.import_price);
        const qty = batch.itemQty ?? batch.qty ?? batch.originalQty ?? batch.original_qty ?? 0;
        return { id: String(batchItemId), batchCode, manufactureDate: formatDate(manufactureDate), expiryDate: formatDate(expiryDate), originalQty: Number(qty ?? 0), importedPrice: importedPrice ?? undefined, arrivalDate: arrivalDate ? formatDate(arrivalDate) : undefined } as BatchInfo;
      });
      setSelectedProductBatches(formattedBatches);
    } catch (err) {
      console.error('Error loading batches:', err);
      setToastMessage('Không thể tải danh sách batch'); setToastType('error'); setShowToast(true); setSelectedProductBatches([]);
    } finally { setLoadingBatches(false); }
  }, []);

  const resetForm = () => setFormData({ sku: '', name: '', description: '', unitPrice: '', categoryId: '' });

  // add / edit / delete handlers (same logic as before) ... (kept concise)
  const validateForm = useCallback(() => {
    if (!formData.sku?.trim()) { setToastMessage('Mã SKU là bắt buộc'); setToastType('warning'); setShowToast(true); return false; }
    if (!formData.name?.trim()) { setToastMessage('Tên sản phẩm là bắt buộc'); setToastType('warning'); setShowToast(true); return false; }
    const priceNum = Number(formData.unitPrice);
    if (isNaN(priceNum) || priceNum < 0) { setToastMessage('Giá bán không hợp lệ'); setToastType('warning'); setShowToast(true); return false; }
    return true;
  }, [formData]);

  const handleAdd = useCallback(async () => {
    if (!validateForm()) return;
    try { setIsSubmitting(true); setError(''); await productsApi.create({ sku: formData.sku, name: formData.name, description: formData.description, unitPrice: formData.unitPrice, categoryId: formData.categoryId }); setToastMessage('Thêm sản phẩm thành công!'); setToastType('success'); setShowToast(true); setIsAddModalOpen(false); resetForm(); await loadProducts(1, searchText); } catch (err:any) { setError('Không thể thêm sản phẩm'); setToastMessage('Lỗi khi thêm sản phẩm!'); setToastType('error'); setShowToast(true); } finally { setIsSubmitting(false); } }, [formData, loadProducts, searchText, validateForm]);

  const handleEdit = useCallback((product: Product) => { setEditingProduct(product); setFormData({ sku: product.sku, name: product.name, description: product.description, unitPrice: product.unitPrice?.toString() ?? '0', categoryId: String(product.categoryId ?? '') }); setIsEditModalOpen(true); }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingProduct) return; if (!validateForm()) return;
    try { setIsSubmitting(true); setError(''); await productsApi.update(editingProduct.id, { sku: formData.sku, name: formData.name, description: formData.description, unitPrice: formData.unitPrice, categoryId: formData.categoryId }); setToastMessage('Cập nhật sản phẩm thành công!'); setToastType('success'); setShowToast(true); setIsEditModalOpen(false); setEditingProduct(null); resetForm(); await loadProducts(currentPage, searchText); } catch (err:any) { setError('Không thể cập nhật sản phẩm'); setToastMessage('Lỗi khi cập nhật sản phẩm!'); setToastType('error'); setShowToast(true); } finally { setIsSubmitting(false); } }, [currentPage, editingProduct, formData, loadProducts, searchText, validateForm]);

  const handleDelete = useCallback(async (idOrProduct: string | Product) => {
    const id = typeof idOrProduct === 'string' ? idOrProduct : idOrProduct.id;
    if (!window.confirm('Xác nhận xóa sản phẩm này?')) return;
    try { setError(''); await productsApi.delete(id); setToastMessage('Xóa sản phẩm thành công!'); setToastType('success'); setShowToast(true); const newTotal = Math.max(0, (totalElements || 0) - 1); const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage)); const targetPage = currentPage > maxPage ? maxPage : currentPage; setCurrentPage(targetPage); await loadProducts(targetPage, searchText); } catch (err:any) { setError('Không thể xóa sản phẩm'); setToastMessage('Lỗi khi xóa sản phẩm!'); setToastType('error'); setShowToast(true); } }, [currentPage, itemsPerPage, loadProducts, searchText, totalElements]);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const totalUnitPriceSum = products.reduce((s, p) => s + Number(p.unitPrice || 0), 0);
  const handleSearchSubmit = useCallback((query: string) => { setSearchText(query); setCurrentPage(1); }, []);

  // Sort handler (toggle like OrdersTable)
  const handleSort = useCallback((field: string) => {
    setSortBy(prev => (prev === field ? `-${field}` : prev === `-${field}` ? field : field));
    setCurrentPage(1);
  }, []);

  // initial load
  useEffect(() => { setCurrentPage(1); loadProducts(1, searchText); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-800">Quản lý Sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa và quản lý sản phẩm</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <AutocompleteSearchBar searchFields={productSearchFields} onSearch={handleAutocompleteSearch} onSubmit={handleSearchSubmit} placeholder="Tìm kiếm theo SKU / tên / mô tả..." />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddModalOpen(true)} className="ml-1"><Plus className="w-4 h-4 mr-1.5"/>Tạo sản phẩm</Button>
                <div className="inline-flex items-center rounded-md bg-gray-50 p-1 border border-gray-100">
                  <button onClick={() => changeView('table')} title="Danh sách" className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}><ListIcon className="w-5 h-5"/></button>
                  <button onClick={() => changeView('grid')} title="Lưới" className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}><GridIcon className="w-5 h-5"/></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> 
            <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-col justify-between min-h-[88px]"><div className="text-sm text-gray-500">Tổng sản phẩm</div><div className="mt-2 text-2xl font-bold text-gray-900">{totalElements ?? products.length}</div></div>
            <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-col justify-between min-h-[88px]"><div className="text-sm text-gray-500">Đang hiển thị</div><div className="mt-2 text-2xl font-bold text-blue-600">{products.length}</div></div>
            <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-col justify-between min-h-[88px]"><div className="text-sm text-gray-500">Trang hiện tại</div><div className="mt-2 text-2xl font-bold text-gray-900">{currentPage}/{Math.max(1, Math.ceil((totalElements ?? 0) / itemsPerPage))}</div></div>
            <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-col justify-between min-h-[88px]"><div className="text-sm text-gray-500">Tổng giá trị kho</div><div className="mt-2 text-2xl font-bold text-green-600">{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(totalUnitPriceSum)}</div></div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

        {viewMode === 'table' ? (
          <div>
            <ProductsTable products={products} loading={loading} onViewBatches={handleViewBatches} onEdit={handleEdit} onDelete={handleDelete} sortBy={sortBy} onSort={handleSort} />
            <div className="mt-4">{!loading && products.length > 0 && <Pagination currentPage={currentPage} totalPages={Math.max(1, Math.ceil((totalElements ?? 0)/itemsPerPage))} totalItems={totalElements ?? products.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} loading={loading} />}</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between"><div className="text-sm text-gray-600">Danh sách sản phẩm</div><div className="text-sm text-gray-500">Tìm thấy {totalElements ?? products.length} kết quả</div></div>
            <div className="p-6">{loading ? (<div className="text-center py-12"><Spinner className="w-10 h-10 text-gray-400 mx-auto" /><div className="mt-3 text-gray-600">Đang tải sản phẩm...</div></div>) : products.length === 0 ? (<div className="text-center py-12 text-gray-500">Chưa có sản phẩm nào</div>) : (<ProductCardGrid products={products} onEdit={handleEdit} onDelete={p => handleDelete(p)} onViewBatches={handleViewBatches} />)}</div>
            <div className="px-6 py-4">{!loading && products.length > 0 && <Pagination currentPage={currentPage} totalPages={Math.max(1, Math.ceil((totalElements ?? 0)/itemsPerPage))} totalItems={totalElements ?? products.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} loading={loading} />}</div>
          </div>
        )}

        <BatchModal isOpen={isBatchModalOpen} onClose={() => { setIsBatchModalOpen(false); setSelectedProduct(null); setSelectedProductBatches([]); }} product={selectedProduct} batches={selectedProductBatches} loading={loadingBatches} />

        {/* Add / Edit Modals */}
        <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title="Thêm sản phẩm mới" footer={<><Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }} disabled={isSubmitting}>Hủy</Button><Button onClick={handleAdd} disabled={isSubmitting}>{isSubmitting ? 'Đang thêm...' : 'Thêm'}</Button></>}>
          <ProductForm formData={formData} onChange={handleFormChange} />
        </Modal>

        <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingProduct(null); resetForm(); }} title="Chỉnh sửa sản phẩm" footer={<><Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); resetForm(); }} disabled={isSubmitting}>Hủy</Button><Button onClick={handleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}</Button></>}>
          <ProductForm formData={formData} onChange={handleFormChange} readonlyFields={["sku"]} />
        </Modal>

        {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
      </div>
    </Layout>
  );
}
