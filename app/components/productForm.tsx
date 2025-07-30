import { Input } from "./input";

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  unitPrice: string;
  categoryId: string;
  supplierId: string;
}

interface ProductFormProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: string) => void;
}

export function ProductForm({ formData, onChange }: ProductFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Mã SKU"
        value={formData.sku}
        onChange={(e) => onChange("sku", e.target.value)}
        placeholder="Nhập mã SKU"
      />
      <Input
        label="Tên sản phẩm"
        value={formData.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Nhập tên sản phẩm"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Nhập mô tả sản phẩm"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <Input
        label="Giá bán"
        type="number"
        value={formData.unitPrice}
        onChange={(e) => onChange("unitPrice", e.target.value)}
        placeholder="Nhập giá bán"
      />
      <Input
        label="Danh mục ID"
        type="number"
        value={formData.categoryId}
        onChange={(e) => onChange("categoryId", e.target.value)}
        placeholder="Nhập ID danh mục"
      />
      <Input
        label="Nhà cung cấp ID"
        type="number"
        value={formData.supplierId}
        onChange={(e) => onChange("supplierId", e.target.value)}
        placeholder="Nhập ID nhà cung cấp"
      />
    </div>
  );
}
