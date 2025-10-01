
import React, { useEffect, useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import Dropdown from '../Dropdown';
import { ordersApi, productsApi, paymentMethodApi } from '~/utils/api';
import { storesApi } from '~/utils/api';

interface OrderLine {
  id: string; // local id
  productId: string;
  productName: string;
  unitPrice?: number;
  qtyOrdered: number;
}

interface FormData {
  customerId: string;
  storeId: string;
  voucherId: string;
  note: string;
  paymentId: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderForm: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({ customerId: '', storeId: '', voucherId: '', note: '', paymentId: '' });
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Array<{ value: string; label: string; unitPrice?: number }>>([]);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadProducts();
    loadPaymentMethods();
    setErrors({}); setServerError(null);
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await productsApi.getAll({ limit: 200 });
      setAvailableProducts((res.elements || []).map((p: any) => ({ value: String(p.id), label: `${p.name} (${p.sku || ''})`, unitPrice: Number(p.unitPrice || 0) })));
    } catch (err) {
      console.error('Load products error', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await paymentMethodApi.getAll();
      setPaymentMethods((res.elements || []).map((m: any) => ({ value: String(m.id), label: m.name })));
    } catch (err) {
      console.error('Load payment methods', err);
    }
  };


  const addLine = () => {
    const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    setLines(prev => [...prev, { id: tmpId, productId: '', productName: '', unitPrice: 0, qtyOrdered: 1 }]);
  };

  const updateLine = (id: string, field: keyof OrderLine, value: any) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const next = { ...l, [field]: value };
      if (field === 'productId') {
        const sel = availableProducts.find(p => p.value === value);
        next.productName = sel ? sel.label.split(' (')[0] : '';
        next.unitPrice = sel?.unitPrice ?? 0;
      }
      if (field === 'qtyOrdered') next.qtyOrdered = Number(value) || 0;
      return next;
    }));
  };

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));

  const calculateLinesTotal = () => lines.reduce((s, l) => s + ((Number(l.unitPrice || 0)) * Number(l.qtyOrdered || 0)), 0);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!formData.paymentId) e.paymentId = 'Vui lòng chọn phương thức thanh toán';
    if (lines.length === 0) e.lines = 'Vui lòng thêm ít nhất 1 sản phẩm';
    for (const [i, l] of lines.entries()) {
      if (!l.productId) { e.lines = `Sản phẩm #${i+1} chưa chọn`; break; }
      if (!l.qtyOrdered || l.qtyOrdered < 1) { e.lines = `Sản phẩm #${i+1} số lượng không hợp lệ`; break; }
    }

    if (formData.paymentId && !paymentMethods.find(pm => pm.value === formData.paymentId)) e.paymentId = 'Phương thức thanh toán không hợp lệ';
    for (const l of lines) if (l.productId && !availableProducts.find(p => p.value === l.productId)) { e.lines = `Sản phẩm không hợp lệ: ${l.productName || l.productId}`; break; }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => {
    const payload: any = {};
    if (formData.customerId?.trim()) payload.customerId = String(formData.customerId.trim());
    if (formData.note?.trim()) payload.note = formData.note.trim();
    if (formData.voucherId?.trim()) payload.voucherId = String(formData.voucherId.trim());
    payload.paymentId = String(formData.paymentId);
    payload.lines = lines.map(l => ({ productId: String(l.productId), qtyOrdered: Math.round(Number(l.qtyOrdered || 0)), unitPrice: Math.round(Number(l.unitPrice || 0)) }));
    return payload;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setServerError(null);
    if (!validate()) return;
    const payload = buildPayload();
    console.log('Creating order payload:', JSON.stringify(payload, null, 2));

    setLoading(true);
    try {
      await ordersApi.create(payload);
      onSuccess(); onClose();
      setFormData({ customerId: '', storeId: '', voucherId: '', note: '', paymentId: '' });
      setLines([]); setErrors({});
    } catch (err: any) {
      console.error('Create order error', err);
      setServerError(err?.body?.message || err?.message || 'Có lỗi khi tạo đơn hàng');
      alert(`Tạo đơn lỗi: ${err?.status || ''} - ${err?.body?.message || err?.message || ''}`);
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Tạo đơn hàng mới
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {serverError && <div className="p-3 bg-red-50 text-red-700 rounded">{serverError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Mã khách hàng" value={formData.customerId} onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))} placeholder="Nhập mã khách hàng" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Mã voucher (tùy chọn)" value={formData.voucherId} onChange={(e) => setFormData(prev => ({ ...prev, voucherId: e.target.value }))} placeholder="Nhập mã voucher" />
            <Dropdown label="Phương thức thanh toán" value={formData.paymentId} onChange={(e) => setFormData(prev => ({ ...prev, paymentId: e.target.value }))} options={[{ value: '', label: 'Chọn phương thức thanh toán' }, ...paymentMethods]} required error={errors.paymentId} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Sản phẩm trong đơn</label>
              <Button type="button" onClick={addLine} className="text-sm">+ Thêm sản phẩm</Button>
            </div>

            {errors.lines && <p className="text-xs text-red-600 mb-2">{errors.lines}</p>}

            {lines.length === 0 ? (
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">Chưa có sản phẩm</div>
            ) : (
              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <div key={line.id} className="flex items-end gap-3 p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Sản phẩm {idx + 1}</label>
                      <Dropdown 
                      label = ""
                      value={line.productId} onChange={(e) => updateLine(line.id, 'productId', e.target.value)} options={[{ value: '', label: 'Chọn sản phẩm' }, ...availableProducts]} />
                    </div>

                    <div className="w-28">
                      <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                      <input type="number" min={1} value={line.qtyOrdered} onChange={(e) => updateLine(line.id, 'qtyOrdered', Number(e.target.value) || 1)} className="w-full border rounded px-2 py-1" />
                    </div>

                    <div className="w-36">
                      <label className="block text-sm font-medium text-gray-700">Đơn giá</label>
                      <div className="pt-2 text-right text-sm">{line.unitPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(line.unitPrice) : '-'}</div>
                    </div>

                    <div>
                      <Button variant="danger" size="sm" onClick={() => removeLine(line.id)}>Xóa</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <textarea rows={3} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ghi chú..." value={formData.note} onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <div className="text-right mr-4">
              <div className="text-sm text-gray-500">Tạm tính</div>
              <div className="text-xl font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateLinesTotal())}</div>
            </div>

            <Button type="button" variant="outline" onClick={() => { onClose(); }} disabled={loading}>Hủy</Button>
            <Button type="button" onClick={handleSubmit} disabled={loading || lines.length === 0}>{loading ? 'Đang tạo...' : 'Tạo đơn hàng'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
