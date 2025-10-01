import React, { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { inventoryApi, batchStocksApi, storesApi, productsApi } from '~/utils/api';

interface AdjustFormProps {
  onClose: () => void;
  onAdjusted?: () => void;
}

export default function AdjustForm({ onClose, onAdjusted }: AdjustFormProps) {
  const [storeId, setStoreId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [batchStockId, setBatchStockId] = useState<string | null>(null);
  const [changeQty, setChangeQty] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('ADJUST');
  const [loading, setLoading] = useState(false);

  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [batchStocks, setBatchStocks] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await storesApi.getAll({ limit: 200 });
        const anyResp = resp as any;
        const list: any[] = Array.isArray(anyResp) ? anyResp : (anyResp.elements ?? anyResp.data?.content ?? anyResp.data ?? anyResp);

        if (mounted) {
          setStores(list || []);
          if (list && list.length > 0) setStoreId(String(list[0].id ?? list[0].storeId));
        }
      } catch (err) {
        console.warn('Failed to load stores', err);
        if (mounted) setStores([]);
      }
    })();

    (async () => {
      try {
        const resp = await productsApi.getAll({ limit: 500 });
        const anyResp = resp as any;
        const list: any[] = Array.isArray(anyResp) ? anyResp : (anyResp.elements ?? anyResp.data?.content ?? anyResp.data ?? anyResp);        if (mounted) setProducts(list || []);
      } catch (err) {
        console.warn('Failed to load products', err);
        if (mounted) setProducts([]);
      }
    })();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBatchStocks = async () => {
      if (!productId || !storeId) { setBatchStocks([]); return; }
      try {
        const resp = await batchStocksApi.getAvailableByProductAndStore(productId, storeId);
        const list: any[] = Array.isArray(resp) ? resp : (resp.elements ?? resp.data?.content ?? resp.data ?? resp);
        if (mounted) setBatchStocks(list || []);
      } catch (err) {
        console.warn('Failed to load batch stocks for adjust', err);
        if (mounted) setBatchStocks([]);
      }
    };
    loadBatchStocks();
    return () => { mounted = false; };
  }, [productId, storeId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!batchStockId) return alert('Vui lòng chọn BatchStock');
    if (changeQty === null || changeQty === 0) return alert('Vui lòng nhập số lượng điều chỉnh (khác 0)');

    setLoading(true);
    try {
      await inventoryApi.createAdjustment({ batchStockId: String(batchStockId), changeQty: Number(changeQty), reason: reason || 'ADJUST' });
      alert('Điều chỉnh thành công');
      onAdjusted?.();
    } catch (err) {
      console.error('Error adjusting inventory:', err);
      alert('Lỗi khi điều chỉnh: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={onSubmit} className="bg-white rounded p-6 w-1/3 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Điều chỉnh tồn kho</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm block mb-1">Cửa hàng</label>
            <select value={storeId} onChange={(e) => setStoreId(String(e.target.value))} className="mt-1 block w-full border rounded p-2">
              <option value="">-- Chọn cửa hàng --</option>
              {stores.map(s => <option key={s.id ?? s.storeId} value={String(s.id ?? s.storeId)}>{s.name ?? s.storeName ?? `Store ${s.id ?? s.storeId}`}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Sản phẩm</label>
            <select value={productId} onChange={(e) => setProductId(String(e.target.value))} className="mt-1 block w-full border rounded p-2">
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(p => <option key={p.id ?? p.productId} value={String(p.id ?? p.productId)}>{p.name ?? p.productName ?? `Product ${p.id ?? p.productId}`}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">BatchStock</label>
            <select required value={batchStockId ?? ''} onChange={(e) => setBatchStockId(String(e.target.value) || null)} className="mt-1 block w-full border rounded p-2">
              <option value="">-- Chọn batch stock --</option>
              {batchStocks.map((bs: any) => (
                <option key={bs.id ?? bs.batchStockId ?? bs.__raw?.id} value={String(bs.id ?? bs.batchStockId ?? bs.__raw?.id)}>
                  {bs.batchCode ?? bs.__raw?.batchCode ?? `BS ${bs.id ?? bs.batchStockId}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Số lượng (+/-) *</label>
            <input type="number" required value={changeQty ?? ''} onChange={e => setChangeQty(Number(e.target.value) || null)} className="mt-1 block w-full border rounded p-2" placeholder="VD: +10 hoặc -5" />
          </div>

          <div className="col-span-2">
            <label className="text-sm block mb-1">Lý do</label>
            <input value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder="Nhập lý do điều chỉnh" />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : 'Áp dụng'}</Button>
        </div>
      </form>
    </div>
  );
}
