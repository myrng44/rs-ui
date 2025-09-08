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
  const [availableProducts, setAvailableProducts] = useState<Array<{ value: string; label: string }>>([]);
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
      id: '',
      productId: '',
      productName: '',
      quantity: 1,
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

  return (
    <div className='space-y-6'>
      {/* Order Information */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900'>Thông tin đơn hàng</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Input
            label='Mã Khách hàng (tùy chọn)'
            value={formData.customerId}
            onChange={(e) => onChange('customerId', e.target.value)}
            placeholder='Nhập mã khách hàng'
            readonly={readonlyField?.includes('customerId')}
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
        </div>
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

      {/* Products Section */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium text-gray-900'>Sản phẩm trong đơn hàng</h3>
          <Button onClick={addProduct} disabled={loadingProducts}>
            + Thêm sản phẩm
          </Button>
        </div>

        {products.length === 0 ? (
          <div className='text-center p-6 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>Chưa có sản ph��m nào. Nhấn "Thêm sản phẩm" để bắt đầu.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {products.map((product, index) => (
              <div key={product.id} className='grid md:grid-cols-12 items-end gap-3 p-4 bg-gray-50 rounded-lg'>
                <div className='md:col-span-9'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Sản phẩm {index + 1}</label>
                  <Dropdown
                    label={`Sản phẩm ${index + 1}`}
                    value={product.productId}
                    onChange={(e) => updateProduct(product.id, 'productId', e.target.value)}
                    options={[
                      { value: '', label: 'Chọn sản phẩm' },
                      ...availableProducts
                    ]}
                    readonly={loadingProducts}
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Số lượng</label>
                  <Input
                    type='number'
                    value={product.quantity.toString()}
                    onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                    placeholder='Số lượng'
                    min='1'
                  />
                </div>
                <div className='md:col-span-1 flex md:justify-end'>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() => removeProduct(product.id)}
                    className='mb-1'
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
