import React from 'react';
import { Eye, Edit, Trash2, Pencil } from 'lucide-react';
import { Button } from '../Button';

interface Order {
  id: string;
  customerId?: string;
  customerName?: string;
  storeId?: number;
  voucherCode?: string | null;
  finalPrice?: number | null;
  paymentMethodName?: string;
  saleLines?: Array<{ unitPrice?: number; qtyOrdered?: number; totalPrice?: number }>;
  lines?: Array<{ unitPrice?: number; qtyOrdered?: number; totalPrice?: number }>;
  note?: string | null;
}

interface Props {
  orders: Order[];
  loading: boolean;
  sortBy: string;
  onSort: (field: string) => void;
  onViewDetail: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

const OrdersTable: React.FC<Props> = ({ orders, loading, sortBy, onSort, onViewDetail, onEdit, onDelete }) => {
  const getSortIcon = (field: string) => {
    if (sortBy === field) return ' ↑';
    if (sortBy === `-${field}`) return ' ↓';
    return '';
  };

  const formatCurrency = (amount?: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount || 0));

  const computeFromLines = (o: Order) => {
    const lines = Array.isArray(o.saleLines) ? o.saleLines : Array.isArray(o.lines) ? o.lines : [];
    return lines.reduce((s, l) => {
      if (l.totalPrice !== undefined && l.totalPrice !== null) return s + Number(l.totalPrice);
      const unit = Number(l.unitPrice ?? 0);
      const qty = Number(l.qtyOrdered ?? 0);
      return s + unit * qty;
    }, 0);
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) onDelete(orderId);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => onSort('id')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Mã đơn {getSortIcon('id')}</th>
              <th onClick={() => onSort('customerName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Khách hàng {getSortIcon('customerName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher</th>
              <th onClick={() => onSort('finalPrice')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Tổng tiền {getSortIcon('finalPrice')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center"><div className="flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span className="ml-3 text-gray-600">Đang tải dữ liệu...</span></div></td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Không có đơn hàng</td></tr>
            ) : (
              orders.map((order, idx) => {
                const amount = (order.finalPrice !== undefined && order.finalPrice !== null) ? Number(order.finalPrice) : computeFromLines(order);
                return (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-500">Cửa hàng {order.storeId}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">ID: {order.customerId}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.voucherCode ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{order.voucherCode}</span> : <span className="text-sm text-gray-400">Không có</span>}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.paymentMethodName}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onViewDetail(order)} className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"><Eye className="h-4 w-4" /></Button>
                        {/* <Button variant="ghost" size="sm" onClick={() => onEdit(order)} className="text-amber-600 hover:text-amber-900 hover:bg-amber-50"><Pencil className="h-4 w-4" /></Button> */}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-900 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
