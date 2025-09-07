import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { ordersApi } from '~/utils/api';
import { Button } from '../Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const OrderDetailModal: React.FC<Props> = ({ isOpen, onClose, orderId }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await ordersApi.getById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Load order detail error', err);
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const compute = (o: any) => {
    if (!o) return { linesTotal: 0, shipping: 0, discount: 0, total: 0 };
    const lines = Array.isArray(o.saleLines) ? o.saleLines : Array.isArray(o.lines) ? o.lines : [];
    const linesTotal = lines.reduce((s: number, l: any) => {
      if (l.totalPrice !== undefined && l.totalPrice !== null) return s + Number(l.totalPrice);
      const unit = Number(l.unitPrice ?? 0);
      const qty = Number(l.qtyOrdered ?? l.qty ?? 0);
      return s + unit * qty;
    }, 0);

    const discount = Number(o.voucherAmount ?? o.discountAmount ?? 0) || 0;
    const shipping = Number(o.deliveryFee ?? o.shippingFee ?? 0) || 0;
    const final = (o.finalPrice !== undefined && o.finalPrice !== null) ? Number(o.finalPrice) : (linesTotal + shipping - discount);
    return { linesTotal, discount, shipping, total: final };
  };

  const { linesTotal, discount, shipping, total } = compute(order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      onClick={onClose} 
    />

    <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
       <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết đơn hàng {orderId}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={() => { if (orderId) { setLoading(true); setError(null); ordersApi.getById(orderId).then(d=>setOrder(d)).catch(()=>setError('Không thể tải lại')).finally(()=>setLoading(false)); }}}>Thử lại</Button>
            </div>
          ) : order ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Mã đơn:</span><span className="text-gray-900">{order.id}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Khách hàng:</span><span className="text-gray-900">{order.customerName ?? order.customerId}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Cửa hàng:</span><span className="text-gray-900">{order.storeId}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Voucher:</span><span className="text-gray-900">{order.voucherCode ?? 'Không có'}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Phương thức TT:</span><span className="text-gray-900">{order.paymentMethodName}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Ghi chú:</span><span className="text-gray-900">{order.note ?? 'Không có'}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thanh toán</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-blue-700 mb-1">{formatCurrency(total)}</div>
                    <div className="text-sm text-blue-600">Tổng tiền thanh toán</div>
                    <div className="mt-3 text-sm text-gray-600">
                      <div>Tạm tính: {formatCurrency(linesTotal)}</div>
                      <div>Phí vận chuyển: {formatCurrency(shipping)}</div>
                      <div>Giảm: -{formatCurrency(discount)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm trong đơn ({(order.saleLines || order.lines || []).length})</h3>
                {(order.saleLines || order.lines || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">Không có sản phẩm nào</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(order.saleLines || order.lines || []).map((l: any, idx: number) => (
                          <tr key={l.id ?? idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3"><div className="text-sm font-medium text-gray-900">{l.productName ?? l.name ?? l.product?.name ?? ''}</div></td>
                            <td className="px-4 py-3 text-center">{l.qtyOrdered ?? l.qty ?? 0}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(Number(l.unitPrice ?? l.price ?? 0))}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatCurrency(Number(l.totalPrice ?? ((l.unitPrice ?? 0) * (l.qtyOrdered ?? l.qty ?? 0))))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">Tổng cộng:</td>
                          <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">{formatCurrency(total)}</td>
                        </tr>
                      </tfoot>
                    </table>
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
