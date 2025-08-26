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

interface OrderInfo {
  id: string;
  customerId: string;
  customerName: string;
  storeId: number;
  voucherCode: string | null;
  finalPrice: number;
  paymentMethodName: string;
  note: string | null;
  saleLines: OrderDetail[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

export function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
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
      setOrderInfo(order);
    } catch (err: any) {
      setError('Không thể tải chi tiết đơn hàng');
      console.error('Error loading order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderInfo(null);
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
      <div className='space-y-6'>
        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        {loading ? (
          <div className='text-center p-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='mt-2 text-gray-600'>Đang tải chi tiết đơn hàng...</p>
          </div>
        ) : !orderInfo ? (
          <div className='text-center p-8 text-gray-600'>Không thể tải thông tin đơn hàng</div>
        ) : (
          <>
            {/* Order Information */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='font-semibold text-gray-900 mb-3'>Thông tin đơn hàng</h4>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600'>Khách hàng:</span>
                  <span className='ml-2 font-medium text-gray-900'>{orderInfo.customerName}</span>
                </div>
                <div>
                  <span className='text-gray-600'>Mã cửa hàng:</span>
                  <span className='ml-2 font-medium text-gray-900'>{orderInfo.storeId}</span>
                </div>
                <div>
                  <span className='text-gray-600'>Phương thức thanh toán:</span>
                  <span className='ml-2 font-medium text-gray-900'>{orderInfo.paymentMethodName}</span>
                </div>
                <div>
                  <span className='text-gray-600'>Mã voucher:</span>
                  <span className='ml-2 font-medium text-gray-900'>{orderInfo.voucherCode || 'Không có'}</span>
                </div>
                {orderInfo.note && (
                  <div className='col-span-2'>
                    <span className='text-gray-600'>Ghi chú:</span>
                    <span className='ml-2 font-medium text-gray-900'>{orderInfo.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className='font-semibold text-gray-900 mb-3'>Chi tiết sản phẩm</h4>
              {orderInfo.saleLines.length === 0 ? (
                <div className='text-center p-8 text-gray-600'>Không có sản phẩm nào trong đơn hàng này</div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full border border-gray-200 rounded-lg'>
                    <thead>
                    <tr className='bg-gray-50 border-b border-gray-200'>
                      <th className='text-left p-3 font-semibold text-gray-900'>Sản phẩm</th>
                      <th className='text-center p-3 font-semibold text-gray-900'>Số lượng</th>
                      <th className='text-right p-3 font-semibold text-gray-900'>Đơn giá</th>
                      <th className='text-right p-3 font-semibold text-gray-900'>Tổng tiền</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orderInfo.saleLines.map((detail, index) => (
                      <tr
                        key={detail.id}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
                      >
                        <td className='p-3 text-gray-900 font-medium'>{detail.productName}</td>
                        <td className='p-3 text-gray-900 text-center'>{detail.qtyOrdered}</td>
                        <td className='p-3 text-gray-900 text-right'>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.unitPrice)}
                        </td>
                        <td className='p-3 text-gray-900 text-right font-medium'>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.totalPrice)}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr className='bg-gray-300 bg-opacity-10 border-t-2 border-primary'>
                      <td colSpan={3} className='p-3 font-bold text-gray-900'>Thành tiền:</td>
                      <td className='p-3 text-right font-bold text-lg'>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderInfo.finalPrice)}
                      </td>
                    </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {orderInfo.saleLines.length > 0 && (
              <div className='text-sm text-gray-600 flex justify-between items-center'>
                <span>Tổng cộng: {orderInfo.saleLines.length} sản phẩm</span>
                <span>Tổng số lượng: {orderInfo.saleLines.reduce((sum, item) => sum + item.qtyOrdered, 0)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
