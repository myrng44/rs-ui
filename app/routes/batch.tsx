
import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/Button';
import BatchTable from '~/components/warehouse/BatchTable';
import ReceiveForm from '~/components/warehouse/ReceiveForm';
import AdjustForm from '~/components/warehouse/AdjustForm';
import { batchApi, batchStocksApi, storesApi, productsApi } from '~/utils/api';

export default function WarehousePage() {
  const [storeId, setStoreId] = useState<string>('');
  const [productId, setProductId] = useState<string | null>(null);

  const [stores, setStores] = useState<Array<any>>([]);
  const [products, setProducts] = useState<Array<any>>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [batchStocks, setBatchStocks] = useState<any[]>([]);
  const [availableQty, setAvailableQty] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);

  const unwrapList = useCallback((resp: any): any[] => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.elements && Array.isArray(resp.elements)) return resp.elements;
    if (resp.content && Array.isArray(resp.content)) return resp.content;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    if (resp.data && resp.data.content && Array.isArray(resp.data.content)) return resp.data.content;
    if (resp.items && Array.isArray(resp.items)) return resp.items;
    return [];
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await storesApi.getAll({ limit: 200 });
        const anyResp = resp as any;
        const list: any[] = Array.isArray(anyResp)
          ? anyResp
          : (anyResp.elements ?? anyResp.data?.content ?? anyResp.data ?? anyResp);
        if (mounted) {
          setStores(list || []);
          if (!storeId && list && list.length > 0) {
            setStoreId(String(list[0].id ?? list[0].storeId ?? list[0].storeId));
          }
        }
      } catch (err) {
        console.warn('Failed to load stores', err);
        if (mounted) setStores([]);
      }
    })();

    // load products for product selector
    (async () => {
      try {
        const resp = await productsApi.getAll({ limit: 500 });
        const list = unwrapList(resp);
        if (mounted) setProducts(list || []);
      } catch (err) {
        console.warn('Failed to load products', err);
        if (mounted) setProducts([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [unwrapList]);

  const fetchData = useCallback(
    async (productIdParam: string, storeIdParam: string) => {
      setLoading(true);
      try {
        const bsResp = await batchStocksApi.getAvailableByProductAndStore(productIdParam, storeIdParam);
        const rawBatchStocks = unwrapList(bsResp);

        // Normalization with ample fallbacks
        const normalizedBS = rawBatchStocks.map((r: any) => ({
          batchCode:
            r.batchCode ?? r.batch_code ?? (r.batch && (r.batch.batchCode ?? r.batch.batch_code)) ?? r.__raw?.batchCode ?? r.code ?? null,
          supplierName:
            r.supplierName ?? r.supplier_name ?? r.supplier ?? r.__raw?.supplierName ?? null,
          importedPrice:
            r.importedPrice ?? r.imported_price ?? r.importPrice ?? r.__raw?.importedPrice ?? null,
          qtyTotal:
            r.qtyTotal ?? r.originalQty ?? r.original_qty ?? r.__raw?.originalQty ?? r.qty ?? null,
          qtyAvailable:
            r.qtyAvailable ?? r.qty_available ?? r.available ?? r.__raw?.available ?? null,
          manufactureDate:
            r.manufactureDate ?? r.manufacture_date ?? r.__raw?.manufactureDate ?? null,
          expiryDate:
            r.expiryDate ?? r.expiry_date ?? r.__raw?.expiryDate ?? null,
          batchStockId:
            r.id ?? r.batchStockId ?? r.batch_stock_id ?? (r.batch && (r.batch.id ?? r.batch.batchStockId)) ?? r.__raw?.id ?? r.__raw?.batchStockId ?? null,
          batchId:
            r.batchId ?? r.batch_id ?? (r.batch && (r.batch.id ?? r.batch.batchId)) ?? r.__raw?.batchId ?? null,
          __raw: r,
        }));

        // Build separate maps to avoid clobbering
        const bsByBatchCode = new Map<string, any>();
        const bsByBatchId = new Map<string, any>();
        const bsByBatchStockId = new Map<string, any>();

        normalizedBS.forEach((bs: any) => {
          if (bs.batchCode) bsByBatchCode.set(String(bs.batchCode), bs);
          if (bs.batchId) bsByBatchId.set(String(bs.batchId), bs);
          if (bs.batchStockId) bsByBatchStockId.set(String(bs.batchStockId), bs);
        });

        try {
          const totResp = await batchStocksApi.getAvailableTotal(productIdParam, storeIdParam);
          let tot: number | null = null;
          if (totResp === null || totResp === undefined) tot = null;
          else if (typeof totResp === 'number') tot = totResp;
          else if (typeof totResp === 'object') {
            tot = Number((totResp as any).data ?? (totResp as any).total ?? (totResp as any).available ?? NaN);
            if (Number.isNaN(tot)) tot = null;
          }
          if (tot !== null) setAvailableQty(Number(tot));
          else setAvailableQty(Number(normalizedBS.reduce((s: number, r: any) => s + Number(r.qtyAvailable || 0), 0)));
        } catch (err) {
          setAvailableQty(Number(normalizedBS.reduce((s: number, r: any) => s + Number(r.qtyAvailable || 0), 0)));
        }

        let normalizedBatches: any[] = [];
        try {
          const batchListResp = await batchApi.getByProduct(productIdParam);
          const batchList = unwrapList(batchListResp);
          normalizedBatches = batchList.map((b: any) => ({
            id: b.id ?? b.batchId ?? null,
            batchCode: b.batchCode ?? b.batch_code ?? b.code ?? null,
            supplierName: b.supplierName ?? b.supplier_name ?? null,
            importedPrice: b.importedPrice ?? b.imported_price ?? b.importPrice ?? null,
            originalQty: b.originalQty ?? b.original_qty ?? b.qty ?? null,
            manufactureDate: b.manufactureDate ?? b.manufacture_date ?? null,
            expiryDate: b.expiryDate ?? b.expiry_date ?? null,
            __raw: b,
          }));
        } catch (err) {
          console.warn('batchApi.getByProduct failed', err);
          normalizedBatches = [];
        }

        const merged: any[] = [];

        normalizedBatches.forEach((b) => {
          const keyCode = b.batchCode ? String(b.batchCode) : null;
          const keyId = b.id ? String(b.id) : null;

          // prefer match by batchId then batchCode
          const matchById = keyId ? bsByBatchId.get(keyId) : null;
          const matchByCode = keyCode ? bsByBatchCode.get(keyCode) : null;
          const match = matchById ?? matchByCode ?? null;

          merged.push({
            batchCode: b.batchCode ?? match?.batchCode ?? '-',
            supplierName: match?.supplierName ?? b.supplierName ?? '-',
            importedPrice: match?.importedPrice ?? b.importedPrice ?? null,
            qtyTotal: match?.qtyTotal ?? b.originalQty ?? '-',
            qtyAvailable: match?.qtyAvailable ?? null,
            manufactureDate: match?.manufactureDate ?? b.manufactureDate ?? null,
            expiryDate: match?.expiryDate ?? b.expiryDate ?? null,
            batchStockId: match?.batchStockId ?? null,
            batchId: b.id ?? match?.batchId ?? null,
            __rawBatch: b.__raw,
            __rawBatchStock: match?.__raw ?? null,
          });

          if (match?.batchCode) bsByBatchCode.delete(String(match.batchCode));
          if (match?.batchId) bsByBatchId.delete(String(match.batchId));
          if (match?.batchStockId) bsByBatchStockId.delete(String(match.batchStockId));
        });

        for (const bs of normalizedBS) {
          const alreadyIncluded = merged.some(m =>
            (m.batchStockId != null && String(m.batchStockId) === String(bs.batchStockId)) ||
            (m.batchCode && bs.batchCode && String(m.batchCode) === String(bs.batchCode))
          );
          if (alreadyIncluded) continue;
          merged.push({
            batchCode: bs.batchCode ?? '-',
            supplierName: bs.supplierName ?? '-',
            importedPrice: bs.importedPrice ?? null,
            qtyTotal: bs.qtyTotal ?? '-',
            qtyAvailable: bs.qtyAvailable ?? null,
            manufactureDate: bs.manufactureDate ?? null,
            expiryDate: bs.expiryDate ?? null,
            batchStockId: bs.batchStockId ?? null,
            batchId: bs.batchId ?? null,
            __rawBatch: null,
            __rawBatchStock: bs.__raw ?? null,
          });
        }

        // debug logs to inspect what API actually returns (remove in production)
        // eslint-disable-next-line no-console
        console.debug('normalizedBS', normalizedBS, 'merged', merged);

        setBatchStocks(merged);
        setBatches(normalizedBatches);
      } catch (err) {
        console.error('Fetch warehouse data error', err);
        setBatches([]);
        setBatchStocks([]);
        setAvailableQty(0);
      } finally {
        setLoading(false);
      }
    },
    [unwrapList]
  );

  useEffect(() => {
    if (!productId) {
      setBatches([]);
      setBatchStocks([]);
      setAvailableQty(0);
      return;
    }
    if (!storeId) return;
    fetchData(productId, storeId);
  }, [productId, storeId, fetchData]);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">Kho - Quản lý lô &amp; tồn kho</h1>
                <p className="mt-2 text-gray-600">Nhập hàng, điều chỉnh và xem tồn theo lô</p>
              </div>
              <div className="flex items-center gap-2">
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowReceive(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Nhập hàng
            </Button>
            <Button variant="outline" onClick={() => setShowAdjust(true)}>
              Điều chỉnh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm">Cửa hàng</label>
            <select value={storeId} onChange={(e) => setStoreId(String(e.target.value))} className="mt-1 block w-full border rounded p-2">
              <option value="">-- Chọn cửa hàng --</option>
              {stores.map((s) => (
                <option key={s.id ?? s.storeId} value={String(s.id ?? s.storeId)}>
                  {s.name ?? s.storeName ?? `Store ${s.id ?? s.storeId}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm">Product</label>
            <select value={productId ?? ''} onChange={(e) => setProductId(e.target.value === '' ? null : String(e.target.value))} className="mt-1 block w-full border rounded p-2">
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(p => (
                <option key={p.id ?? p.productId} value={String(p.id ?? p.productId)}>{p.name ?? p.productName ?? `Product ${p.id ?? p.productId}`}</option>
              ))}
            </select>
            {!productId && <div className="text-xs text-gray-500 mt-1">Chọn sản phẩm để xem lô &amp; tồn kho</div>}
          </div>

          <div>
            <label className="text-sm">Tổng tồn</label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">{availableQty}</div>
          </div>
        </div>

        <BatchTable loading={loading} batches={batches} batchStocks={batchStocks} storeId={storeId} />

        {showReceive && (
          <ReceiveForm
            defaultStoreId={storeId || (stores[0]?.id ? String(stores[0].id) : '1')}
            onClose={() => setShowReceive(false)}
            onCreated={() => {
              setShowReceive(false);
              if (productId && storeId) fetchData(productId, storeId);
            }}
          />
        )}

        {showAdjust && (
          <AdjustForm
            onClose={() => {
              setShowAdjust(false);
              if (productId && storeId) fetchData(productId, storeId);
            }}
            onAdjusted={() => {
              setShowAdjust(false);
              if (productId && storeId) fetchData(productId, storeId);
            }}
          />
        )}
      </div>
    </Layout>
  );
}