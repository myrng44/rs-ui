import {useState, useEffect, type FormEvent} from "react";
import React from "react";
import type { Product, ProductFormData } from "~/types/product";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import apiClient from "../../utils/api";

interface EditProductFormProps {
  product: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditProductForm({
                                          product,
                                          onSuccess,
                                          onCancel,
                                        }: EditProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    sku: "",
    name: "",
    description: "",
    unitPrice: "",
    categoryId: "",
    supplierId: "",
  });
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  //form khoi tao
  useEffect(() => {
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice.toString(),
      categoryId: product.categoryId.toString(),
      supplierId: product.supplierId.toString(),
    });
  }, [product]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    //clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      //prepare data de goi api, convert strings to numbers
      const productData = {
        id: product.id,
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        unitPrice: parseFloat(formData.unitPrice.trim()),
        categoryId: parseInt(formData.categoryId.trim(), 10),
        supplierId: parseInt(formData.supplierId.trim(), 10),
      };

      const response = await apiClient.put(
        `/api/v1/products/${product.id}`,
        productData,
      );

      if (response.ok) {
        setSubmitSuccess("Sản phẩm đã được cập nhật thành công!");

        //call success callback after a short delay
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        let errorMessage = "Có lỗi xảy ra khi cập nhật sản phẩm";

        if (response.status === 404) {
          errorMessage = "Sản phẩm này không còn tồn tại. Có thể đã bị xóa bởi người khác.";
          //auto close modal and refresh list after showing error
          setTimeout(() => {
            onSuccess?.(); // This will refresh the product list
          }, 3000);
        } else {
          try {
            const errorData = await response.json();
          } catch (e) {

          }
        }
        setSubmitError(errorMessage);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setSubmitError("Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && <Alert variant="error">{submitError}</Alert>}
      {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Đang sửa sản phẩm:</span> {product.name}{" "}
          (ID: {product.id})
        </p>
      </div>

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
            placeholder="VD: Sữa tươi Vinamilk loại 2l"
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
            placeholder="VD: 1349đ"
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
          Cập nhật sản phẩm
        </Button>
      </div>
    </form>
  );
}
