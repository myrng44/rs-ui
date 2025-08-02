import { Input } from "./Input";
import CustomDateTimePicker from "~/components/DateTimePicker";

interface VoucherFormData {
  code: string;
  description: string;
  discountPercent: number;
  discountValue: number;
  startTime: any;
  expirationTime: any;
}

interface VoucherFormProps {
  formData: VoucherFormData;
  onChange: (field: keyof VoucherFormData, value: string) => void;
}

export function VoucherForm({ formData, onChange }: VoucherFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Code"
        value={formData.code}
        onChange={(e) => onChange("code", e.target.value)}
        placeholder="Nhập code cho mã giảm giá"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Nhập mô tả về mã giảm giá"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <Input
        label="Giảm giá theo %"
        value={formData.discountPercent}
        onChange={(e) => onChange("discountPercent", e.target.value)}
        placeholder="Nhập tỉ lệ của mã giảm giá (tùy chọn)"
      />
      <Input
        label="Giảm giá theo giá trị"
        value={formData.discountValue}
        onChange={(e) => onChange("discountValue", e.target.value)}
        placeholder="Nhập giá trị của mã giảm giá (tùy chọn)"
      />
      <CustomDateTimePicker label={"Thời gian bắt đầu hiệu lực"} />
      <CustomDateTimePicker label={"Thời gian kết thúc"} />
    </div>
  );
}
