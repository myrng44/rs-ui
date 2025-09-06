import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Search, ShoppingCart } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import Dropdown from '../Dropdown';
import { ordersApi, productsApi, paymentMethodApi } from '~/utils/api';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderLine {
  productId: string;
  productName: string;
  unitPrice: number;
  qtyOrdered: number;
  totalPrice: number;
}

interface FormData {
  customerId: string;
  storeId: string;
  voucherId: string;
  note: string;
  paymentId: string;
  lines: OrderLine[];
}

interface PaymentMethod {
  id: string;
  code: string;
  name: string;
}

interface Product {
  description: string;
  displayText: string;
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
  categoryId: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    customerId: '',
    storeId: '',
    voucherId: '',
    note: '',
    paymentId: '',
    lines: []
  });

const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
const [searchResults, setSearchResults] = useState<Product[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [productSearch, setProductSearch] = useState('');
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});

  // Load payment methods
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentMethodApi.getAll();
      setPaymentMethods(response.elements);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await productsApi.search(query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearch(value);
    searchProducts(value);
  };

const addProduct = (product: any) => {
  // Đảm bảo productId là string
  const productId = product.id.toString();
  const existingLine = formData.lines.find(line => line.productId === productId);
  
  if (existingLine) {
    updateLineQuantity(productId, existingLine.qtyOrdered + 1);
  } else {
    const newLine: OrderLine = {
      productId: productId,
      productName: product.name,
      unitPrice: product.unitPrice,
      qtyOrdered: 1,
      totalPrice: product.unitPrice
    };

    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }));
  }

  setProductSearch('');
  setSearchResults([]);
};

  const updateLineQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeLine(productId);
      return;
    }

    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map(line => 
        line.productId === productId 
          ? { ...line, qtyOrdered: quantity, totalPrice: line.unitPrice * quantity }
          : line
      )
    }));
  };

  const removeLine = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter(line => line.productId !== productId)
    }));
  };

  const calculateTotal = () => {
    return formData.lines.reduce((sum, line) => sum + line.totalPrice, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId.trim()) {
      newErrors.customerId = 'Vui lòng nhập mã khách hàng';
    }

    if (!formData.storeId.trim()) {
      newErrors.storeId = 'Vui lòng chọn cửa hàng';
    }

    if (!formData.paymentId.trim()) {
      newErrors.paymentId = 'Vui lòng chọn phương thức thanh toán';
    }

    if (formData.lines.length === 0) {
      newErrors.lines = 'Vui lòng thêm ít nhất một sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
await ordersApi.create({
  customerId: formData.customerId,
  storeId: parseInt(formData.storeId), // Backend expect Long
  voucherId: formData.voucherId ? parseInt(formData.voucherId) : null,
  note: formData.note,
  paymentId: parseInt(formData.paymentId),
  lines: formData.lines.map(line => ({
    productId: parseInt(line.productId),
    qtyOrdered: line.qtyOrdered,
    unitPrice: line.unitPrice
  }))
});

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      storeId: '',
      voucherId: '',
      note: '',
      paymentId: '',
      lines: []
    });
    setProductSearch('');
    setSearchResults([]);
    setErrors({});
  };

  if (!isOpen) return null;

  const paymentOptions = [
    { label: 'Chọn phương thức thanh toán', value: '' },
    ...paymentMethods.map((pm: any) => ({ label: pm.name, value: pm.name }))
  ];

  const storeOptions = [
    { label: 'Chọn cửa hàng', value: '' },
    { label: 'Cửa hàng Chính', value: '1' },
    { label: 'Chi nhánh Quận 1', value: '2' },
    { label: 'Chi nhánh Quận 3', value: '3' }
  ];

  return (
      <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Tạo đơn hàng mới
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer and Store Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã khách hàng"
              value={formData.customerId}
              onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
              placeholder="Nhập mã khách hàng"
              required
              error={errors.customerId}
            />

            <Dropdown
              label="Cửa hàng"
              value={formData.storeId}
              onChange={(e) => setFormData(prev => ({ ...prev, storeId: e.target.value }))}
              options={storeOptions}
              required
              error={errors.storeId}
            />
          </div>

          {/* Voucher and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã voucher (tùy chọn)"
              value={formData.voucherId}
              onChange={(e) => setFormData(prev => ({ ...prev, voucherId: e.target.value }))}
              placeholder="Nhập mã voucher"
            />

            <Dropdown
              label="Phương thức thanh toán"
              value={formData.paymentId}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentId: e.target.value }))}
              options={paymentOptions}
              required
              error={errors.paymentId}
            />
          </div>

          {/* Product Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thêm sản phẩm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên, mã SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={productSearch}
                onChange={handleProductSearch}
              />
              
              {/* Search Results */}
              {(searchResults.length > 0 || isSearching) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Đang tìm kiếm...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product: any) => (
                      <button
                        key={product.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => addProduct(product)}
                      >
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.sku} - {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(product.unitPrice)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.lines && <p className="text-xs text-red-600 mt-1">{errors.lines}</p>}
          </div>

          {/* Order Lines */}
          {formData.lines.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Sản phẩm đã chọn ({formData.lines.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Sản phẩm
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Đơn giá
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thành tiền
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.lines.map((line) => (
                      <tr key={line.productId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{line.productName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="p-1 hover:bg-gray-200 rounded"
                              onClick={() => updateLineQuantity(line.productId, line.qtyOrdered + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(line.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(line.totalPrice)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                            onClick={() => removeLine(line.productId)}
                            title="Xóa sản phẩm"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Tổng cộng:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(calculateTotal())}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập ghi chú cho đơn hàng..."
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.lines.length === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Tạo đơn hàng
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;