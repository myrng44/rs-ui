import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import { OrderFormWithProducts, type OrderProduct } from '~/components/OrderFormWithProducts';
import { ordersApi } from '~/utils/api';

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: '',
    storeId: '',
    voucherCode: '',
    note: '',
    paymentId: '',
  });
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!formData.paymentId) {
        setError('Vui lòng chọn phương thức thanh toán');
        return;
      }
      if (orderProducts.length === 0) {
        setError('Vui lòng thêm ít nhất một sản phẩm');
        return;
      }
      for (const p of orderProducts) {
        if (!p.productId || p.quantity < 1) {
          setError('Vui lòng chọn sản phẩm và số lượng hợp lệ');
          return;
        }
      }

      await ordersApi.create({
        customerId: formData.customerId || undefined,
        note: formData.note || undefined,
        voucherCode: formData.voucherCode || undefined,
        paymentId: formData.paymentId,
        lines: orderProducts.map(p => ({ productId: p.productId, qtyOrdered: p.quantity })),
      });

      navigate('/orders');
    } catch (e) {
      setError('Không thể tạo đơn hàng');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className='space-y-6 animate-fade-in'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Tạo đơn hàng mới</h1>
            <p className='text-gray-600'>Thêm thông tin và sản phẩm để tạo đơn</p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={() => navigate('/orders')}>Hủy</Button>
            <Button onClick={handleCreate} disabled={isSubmitting} className='btn-gradient'>
              {isSubmitting ? 'Đang tạo...' : 'Tạo đơn'}
            </Button>
          </div>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>
            {error}
          </div>
        )}

        <div className='card p-4'>
          <OrderFormWithProducts
            formData={formData}
            products={orderProducts}
            onChange={handleFormChange}
            onProductsChange={setOrderProducts}
          />
        </div>
      </div>
    </Layout>
  );
}
