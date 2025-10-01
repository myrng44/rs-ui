import React, { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { batchApi, batchStocksApi, supplierApi, productsApi } from '~/utils/api';

type ReceiveItem = {
  productId: string | null;
  qty: number | null;
  importPrice?: number | null;
  manufactureDate?: string;
  expiryDate?: string;
};

interface ReceiveFormProps {
  defaultStoreId?: string;
  onClose: () => void;
  onCreated?: () => void;
}

export default function ReceiveForm({
  defaultStoreId = "1",
  onClose,
  onCreated,
}: ReceiveFormProps) {
  const [batchCode, setBatchCode] = useState('');
  const [batchCodeMode, setBatchCodeMode] = useState<'select'|'new'>('new');
  const [batchOptions, setBatchOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Array<any>>([]);
  const [items, setItems] = useState<ReceiveItem[]>([
    { productId: null, qty: null, importPrice: null },
  ]);
  const [storeId] = useState<string>(defaultStoreId);
  const [products, setProducts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await supplierApi.getAll({ limit: 200 });
        const anyResp = resp as any;
        const list: any[] = Array.isArray(anyResp)
          ? anyResp
          : (anyResp.elements ?? anyResp.data?.content ?? anyResp.data ?? anyResp);
        if (mounted) {
          setSuppliers(list || []);
          if (!supplierId && list && list.length > 0) setSupplierId(String(list[0].id ?? list[0].supplierId ?? list[0].supplierId));
        }
      } catch (err) {
        console.warn('Failed to load suppliers', err);
        if (mounted) setSuppliers([]);
      }
    })();

    (async () => {
      try {
        const resp = await productsApi.getAll({ limit: 500 });
        const anyResp = resp as any;
        const list: any[] = Array.isArray(anyResp) ? anyResp : (anyResp.elements ?? anyResp.data?.content ?? anyResp.data ?? anyResp);
        if (mounted) setProducts(list || []);
      } catch (err) {
        console.warn('Failed to load products', err);
        if (mounted) setProducts([]);
      }
    })();

    (async () => {
      try {
        const resp = await batchApi.getAll?.({ limit: 200 } as any) ?? [];
        const anyResp = resp as any;
        const list: any[] = Array.isArray(anyResp) ? anyResp : (anyResp.elements ?? anyResp.data?.content ?? anyResp.data ?? anyResp);
        const opts = (list || []).map((b: any) => ({ value: String(b.id ?? b.batchId ?? b.code ?? b.batchCode ?? b.code), label: String(b.batchCode ?? b.code ?? b.name ?? b.id) }));
        if (mounted) setBatchOptions(opts);
      } catch (err) {
        console.warn('Failed to load batch options', err);
        if (mounted) setBatchOptions([]);
      }
    })();

    return () => { mounted = false; };
  }, []);

  function updateItem(idx: number, patch: Partial<ReceiveItem>) {
    const copy = [...items];
    copy[idx] = { ...copy[idx], ...patch };
    setItems(copy);
  }

  function addItem() {
    setItems([...items, { productId: null, qty: null, importPrice: null }]);
  }

  function removeItem(idx: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!supplierId) return alert('Vui lòng chọn Supplier');
    if (!batchCode.trim()) return alert('Vui lòng chọn hoặc nhập Batch Code');
    if (items.length === 0) return alert('Vui lòng thêm ít nhất 1 sản phẩm');
    if (items.some((it) => !it.productId || !it.qty || it.qty <= 0))
      return alert('Vui lòng nhập đầy đủ Product và số lượng (>0) cho tất cả items');

    setLoading(true);
    try {
      const mappedItems = items.map((it) => ({
        productId: String(it.productId),
        qty: Number(it.qty),
        importPrice: it.importPrice === null ? undefined : Number(it.importPrice),
        manufactureDate: it.manufactureDate ?? undefined,
        expiryDate: it.expiryDate ?? undefined,
      }));

      const payload = {
        batchCode: batchCode.trim(),
        supplierId: String(supplierId),
        manufactureDate: undefined,
        expiryDate: undefined,
        arrivalDate: undefined,
        items: mappedItems,
      } as const;

      const created = await batchApi.create(payload as any);

      const extractBatchId = (resp: any) => {
        if (!resp) return null;
        if (resp.batchId) return String(resp.batchId);
        if (resp.id) return String(resp.id);
        if (resp.__raw) {
          if (resp.__raw.batchId) return String(resp.__raw.batchId);
          if (resp.__raw.id) return String(resp.__raw.id);
        }
        if (resp.data && (resp.data.batchId || resp.data.id)) return String(resp.data.batchId ?? resp.data.id);
        if (resp.data && resp.data.content && Array.isArray(resp.data.content) && resp.data.content[0]) {
          const first = resp.data.content[0];
          return String(first.batchId ?? first.id ?? null);
        }
        return null;
      };

      const batchId = extractBatchId(created);
      console.log('ReceiveForm created batch ->', created, 'extracted batchId:', batchId);

      if (batchId) {
        try {
          await batchStocksApi.create({ batchId: String(batchId), storeId: String(storeId), status: 'ACTIVE' });
        } catch (err) {
          console.warn('batch_stock create failed (non-fatal)', err);
        }
      }

      alert('Tạo batch thành công');
      onCreated?.();
    } catch (err: any) {
      console.error('Error creating batch', err);
      const msg = err?.message ?? String(err ?? 'Unknown error');
      alert('Lỗi khi tạo batch: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={onSubmit} className="bg-white rounded p-6 w-2/5 shadow-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Nhập hàng - Tạo batch</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm block mb-1">Batch Code</label>
            <div className="flex gap-2">
              <select className="mt-1 block w-2/3 border rounded p-2" value={batchCodeMode === 'select' ? batchCode : 'NEW'} onChange={(e) => {
                const v = e.target.value;
                if (v === 'NEW') setBatchCodeMode('new');
                else { setBatchCodeMode('select'); setBatchCode(v); }
              }}>
                <option value="NEW">-- Tạo mới hoặc chọn --</option>
                {batchOptions.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
              {batchCodeMode === 'new' && (
                <input className="mt-1 block w-1/3 border rounded p-2" placeholder="Nhập mã mới" value={batchCode} onChange={(e) => setBatchCode(e.target.value)} />
              )}
            </div>
          </div>
          <div>
            <label className="text-sm block mb-1">Supplier *</label>
            <select required value={supplierId ?? ''} onChange={(e) => setSupplierId(String(e.target.value) || null)} className="mt-1 block w-full border rounded p-2">
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers.map((s) => (
                <option key={s.id ?? s.supplierId} value={String(s.id ?? s.supplierId)}>
                  {s.name ?? s.supplierName ?? (`Supplier ${s.id ?? s.supplierId}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-medium mb-2">Danh sách sản phẩm *</div>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-2 items-end mb-2 p-2 border rounded bg-gray-50">
              <div>
                <label className="text-xs block mb-1">Sản phẩm *</label>
                <select required value={it.productId ?? ''} onChange={(e) => updateItem(idx, { productId: String(e.target.value) || null })} className="block w-full border rounded p-2">
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p.id ?? p.productId} value={String(p.id ?? p.productId)}>{p.name ?? p.productName ?? `Product ${p.id ?? p.productId}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1">Số lượng *</label>
                <input type="number" required min={1} value={it.qty ?? ''} onChange={(e) => updateItem(idx, { qty: Number(e.target.value) || null })} className="block w-full border rounded p-2" placeholder="SL" />
              </div>
              <div>
                <label className="text-xs block mb-1">Giá nhập</label>
                <input type="number" min={0} value={it.importPrice ?? ''} onChange={(e) => updateItem(idx, { importPrice: e.target.value === '' ? null : Number(e.target.value) })} className="block w-full border rounded p-2" placeholder="Giá" />
              </div>
              <div>
                <label className="text-xs block mb-1">Ngày SX</label>
                <input type="date" value={it.manufactureDate ?? ''} onChange={(e) => updateItem(idx, { manufactureDate: e.target.value || undefined })} className="block w-full border rounded p-2" />
              </div>
              <div className="flex gap-2 items-end">
                <button type="button" className="px-3 py-2 border rounded bg-red-50 hover:bg-red-100 text-sm" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                  Xóa
                </button>
              </div>
            </div>
          ))}

          <div className="mt-2">
            <button type="button" className="px-4 py-2 border rounded bg-blue-50 hover:bg-blue-100 text-sm" onClick={addItem}>
              + Thêm sản phẩm
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Tạo & Nhập hàng'}
          </Button>
        </div>
      </form>
    </div>
  );
}
