import { useState, useEffect } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import Dropdown from './Dropdown';
import { productsApi, paymentMethodApi } from '~/utils/api';

export interface OrderProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface OrderFormData {
  customerId?: string;
  storeId: string;
  voucherCode?: string;
  note?: string;
  paymentId: string;
}

interface OrderFormWithProductsProps {
  formData: OrderFormData;
  products: OrderProduct[];
  onChange: (field: keyof OrderFormData, value: string) => void;
  onProductsChange: (products: OrderProduct[]) => void;
  readonlyField?: Array<keyof OrderFormData>;
}

export function OrderFormWithProducts({
                                        formData,
                                        products,
                                        onChange,
                                        onProductsChange,
                                        readonlyField = [],
                                      }: OrderFormWithProductsProps) {
  const [availableProducts, setAvailableProducts] = useState<Array<{ value: string; label: string; unitPrice?: number }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  useEffect(() => {
    loadProducts();
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    const seen = new Set<string>();
    let changed = false;
    const normalized = products.map((p) => {
      let pid = p.id || '';
      if (!pid || seen.has(pid)) {
        changed = true;
        pid = `tmp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      }
      seen.add(pid);
      return { ...p, id: pid };
    });
    if (changed) onProductsChange(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productsApi.getAll({ limit: 100 });
      setAvailableProducts(
        response.elements.map(product => ({
          value: product.id,
          label: `${product.name} (${product.sku})`,
          unitPrice: product.unitPrice ?? 0,
        }))
      );
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await paymentMethodApi.getAll();
      setPaymentMethods(
        response.elements.map(method => ({
          value: method.id,
          label: method.name,
        }))
      );
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const addProduct = () => {
    const newProduct: OrderProduct = {
      id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    onProductsChange([...products, newProduct]);
  };

  const updateProduct = (id: string, field: keyof OrderProduct, value: any) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        let updatedProduct = { ...product, [field]: value };

        /**
         * Update product name when productId changes
         */
        if (field === 'productId') {
          const selectedProduct = availableProducts.find(p => p.value === value);
          updatedProduct.productName = selectedProduct ? selectedProduct.label : '';
          updatedProduct.unitPrice = selectedProduct?.unitPrice ?? updatedProduct.unitPrice ?? 0;
          updatedProduct.totalPrice = (updatedProduct.unitPrice || 0) * (updatedProduct.quantity || 0);
        }

        if (field === 'quantity') {
          updatedProduct.totalPrice = (updatedProduct.unitPrice || 0) * (updatedProduct.quantity || 0);
        }

        return updatedProduct;
      }
      return product;
    });
    onProductsChange(updatedProducts);
  };

  const removeProduct = (id: string) => {
    onProductsChange(products.filter(product => product.id !== id));
  };

  const totalSummary = products.reduce((acc, p) => ({
    count: acc.count + 1,
    qty: acc.qty + (p.quantity || 0),
    amount: acc.amount + ((p.totalPrice || 0))
  }), { count: 0, qty: 0, amount: 0 });

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
      {/* Left: Order Information */}
      <div className='col-span-12 lg:col-span-3 bg-gray-50 p-4 rounded-lg'>
        <h3 className='text-lg font-medium text-gray-900 mb-3'>Thông tin đơn hàng</h3>
        <div className='space-y-3'>
          <Input
            label='Mã Khách hàng (tùy chọn)'
            value={formData.customerId}
            onChange={(e) => onChange('customerId', e.target.value)}
            placeholder='Nhập mã khách hàng'
            readonly={readonlyField?.includes('customerId')}
          />

          <Input
            label='Mã giảm giá (tùy chọn)'
            value={formData.voucherCode}
            onChange={(e) => onChange('voucherCode', e.target.value)}
            placeholder='Nhập mã giảm giá'
            readonly={readonlyField?.includes('voucherCode')}
          />

          <Dropdown
            label='Phương thức thanh toán'
            value={formData.paymentId}
            onChange={(e) => onChange('paymentId', e.target.value)}
            options={[
              { value: '', label: 'Chọn phương thức thanh toán' },
              ...paymentMethods
            ]}
            required
            readonly={readonlyField?.includes('paymentId') || loadingPaymentMethods}
          />

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => onChange('note', e.target.value)}
              placeholder='Nhập ghi chú đơn hàng'
              rows={3}
              readOnly={readonlyField?.includes('note')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Middle: Products */}
      <div className='col-span-12 lg:col-span-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium text-gray-900'>Sản phẩm trong đơn hàng</h3>
          <Button onClick={addProduct} disabled={loadingProducts}>
            + Thêm sản phẩm
          </Button>
        </div>

        {products.length === 0 ? (
          <div className='text-center p-6 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {products.map((product, index) => (
              <div key={product.id} className='grid grid-cols-12 items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100'>
                <div className='col-span-7'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Sản phẩm {index + 1}</label>
                  <Dropdown
                    label={''}
                    value={product.productId}
                    onChange={(e) => updateProduct(product.id, 'productId', e.target.value)}
                    options={[
                      { value: '', label: 'Chọn sản phẩm' },
                      ...availableProducts
                    ]}
                    readonly={loadingProducts}
                  />
                </div>
                <div className='col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Số lượng</label>
                  <Input
                    type='number'
                    value={product.quantity.toString()}
                    onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                    placeholder='Số lượng'
                    min='1'
                    className='w-full'
                  />
                </div>
                <div className='col-span-2 text-right'>
                  <div className='text-sm text-gray-600'>Đơn giá</div>
                  <div className='font-medium text-gray-900'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.unitPrice || 0)}
                  </div>
                </div>
                <div className='col-span-1 text-right'>
                  <div className='text-sm text-gray-600'>Tổng</div>
                  <div className='font-medium text-gray-900'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.totalPrice || 0)}
                  </div>
                </div>
                <div className='col-span-12 text-right'>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() => removeProduct(product.id)}
                    className='mt-2'
                  >
                    X��a
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Summary */}
      <div className='col-span-12 lg:col-span-3'>
        <div className='bg-primary text-on-primary p-4 rounded-lg shadow-md'>
          <div className='text-sm'>Thành tiền</div>
          <div className='text-2xl font-bold mb-2'>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSummary.amount)}
          </div>
          <div className='text-sm bg-primary/20 p-2 rounded-md'>
            <div>Tổng sản phẩm: <span className='font-semibold'>{totalSummary.count}</span></div>
            <div>Tổng số lượng: <span className='font-semibold'>{totalSummary.qty}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
