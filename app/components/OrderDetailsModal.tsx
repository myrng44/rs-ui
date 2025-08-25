import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ordersApi } from '~/utils/api';

interface OrderDetail {
  id: string;
  saleOrderId: string;
  productId: string;
  productName: string;
  qtyOrdered: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

export function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId]);

  const loadOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError('');
      const order = await ordersApi.getById(orderId);
      setOrderDetails(order.saleLines || []);
    } catch (err: any) {
      setError('Không thể tải chi tiết đơn hàng');
      console.error('Error loading order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderDetails([]);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Chi tiết đơn hàng: ${orderId}`}
      footer={<Button onClick={handleClose}>Đóng</Button>}
    >
      <div className='space-y-4'>
        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        {loading ? (
          <div className='text-center p-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='mt-2 text-gray-600'>Đang tải chi tiết đơn hàng...</p>
          </div>
        ) : orderDetails.length === 0 ? (
          <div className='text-center p-8 text-gray-600'>Không có sản phẩm nào trong đơn hàng này</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full border border-gray-200 rounded-lg'>
              <thead>
              <tr className='bg-gray-50 border-b border-gray-200'>
                <th className='text-left p-3 font-semibold text-gray-900'>Sản phẩm</th>
                <th className='text-left p-3 font-semibold text-gray-900'>Số lượng</th>
                <th className='text-left p-3 font-semibold text-gray-900'>Đơn giá</th>
                <th className='text-left p-3 font-semibold text-gray-900'>Tổng tiền</th>
              </tr>
              </thead>
              <tbody>
              {orderDetails.map((detail, index) => (
                <tr
                  key={detail.id}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className='p-3 text-gray-900 font-medium'>{detail.productName}</td>
                  <td className='p-3 text-gray-900'>{detail.qtyOrdered}</td>
                  <td className='p-3 text-gray-900'>{detail.unitPrice}</td>
                  <td className='p-3 text-gray-900'>{detail.totalPrice}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        {orderDetails.length > 0 && (
          <div className='mt-4 text-sm text-gray-600'>Tổng cộng: {orderDetails.length} sản phẩm</div>
        )}
      </div>
    </Modal>
  );
}
