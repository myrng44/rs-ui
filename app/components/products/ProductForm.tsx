import { Input } from '../Input';
import Dropdown from '~/components/Dropdown';
import { useEffect, useState } from 'react';
import { categoryApi, supplierApi } from '~/utils/api';

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
  const [availableCategories, setAvailableCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async () => {
    try {
      // categoryApi.getAll() bây giờ trả { elements, totalElements }
      const response = await categoryApi.getAll();
      const elems = (response && (response as any).elements) || [];
      setAvailableCategories([
        { value: '', label: '-- Chọn danh mục --' },
        ...elems.map((category: any) => ({
          value: String(category.id),
          label: category.name,
        })),
      ]);
    } catch (error) {
      console.error('Error loading categories', error);
      setAvailableCategories([{ value: '', label: '-- Chọn danh mục --' }]);
    }
  };

  const loadSuppliers = async () => {
    try {
      // supplierApi.getAll() trả { elements, totalElements }
      const response = await supplierApi.getAll();
      const elems = (response && (response as any).elements) || [];
      setAvailableSuppliers([
        { value: '', label: '-- Chọn nhà cung cấp --' },
        ...elems.map((supplier: any) => ({
          value: String(supplier.id),
          label: supplier.name,
        })),
      ]);
    } catch (error) {
      console.error('Error loading suppliers', error);
      setAvailableSuppliers([{ value: '', label: '-- Chọn nhà cung cấp --' }]);
    }
  };

  return (
    <div className='space-y-4'>
      <Input
        label='Mã SKU'
        value={formData.sku}
        onChange={(e) => onChange('sku', e.target.value)}
        placeholder='Nhập mã SKU'
        readonly={readonlyFields.includes('sku')}
      />
      <Input
        label='Tên sản phẩm'
        value={formData.name}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder='Nhập tên sản phẩm'
      />
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder='Nhập mô tả sản phẩm'
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
        />
      </div>
      <Input
        label='Giá bán'
        type='number'
        value={formData.unitPrice}
        onChange={(e) => onChange('unitPrice', e.target.value)}
        placeholder='Nhập giá bán'
      />

      <Dropdown
        label='Danh mục'
        value={formData.categoryId}
        onChange={(e) => onChange('categoryId', e.target.value)}
        options={availableCategories}
        required
        readonly={readonlyFields.includes('categoryId')}
      />

      <Dropdown
        label='Nhà cung cấp'
        value={formData.supplierId}
        onChange={(e) => onChange('supplierId', e.target.value)}
        options={availableSuppliers}
        required
        readonly={readonlyFields.includes('supplierId')}
      />
    </div>
  );
}