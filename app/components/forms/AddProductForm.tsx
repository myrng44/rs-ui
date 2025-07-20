import React, { useState } from "react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import apiClient from "../../utils/api";

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  unitPrice: string;
  categoryId: string;
  supplierId: string;
}

interface AddProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const initialFormData: ProductFormData = {
  sku: '',
  name: '',
  description: '',
  unitPrice: '',
  categoryId: '',
  supplierId: '',
};

export default function AddProductForm({
  onSuccess,
  onCancel,
                                       }: AddProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    //clear error when user start typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU là bắt buộc";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    if (!formData.unitPrice.trim()) {
      newErrors.unitPrice = "Giá là bắt buộc";
    } else if (
      isNaN(Number(formData.unitPrice)) ||
      Number(formData.unitPrice) <= 0
    ) {
      newErrors.unitPrice = "Giá phải là số dương";
    }

    if (!formData.categoryId.trim()) {
      newErrors.categoryId = "Category ID là bắt buộc";
    } else if (isNaN(Number(formData.categoryId))) {
      newErrors.categoryId = "Category ID phải là số";
    }

    if (!formData.supplierId.trim()) {
      newErrors.supplierId = "Supplier ID là bắt buộc";
    } else if (isNaN(Number(formData.supplierId))) {
      newErrors.supplierId = "Supplier ID phải là số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      //prepare data to cal backend API
      const productData = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        unitPrice: parseFloat(formData.unitPrice.trim()),
        categoryId: parseInt(formData.categoryId.trim(), 10),
        supplierId: parseInt(formData.supplierId.trim(), 10),
      };

      const response = await apiClient.post('/api/v1/products', productData);

      if (response.ok) {
        setSubmitSuccess('Sản phẩm đã được thêm thành công!');
        setFormData(initialFormData);

        //call success calback after short delay
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.message || "Có lỗi xảy ra khi thêm sản phẩm");
      }
    } catch (error) {
      console.error("Error adding product: ", error);
      setSubmitError('Có lỗi xảy ra khi thêm sản phẩm! Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && <Alert variant="error">{submitError}</Alert>}
      {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="SKU" htmlFor="sku" required error={errors.sku}>
          <Input
            id="sku"
            name="sku"
            placeholder="VD: VINAMILK-2L"
            value={formData.sku}
            onChange={(e) => handleInputChange("sku", e.target.value)}
            error={!!errors.sku}
            required
          />
        </FormField>

        <FormField
          label="Tên sản phẩm"
          htmlFor="name"
          required
          error={errors.name}
        >
          <Input
            id="name"
            name="name"
            placeholder="VD: Sữa t��ơi Vinamilk loại 2l"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!errors.name}
            required
          />
        </FormField>
      </div>

      <FormField
        label="Mô tả"
        htmlFor="description"
        required
        error={errors.description}
      >
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Nhập mô tả sản phẩm..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors resize-none ${
            errors.description ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="Giá (VNĐ)"
          htmlFor="unitPrice"
          required
          error={errors.unitPrice}
        >
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            placeholder="VD: 1.349"
            value={formData.unitPrice}
            onChange={(e) => handleInputChange("unitPrice", e.target.value)}
            error={!!errors.unitPrice}
            required
          />
        </FormField>

        <FormField
          label="Category ID"
          htmlFor="categoryId"
          required
          error={errors.categoryId}
        >
          <Input
            id="categoryId"
            name="categoryId"
            type="number"
            placeholder="VD: 102"
            value={formData.categoryId}
            onChange={(e) => handleInputChange("categoryId", e.target.value)}
            error={!!errors.categoryId}
            required
          />
        </FormField>

        <FormField
          label="Supplier ID"
          htmlFor="supplierId"
          required
          error={errors.supplierId}
        >
          <Input
            id="supplierId"
            name="supplierId"
            type="number"
            placeholder="VD: 104"
            value={formData.supplierId}
            onChange={(e) => handleInputChange("supplierId", e.target.value)}
            error={!!errors.supplierId}
            required
          />
        </FormField>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
        )}
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Thêm sản phẩm
        </Button>
      </div>
    </form>
  );
}