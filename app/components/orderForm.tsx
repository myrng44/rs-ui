import { Input } from "./input";

interface OrderFormData {
  customerId: string;
  storeId: string;
  voucherId: string;
  note: string;
  paymentId: string;
}

interface OrderFormProps {
  formData: OrderFormData;
  onChange: (field: keyof OrderFormData, value: string) => void;
}

export function OrderForm({ formData, onChange }: OrderFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="ID Khách hàng"
        value={formData.customerId}
        onChange={(e) => onChange("customerId", e.target.value)}
        placeholder="Nhập ID khách hàng"
      />
      <Input
        label="ID Cửa hàng"
        value={formData.storeId}
        onChange={(e) => onChange("storeId", e.target.value)}
        placeholder="Nhập ID cửa hàng"
      />
      <Input
        label="ID Voucher (tùy chọn)"
        value={formData.voucherId}
        onChange={(e) => onChange("voucherId", e.target.value)}
        placeholder="Nhập ID voucher"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
        <textarea
          value={formData.note}
          onChange={(e) => onChange("note", e.target.value)}
          placeholder="Nhập ghi chú đơn hàng"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <Input
        label="ID Thanh toán"
        value={formData.paymentId}
        onChange={(e) => onChange("paymentId", e.target.value)}
        placeholder="Nhập ID thanh toán"
      />
    </div>
  );
}
