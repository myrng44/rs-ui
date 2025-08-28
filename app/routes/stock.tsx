import { useEffect, useMemo, useState } from 'react';
import { Layout } from '~/components/Layout';
import { productsApi, storeStockApi } from '~/utils/api';
import { useAuth } from '~/contexts/authContext';

interface ProductRow {
  id: string;
  sku: string;
  name: string;
}

interface ProductBatch {
  qtyReversed: number;
  qtyTotal: number;
  qtyAvailable: number;
  manufactureDate: string;
  batchCode: string;
  importedPrice: number;
  expiryDate: string;
  productName: string;
  supplierName: string;
}

export default function Stock() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [batchesByProduct, setBatchesByProduct] = useState<Record<string, ProductBatch[]>>({});
  const [loadingBatches, setLoadingBatches] = useState<Record<string, boolean>>({});
  const [qtyByProduct, setQtyByProduct] = useState<Record<string, number>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productsApi.getAll({ limit: 200 });
      setProducts(res.elements.map(p => ({ id: p.id, sku: p.sku, name: p.name })));
      setError('');
    } catch (e) {
      console.error(e);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity?: number) => {
    if (quantity == null) return { label: 'Chưa tải', color: 'bg-gray-300 text-gray-800' };
    if (quantity === 0) return { label: 'Hết hàng', color: 'bg-red-500 text-white' };
    if (quantity <= 10) return { label: 'Sắp hết', color: 'bg-warning text-white' };
    if (quantity <= 50) return { label: 'Ít', color: 'bg-blue-500 text-white' };
    return { label: 'Còn hàng', color: 'bg-success text-white' };
  };

  const toggleExpand = async (productId: string) => {
    const isExpanded = !!expanded[productId];
    if (isExpanded) {
      setExpanded(prev => ({ ...prev, [productId]: false }));
      return;
    }
    setExpanded(prev => ({ ...prev, [productId]: true }));
    if (!batchesByProduct[productId]) {
      try {
        setLoadingBatches(prev => ({ ...prev, [productId]: true }));
        const batches = await storeStockApi.getProductBatches(productId);
        setBatchesByProduct(prev => ({ ...prev, [productId]: batches }));
        const totalAvail = batches.reduce((sum, b) => sum + (b.qtyAvailable || 0), 0);
        setQtyByProduct(prev => ({ ...prev, [productId]: totalAvail }));
      } catch (e) {
        console.error('Error loading product batches:', e);
        setBatchesByProduct(prev => ({ ...prev, [productId]: [] }));
        setQtyByProduct(prev => ({ ...prev, [productId]: 0 }));
      } finally {
        setLoadingBatches(prev => ({ ...prev, [productId]: false }));
      }
    }
  };

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Quản lý Kho</h1>
            <p className='text-gray-600'>Theo dõi tồn kho cửa hàng {user?.storeId ? `#${user.storeId}` : ''}</p>
          </div>
          <div className='text-sm text-gray-500'>Tổng {products.length} sản phẩm</div>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        <div className='bg-surface rounded-lg shadow-md border border-gray-200'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
              <tr className='border-b border-gray-200'>
                <th className='text-left p-4 font-semibold text-gray-900'>Product ID</th>
                <th className='text-left p-4 font-semibold text-gray-900'>Số lượng tồn kho</th>
                <th className='text-left p-4 font-semibold text-gray-900'>Trạng thái</th>
                <th className='text-left p-4 font-semibold text-gray-900'>Chi tiết theo lô</th>
              </tr>
              </thead>
              <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className='text-center p-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                    <p className='mt-2 text-gray-600'>Đang tải...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className='text-center p-8 text-gray-600'>
                    Chưa có sản phẩm nào trong kho
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const qty = qtyByProduct[p.id];
                  const status = getStockStatus(qty);
                  const isExpanded = !!expanded[p.id];
                  return [
                    <tr key={p.id} className='border-b border-gray-100 hover:bg-gray-50'>
                      <td className='p-4 font-medium text-gray-900'>{p.id}</td>
                      <td className='p-4 text-gray-900 text-lg font-semibold'>
                        {qty == null ? '—' : qty.toLocaleString('vi-VN')}
                      </td>
                      <td className='p-4'>
                          <span className={`inline-block px-3 py-1 text-sm rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                      </td>
                      <td className='p-4'>
                        <button onClick={() => toggleExpand(p.id)} className='text-primary hover:underline'>
                          {isExpanded ? 'Ẩn lô' : 'Xem lô'}
                        </button>
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={`${p.id}-details`} className='bg-gray-50'>
                        <td colSpan={4} className='p-4'>
                          <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                              <thead>
                              <tr className='border-b border-gray-200'>
                                <th className='text-left p-2 font-semibold text-gray-900'>Mã lô</th>
                                <th className='text-left p-2 font-semibold text-gray-900'>Nhà cung cấp</th>
                                <th className='text-left p-2 font-semibold text-gray-900'>Tồn khả dụng</th>
                                <th className='text-left p-2 font-semibold text-gray-900'>Tổng nhập</th>
                                <th className='text-left p-2 font-semibold text-gray-900'>Đã xuất</th>
                                <th className='text-left p-2 font-semibold text-gray-900'>NSX</th>
                                <th className='text-left p-2 font-semibold text-gray-900'>HSD</th>
                                <th className='text-left p-2 font-semibold text-gray-900'>Giá nhập</th>
                              </tr>
                              </thead>
                              <tbody>
                              {loadingBatches[p.id] ? (
                                <tr>
                                  <td colSpan={8} className='text-center p-4 text-gray-600'>Đang tải...</td>
                                </tr>
                              ) : (batchesByProduct[p.id] || []).length === 0 ? (
                                <tr>
                                  <td colSpan={8} className='text-center p-4 text-gray-600'>Không có dữ liệu lô</td>
                                </tr>
                              ) : (
                                (batchesByProduct[p.id] || []).map((batch, idx) => (
                                  <tr key={`${p.id}-${batch.batchCode}-${idx}`} className='border-b border-gray-100'>
                                    <td className='p-2 text-gray-900'>{batch.batchCode}</td>
                                    <td className='p-2 text-gray-900'>{batch.supplierName}</td>
                                    <td className='p-2 text-gray-900'>{batch.qtyAvailable.toLocaleString('vi-VN')}</td>
                                    <td className='p-2 text-gray-900'>{batch.qtyTotal.toLocaleString('vi-VN')}</td>
                                    <td className='p-2 text-gray-900'>{batch.qtyReversed.toLocaleString('vi-VN')}</td>
                                    <td className='p-2 text-gray-900'>{new Date(batch.manufactureDate).toLocaleDateString('vi-VN')}</td>
                                    <td className='p-2 text-gray-900'>{new Date(batch.expiryDate).toLocaleDateString('vi-VN')}</td>
                                    <td className='p-2 text-gray-900'>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(batch.importedPrice)}</td>
                                  </tr>
                                ))
                              )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )
                  ];
                })
              )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && products.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='bg-surface p-4 rounded-lg border border-gray-200'>
              <div className='text-2xl font-bold text-gray-900'>{products.length}</div>
              <div className='text-sm text-gray-600'>Sản phẩm</div>
            </div>
            <div className='bg-surface p-4 rounded-lg border border-gray-200'>
              <div className='text-2xl font-bold text-success'>{Object.values(qtyByProduct).filter((q) => q > 50).length}</div>
              <div className='text-sm text-gray-600'>Đủ hàng</div>
            </div>
            <div className='bg-surface p-4 rounded-lg border border-gray-200'>
              <div className='text-2xl font-bold text-warning'>
                {Object.values(qtyByProduct).filter((q) => q > 0 && q <= 50).length}
              </div>
              <div className='text-sm text-gray-600'>Sắp hết</div>
            </div>
            <div className='bg-surface p-4 rounded-lg border border-gray-200'>
              <div className='text-2xl font-bold text-error'>{Object.values(qtyByProduct).filter((q) => q === 0).length}</div>
              <div className='text-sm text-gray-600'>Hết hàng</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
