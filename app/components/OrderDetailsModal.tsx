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
      size='4xl'
      footer={<Button onClick={handleClose}>Đóng</Button>}
    >
      <div>
        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4'>{error}</div>}

        {loading ? (
          <div className='text-center p-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='mt-2 text-gray-600'>Đang tải chi tiết đơn hàng...</p>
          </div>
        ) : !orderInfo ? (
          <div className='text-center p-8 text-gray-600'>Không thể tải thông tin đơn hàng</div>
        ) : (
          <div className='flex flex-col lg:flex-row gap-6'>
            {/* Left: Order Info */}
            <div className='w-full lg:w-1/4 bg-gray-50 p-4 rounded-lg'>
              <h4 className='font-semibold text-gray-900 mb-3'>Thông tin đơn hàng</h4>
              <div className='space-y-2 text-sm'>
                <div>
                  <span className='text-gray-600'>Khách hàng:</span>
                  <div className='font-medium text-gray-900'>{orderInfo.customerName}</div>
                </div>
                <div>
                  <span className='text-gray-600'>Mã cửa hàng:</span>
                  <div className='font-medium text-gray-900'>{orderInfo.storeId}</div>
                </div>
                <div>
                  <span className='text-gray-600'>Phương thức thanh toán:</span>
                  <div className='font-medium text-gray-900'>{orderInfo.paymentMethodName}</div>
                </div>
                <div>
                  <span className='text-gray-600'>Mã voucher:</span>
                  <div className='font-medium text-gray-900'>{orderInfo.voucherCode || 'Không có'}</div>
                </div>
                {orderInfo.note && (
                  <div>
                    <span className='text-gray-600'>Ghi chú:</span>
                    <div className='font-medium text-gray-900'>{orderInfo.note}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Items */}
            <div className='w-full lg:w-1/2 overflow-auto'>
              <h4 className='font-semibold text-gray-900 mb-3'>Chi tiết sản phẩm</h4>
              {orderInfo.saleLines.length === 0 ? (
                <div className='text-center p-8 text-gray-600'>Không có sản phẩm nào trong đơn hàng này</div>
              ) : (
                <div className='overflow-x-auto rounded-lg border border-gray-200'>
                  <table className='w-full'>
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
                      <tr key={detail.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 hover:bg-gray-100 transition-colors duration-150`}>
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
                  </table>
                </div>
              )}
            </div>

            {/* Right: Summary */}
            <div className='w-full lg:w-1/4 flex-shrink-0'>
              <div className='bg-primary text-on-primary p-4 rounded-lg shadow-md flex flex-col gap-3'>
                <div className='text-sm'>Thành tiền</div>
                <div className='text-2xl font-bold'>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderInfo.finalPrice)}
                </div>
                <div className='text-sm bg-primary/20 p-2 rounded-md'>
                  <div>Tổng sản phẩm: <span className='font-semibold'>{orderInfo.saleLines.length}</span></div>
                  <div>Tổng số lượng: <span className='font-semibold'>{orderInfo.saleLines.reduce((sum, item) => sum + item.qtyOrdered, 0)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}