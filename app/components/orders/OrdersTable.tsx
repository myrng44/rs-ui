import React from 'react';
import { Eye, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../Button';

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  storeId: number;
  voucherCode: string | null;
  finalPrice: number;
  note: string | null;
  paymentMethodName: string;
}

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  sortBy: string;
  onSort: (field: string) => void;
  onViewDetail: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading,
  sortBy,
  onSort,
  onViewDetail,
  onEdit,
  onDelete
}) => {
  const getSortIcon = (field: string) => {
    if (sortBy === field) return ' ↑';
    if (sortBy === `-${field}`) return ' ↓';
    return '';
  };

  // const getStatusBadge = (finalPrice: number) => {
  //   if (finalPrice > 1000000) {
  //     return (
  //       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  //         <CheckCircle className="h-3 w-3 mr-1" />
  //         Cao
  //       </span>
  //     );
  //   } else if (finalPrice > 200000) {
  //     return (
  //       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  //         <AlertCircle className="h-3 w-3 mr-1" />
  //         Trung bình
  //       </span>
  //     );
  //   } else {
  //     return (
  //       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
  //         Thấp
  //       </span>
  //     );
  //   }
  // };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      onDelete(orderId);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('id')}
              >
                <div className="flex items-center">
                  Mã đơn hàng
                  <span className="ml-1 text-gray-400">{getSortIcon('id')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('customerName')}
              >
                <div className="flex items-center">
                  Khách hàng
                  <span className="ml-1 text-gray-400">{getSortIcon('customerName')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voucher
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('finalPrice')}
              >
                <div className="flex items-center">
                  Tổng tiền
                  <span className="ml-1 text-gray-400">{getSortIcon('finalPrice')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mức giá
              </th> */}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-lg mb-2">Không có đơn hàng nào</div>
                    <div className="text-sm">Thử thay đổi bộ lọc hoặc tạo đơn hàng mới</div>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr 
                  key={order.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                    <div className="text-xs text-gray-500">Cửa hàng {order.storeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-500">ID: {order.customerId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.voucherCode ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.voucherCode}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Không có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.finalPrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.paymentMethodName}</div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.finalPrice)}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(order)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(order)}
                        className="text-amber-600 hover:text-amber-900 hover:bg-amber-50"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;