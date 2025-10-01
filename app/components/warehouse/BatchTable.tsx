// File: src/components/warehouse/BatchTable.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { inventoryApi, storeTransfersApi, storesApi } from '~/utils/api';

interface BatchStock {
  batchCode: string;
  supplierName: string;
  importedPrice: string | number | null;
  qtyTotal: number | string | null;
  qtyAvailable: number | null;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  batchStockId?: number | string | null;
  batchId?: number | string | null;
  __raw?: any;
}

interface Batch {
  id?: string | number | null;
  batchCode: string;
  supplierName?: string | null;
  importedPrice?: string | number | null;
  originalQty?: number | null;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  __raw?: any;
}

interface BatchTableProps {
  loading: boolean;
  batches: Batch[];
  batchStocks: BatchStock[];
  storeId: string;
}

export default function BatchTable({ loading, batches, batchStocks, storeId }: BatchTableProps) {
  const hasData = (batchStocks && batchStocks.length > 0) || (batches && batches.length > 0);

  // History modal state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Transfer modal state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferQty, setTransferQty] = useState<number | ''>('');
  const [transferDestStore, setTransferDestStore] = useState<string>('');
  const [stores, setStores] = useState<any[]>([]);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [activeBatchStockForTransfer, setActiveBatchStockForTransfer] = useState<BatchStock | null>(null);

  // load stores for transfer modal (once)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await storesApi.getAll({ limit: 500 });
        const anyResp = resp as any;
        const list: any[] = Array.isArray(anyResp) ? anyResp : (anyResp.elements ?? anyResp.data?.content ?? anyResp.data ?? anyResp);
        if (mounted) {
          setStores(list || []);
        }
      } catch (err) {
        console.warn('Failed to load stores for transfer modal', err);
        if (mounted) setStores([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // open history modal and fetch data
  async function openHistory(batchStockId?: string | number | null) {
    if (batchStockId == null) {
      alert('Không có batchStockId để xem lịch sử');
      return;
    }
    setHistoryRecords([]);
    setHistoryError(null);
    setHistoryLoading(true);
    setHistoryOpen(true);
    try {
      const resp = await inventoryApi.getHistoryByBatchStock(String(batchStockId));
      const anyResp = resp as any;
      const list: any[] = Array.isArray(anyResp) ? anyResp : (anyResp.elements ?? anyResp.content ?? anyResp.data?.content ?? anyResp.data ?? anyResp);
      setHistoryRecords(list || []);
    } catch (err: any) {
      console.error('Failed fetching history', err);
      setHistoryError(err?.message ?? String(err ?? 'Unknown error'));
    } finally {
      setHistoryLoading(false);
    }
  }

  function openTransferModalFor(bs: BatchStock) {
    // check null/undefined explicitly so that '0' or 0 are considered valid if backend uses such ids
    if (!bs || bs.batchStockId == null) {
      alert('Không có batchStockId để chuyển. Vui lòng chọn lô có tồn kho trên cửa hàng này.');
      return;
    }
    setActiveBatchStockForTransfer(bs);
    setTransferQty('');
    setTransferDestStore('');
    setTransferError(null);
    setTransferOpen(true);
  }

  async function submitTransfer() {
    if (!activeBatchStockForTransfer) return;
    if (!transferDestStore) {
      setTransferError('Vui lòng chọn kho đích');
      return;
    }
    const qtyNum = Number(transferQty);
    if (!qtyNum || qtyNum <= 0) {
      setTransferError('Vui lòng nhập số lượng chuyển > 0');
      return;
    }

    setTransferError(null);
    setTransferLoading(true);
    try {
      const payload = {
        fromStoreId: String(storeId),
        toStoreId: String(transferDestStore),
        transferDate: new Date().toISOString(),
        status: 'REQUESTED',
        items: [{ batchStockId: String(activeBatchStockForTransfer.batchStockId), qtyRequested: qtyNum }],
      };

      const created = await storeTransfersApi.create(payload);
      // optionally you can check created for errors
      alert('Tạo yêu cầu chuyển kho thành công');
      setTransferOpen(false);
    } catch (err: any) {
      console.error('Transfer creation failed', err);
      setTransferError(err?.message ?? String(err ?? 'Unknown error'));
    } finally {
      setTransferLoading(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Batch code</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Import price</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total qty</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mfg</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <div className="flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span className="ml-3 text-gray-600">Đang tải dữ liệu...</span></div>
                </td>
              </tr>
            )}

            {!loading && !hasData && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Không có dữ liệu. Vui lòng chọn Product để xem thông tin lô hàng.</td>
              </tr>
            )}

            {!loading && batchStocks && batchStocks.length > 0 && batchStocks.map((r, idx) => (
              <tr key={r.batchStockId ?? `${r.batchCode}-${idx}`} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{r.batchCode ?? '-'}</div>
                  <div className="text-xs text-gray-500">ID: {r.batchStockId ?? r.batchId ?? '-'}</div>
                </td>

                <td className="px-0 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{r.supplierName ?? '-'}</div>
                </td>

                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatPrice(r.importedPrice)}</div>
                </td>

                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{r.qtyTotal ?? '-'}</div>
                </td>

                <td className="px-3 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${r.qtyAvailable && r.qtyAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{r.qtyAvailable == null ? '-' : r.qtyAvailable}</div>
                </td>

                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.manufactureDate)}</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.expiryDate)}</td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openHistory(r.batchStockId ?? r.batchId)} className="text-blue-600 hover:text-blue-900 hover:bg-blue-50">History</Button>
                    <Button size="sm" variant="ghost" onClick={() => openTransferModalFor(r)} disabled={r.batchStockId == null} className={r.batchStockId == null ? 'text-gray-400' : 'text-green-600 hover:text-green-900 hover:bg-green-50'} title={r.batchStockId != null ? 'Tạo yêu cầu chuyển kho' : 'Không có tồn (không thể transfer)'}>Transfer</Button>
                  </div>
                </td>
              </tr>
            ))}

            {/* fallback: if batchStocks empty but batches exist (older behavior) */}
            {!loading && (!batchStocks || batchStocks.length === 0) && batches && batches.length > 0 && batches.map((b, idx) => (
              <tr key={b.id ?? `${b.batchCode}-${idx}`} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{b.batchCode || '-'}</div>
                  <div className="text-xs text-gray-500">ID: {b.id ?? '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{b.supplierName ?? '-'}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{formatPrice(b.importedPrice)}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{b.originalQty ?? '-'}</div></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(b.manufactureDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(b.expiryDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Button size="sm" onClick={() => alert(`Chi tiết lô: ${b.batchCode} (ID: ${b.id})`)}>Chi tiết</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6">
          <div className="bg-white rounded-lg p-4 w-full max-w-3xl shadow-lg max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Lịch sử điều chỉnh</h3>
                <div className="text-sm text-gray-500">Lịch sử thay đổi tồn cho lô được chọn</div>
              </div>
              <Button variant="outline" onClick={() => setHistoryOpen(false)}>Đóng</Button>
            </div>

            {historyLoading && <div className="py-8 text-center text-gray-600">Đang tải lịch sử...</div>}
            {historyError && <div className="p-3 bg-red-50 text-red-700 rounded">Lỗi: {historyError}</div>}

            {!historyLoading && !historyError && historyRecords.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Không có bản ghi lịch sử.</div>
            )}

            {!historyLoading && historyRecords.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BatchStockId</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.map((h, i) => {
                      const change = h.changeQuantity ?? h.changeQty ?? null;
                      const isPositive = typeof change === 'number' ? change > 0 : (String(change || '').startsWith('+') || Number(change) > 0);
                      return (
                        <tr key={h.id ?? i} className={`hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{h.id ?? '-'}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{h.batchStockId ?? '-'}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {change ?? '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{h.reason ?? '-'}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{formatDate(h.createdAt ?? h.creationTime ?? h.created)}</div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Modal (unchanged) */}
      {transferOpen && activeBatchStockForTransfer && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6">
          <div className="bg-white rounded p-4 w-full max-w-2xl shadow-lg max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Tạo yêu cầu chuyển kho - {activeBatchStockForTransfer.batchCode}</h3>
              <Button variant="outline" onClick={() => setTransferOpen(false)}>Đóng</Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm block mb-1">Kho đích *</label>
                <select value={transferDestStore} onChange={(e) => setTransferDestStore(e.target.value)} className="block w-full border rounded p-2">
                  <option value="">-- Chọn kho đích --</option>
                  {stores.filter(s => String(s.id) !== String(storeId)).map(s => (
                    <option key={s.id} value={String(s.id)}>{s.name ?? s.storeName ?? `Store ${s.id}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm block mb-1">Số lượng *</label>
                <input type="number" min={1} value={transferQty} onChange={(e) => setTransferQty(e.target.value === '' ? '' : Number(e.target.value))} className="block w-full border rounded p-2" />
              </div>
            </div>

            {transferError && <div className="text-red-600 mt-3">{transferError}</div>}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTransferOpen(false)}>Hủy</Button>
              <Button onClick={submitTransfer} disabled={transferLoading}>
                {transferLoading ? 'Đang gửi...' : 'Tạo chuyển kho'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// helpers
function formatDate(d?: string | null): string {
  if (!d) return '-';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleString('vi-VN');
  } catch {
    return String(d);
  }
}

function formatPrice(price?: string | number | null): string {
  if (price === undefined || price === null || price === '') return '-';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return String(price);
  return numPrice.toLocaleString('vi-VN') + ' ₫';
}
