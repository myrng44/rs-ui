import { useState, useEffect, useCallback } from 'react';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { DataTable } from '~/components/DataTable';
import { OrderFormWithProducts, type OrderProduct } from '~/components/OrderFormWithProducts';
import { Pagination } from '~/components/Pagination';
import { OrderDetailsModal } from '~/components/OrderDetailsModal';
import { ordersApi } from '~/utils/api';

interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  storeId: number;
  voucherCode: string | null;
  finalPrice: number;
  note: string | null;
  paymentMethodName: string;
  saleLines?: Array<{
    id: string;
    saleOrderId: string;
    productId: string;
    productName: string;
    qtyOrdered: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage] = useState(20);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    storeId: '',
    voucherId: '',
    note: '',
    paymentId: '',
  });
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const response = await ordersApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: '-createdTime, +finalPrice',
      });
      setOrders(response.elements);
      setTotalElements(response.totalElements);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách đơn hàng');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadOrders(page);
  };

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = () => {
    setFormData({
      customerId: '',
      storeId: '',
      voucherId: '',
      note: '',
      paymentId: '',
    });
  };

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      /**
       * validate
       */
      if (!formData.paymentId) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (orderProducts.length === 0) {
        setError('Vui lòng thêm ít nhất một sản phẩm');
        return;
      }

      /**
       * Validate cac rang buoc cua product
       */
      for (const product of orderProducts) {
        if (!product.productId || product.quantity < 1) {
          setError('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ');
          return;
        }
      }

      /**
       * Create order with products included
       */
      await ordersApi.create({
        customerId: formData.customerId || undefined,
        note: formData.note || undefined,
        voucherId: formData.voucherId || undefined,
        paymentId: formData.paymentId,
        lines: orderProducts.map(p => ({ productId: p.productId, qtyOrdered: p.quantity })),
      });


      setIsAddModalOpen(false);
      resetForm();
      loadOrders(currentPage);
    } catch (err: any) {
      setError('Không thể thêm đơn hàng');
      console.error('Error adding order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = async (order: Order) => {
    try {
      setEditingOrder(order);
      setFormData({
        customerId: order.customerId || '',
        storeId: order.storeId.toString(),
        voucherId: order.voucherCode || '',
        note: order.note || '',
        paymentId: order.paymentMethodName,
      });

      // Get order details with saleLines included
      const orderDetails = await ordersApi.getById(order.id);
      const products: OrderProduct[] = (orderDetails.saleLines || []).map((saleLine, index) => ({
        id: `${saleLine.id}_${index}`,
        productId: saleLine.productId,
        productName: saleLine.productName,
        quantity: saleLine.qtyOrdered,
      }));
      setOrderProducts(products);

      setIsEditModalOpen(true);
    } catch (err) {
      console.error('Error loading order details:', err);
      setError('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleUpdate = async () => {
    if (!editingOrder) return;

    try {
      setIsSubmitting(true);
      setError('');

      //validate form data
      if (!formData.paymentId) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (orderProducts.length === 0) {
        setError('Vui lòng thêm ít nhất một sản phẩm');
        return;
      }

      //validate products
      for (const product of orderProducts) {
        if (!product.productId || product.quantity < 1) {
          setError('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ');
          return;
        }
      }

      //update order first
      await ordersApi.update(editingOrder.id, formData);

      //!note:not updating order details in edit mode
      console.warn('Order details update not implemented in edit mode');

      setIsEditModalOpen(false);
      setEditingOrder(null);
      resetForm();
      loadOrders(currentPage);
    } catch (err: any) {
      setError('Không thể cập nhật đơn hàng');
      console.error('Error updating order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        setError('');
        await ordersApi.delete(id);
        const newTotal = totalElements - 1;
        const maxPage = Math.ceil(newTotal / itemsPerPage);
        const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setCurrentPage(targetPage);
        loadOrders(targetPage);
      } catch (err: any) {
        setError('Không thể xóa đơn hàng');
        console.error('Error deleting order:', err);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Quản lý Đơn hàng</h1>
            <p className='text-gray-600'>Theo dõi và xử lý đơn hàng</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
            Tạo mới đơn hàng
          </Button>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        <DataTable
          data={orders}
          columns={[
            {
              key: 'id',
              label: 'ID',
              render: (value, order) => (
                <button
                  onClick={() => handleViewDetails(order.id)}
                  className='text-primary hover:text-primary-dark hover:underline cursor-pointer font-medium text-sm'
                >
                  {value}
                </button>
              ),
            },
            {
              key: 'customerId',
              label: 'Mã Khách hàng',
              render: (value) => <span className='text-gray-900'>{value}</span>,
            },
            {
              key: 'storeId',
              label: 'Cửa hàng',
              render: (value) => <span className='text-gray-900'>{value}</span>,
            },
            {
              key: 'customerName',
              label: 'Tên khách hàng',
              render: (value) => <span className='text-gray-900'>{value}</span>,
            },
            {
              key: 'voucherCode',
              label: 'Voucher',
              render: (value) => <span className='text-gray-600'>{value || 'Không có'}</span>,
            },
            {
              key: 'paymentMethodName',
              label: 'Phương thức thanh toán',
              render: (value) => <span className='text-gray-900'>{value}</span>,
            },
            {
              key: 'note',
              label: 'Ghi chú',
              render: (value) => <span className='text-gray-600 max-w-xs truncate block'>{value}</span>,
            },
            {
              key: 'finalPrice',
              label: 'Tổng tiền',
              render: (value) => <span className='text-gray-900 font-medium'>{formatPrice(value)}</span>,
            },
          ]}
          actions={[
            {
              label: 'Sửa',
              variant: 'outline',
              onClick: handleEdit,
            },
            {
              label: 'Xóa',
              variant: 'danger',
              onClick: (order) => handleDelete(order.id),
            },
          ]}
          loading={loading}
          emptyMessage='Chưa có đơn hàng nào'
        />

        {!loading && orders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalElements / itemsPerPage)}
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        {/* Add Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title='Thêm đơn hàng mới'
          footer={
            <>
              <Button
                variant='outline'
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleAdd} disabled={isSubmitting}>
                {isSubmitting ? 'Đang thêm...' : 'Thêm'}
              </Button>
            </>
          }
        >
          <OrderFormWithProducts
            formData={formData}
            products={orderProducts}
            onChange={handleFormChange}
            onProductsChange={setOrderProducts}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingOrder(null);
            resetForm();
          }}
          title='Chỉnh sửa đơn hàng'
          footer={
            <>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingOrder(null);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </>
          }
        >
          <OrderFormWithProducts
            formData={formData}
            products={orderProducts}
            onChange={handleFormChange}
            onProductsChange={setOrderProducts}
            readonlyField={['customerId', 'storeId', 'note', 'paymentId', 'voucherId']}
          />

        </Modal>

        {/* Order Details Modal */}
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      </div>
    </Layout>
  );
}
