import type { Product } from '@/types/Products.type'
import { Input } from './input'
import Dropdown from '@/components/dropdown'

export interface ProductFormData {
  sku: number
  name: string
  description: string
  unitPrice: string
  categoryId: string
  supplierId: string
}

interface ProductFormProps {
  formData: Product
  onChange: (field: keyof Product, value: string) => void
  isEditMode?: boolean
}

export function ProductForm({ formData, onChange, isEditMode = false }: ProductFormProps) {
  const categoryOptions = [
    { value: '603630681414832128', label: 'Trà' },
    { value: '002', label: 'Rượu' }
  ]
  const supplierOptions = [
    { value: '001', label: 'Vinamilk' },
    { value: '002', label: 'Boncha' },
    { value: '003', label: 'Nestle' }
  ]
  return (
    <div className='space-y-4'>
      /** SKU chỉ hiển thị không chỉnh sửa nếu đang sửa */
      <Input
        label='Mã SKU'
        value={formData.sku}
        onChange={(e) => onChange('sku', e.target.value)}
        placeholder='Nhập mã SKU'
        disabled={isEditMode}
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
        label={'Danh mục'}
        value={formData.categoryId}
        onChange={(e) => onChange('categoryId', e.target.value)}
        options={categoryOptions}
      />
      <Dropdown
        label={'Nhà phân phối'}
        value={formData.supplierId}
        onChange={(e) => onChange('supplierId', e.target.value)}
        options={supplierOptions}
      />
    </div>
  )
}
