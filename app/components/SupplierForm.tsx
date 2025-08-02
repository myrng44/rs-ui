import { Input } from "./Input";

interface SupplierFormData {
  name: string;
  address: string;
  contact: string;
}

interface SupplierFormProps {
  formData: SupplierFormData;
  onChange: (field: keyof SupplierFormData, value: string) => void;
}

export function SupplierForm({ formData, onChange }: SupplierFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Tên nhà cung cấp"
        value={formData.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Nhập tên nhà cung cấp"
      />
      <Input
        label="Địa chỉ"
        value={formData.address}
        onChange={(e) => onChange("address", e.target.value)}
        placeholder="Nhập địa chỉ nhà cung cấp"
      />
      <Input
        label="Liên hệ"
        value={formData.contact}
        onChange={(e) => onChange("contact", e.target.value)}
        placeholder="Nhập thông tin liên hệ"
      />
    </div>
  );
}
