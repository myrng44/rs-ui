import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { ordersApi } from '~/utils/api';
import { Button } from '../Button';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

interface OrderDetail {
  id: string;
  customerId: string;
  customerName: string;
  saleLines: Array<{
    id: string;
    saleOrderId: string;
    productId: string;
    productName: string;
    qtyOrdered: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  storeId: number;
  voucherCode: string | null;
  finalPrice: number;
  note: string | null;
  paymentMethodName: string;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  orderId 
}) => {
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getById(orderId);
      setOrderDetail(data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      setError('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết đơn hàng {orderId}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={fetchOrderDetail}>Thử lại</Button>
            </div>
          ) : orderDetail ? (
            <div className="space-y-6">
              {/* Thông tin chung */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Mã đơn:</span>
                      <span className="text-gray-900">{orderDetail.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Khách hàng:</span>
                      <span className="text-gray-900">{orderDetail.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Cửa hàng:</span>
                      <span className="text-gray-900">{orderDetail.storeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Voucher:</span>
                      <span className="text-gray-900">
                        {orderDetail.voucherCode ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {orderDetail.voucherCode}
                          </span>
                        ) : (
                          'Không có'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Phương thức TT:</span>
                      <span className="text-gray-900">{orderDetail.paymentMethodName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Ghi chú:</span>
                      <span className="text-gray-900">{orderDetail.note || 'Không có'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin thanh toán</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(orderDetail.finalPrice)}
                    </div>
                    <div className="text-sm text-blue-600">Tổng tiền thanh toán</div>
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sản phẩm trong đơn ({orderDetail.saleLines?.length || 0} sản phẩm)
                </h3>
                {orderDetail.saleLines && orderDetail.saleLines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sản phẩm
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số lượng
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Đơn giá
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {orderDetail.saleLines.map((line, index) => (
                          <tr key={line.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{line.productName}</div>
                              <div className="text-xs text-gray-500">ID: {line.productId}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {line.qtyOrdered}
                              </span>
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
                            }).format(orderDetail.finalPrice)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    Không có sản phẩm nào trong đơn hàng
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;