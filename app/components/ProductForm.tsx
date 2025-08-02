import { Input } from "./Input";
import Dropdown from "~/components/Dropdown";

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
  readonlyFields?: Array<keyof ProductFormData>;
}

export function ProductForm({
  formData,
  onChange,
  readonlyFields = [],
}: ProductFormProps) {
  const categoryOptions = [
    { value: "603630681414832128", label: "Trà" },
    { value: "002", label: "Rượu" },
  ];
  const supplierOptions = [
    { value: "001", label: "Vinamilk" },
    { value: "002", label: "Boncha" },
    { value: "003", label: "Nestle" },
  ];

  return (
    <div className="space-y-4">
      <Input
        label="Mã SKU"
        value={formData.sku}
        onChange={(e) => onChange("sku", e.target.value)}
        placeholder="Nhập mã SKU"
        readOnly={readonlyFields.includes("sku")}
      />
      <Input
        label="Tên sản phẩm"
        value={formData.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Nhập tên sản phẩm"
        readOnly={readonlyFields.includes("name")}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Nhập mô tả sản phẩm"
          rows={3}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${readonlyFields.includes("description") ? "bg-gray-100 text-gray-700 cursor-default" : ""}`}
          readOnly={readonlyFields.includes("description")}
        />
      </div>
      <Input
        label="Giá bán"
        type="number"
        value={formData.unitPrice}
        onChange={(e) => onChange("unitPrice", e.target.value)}
        placeholder="Nhập giá bán"
        readOnly={readonlyFields.includes("unitPrice")}
      />
      <Dropdown
        label="Danh mục"
        value={formData.categoryId}
        onChange={(e) => onChange("categoryId", e.target.value)}
        options={categoryOptions}
        readOnly={readonlyFields.includes("categoryId")}
      />
      <Dropdown
        label="Nhà phân phối"
        value={formData.supplierId}
        onChange={(e) => onChange("supplierId", e.target.value)}
        options={supplierOptions}
        readOnly={readonlyFields.includes("supplierId")}
      />
    </div>
  );
}