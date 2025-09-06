import { Input } from '~/components/Input';
import Dropdown from '~/components/Dropdown';
import { useEffect, useState } from 'react';
import { categoryApi } from '~/utils/api';

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
}

interface CategoryFormProps {
  formData: CategoryFormData;
  onChange: (field: keyof CategoryFormData, value: string) => void;
  readonlyFields?: Array<keyof CategoryFormData>;
}

export function CategoryForm({
  formData,
  onChange,
  readonlyFields = [],
}: CategoryFormProps) {
  const [availableParents, setAvailableParents] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParentCategories();
  }, []);

  const loadParentCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      const elems = (response && (response as any).elements) || [];
      setAvailableParents([
        { value: '', label: '-- Không có (danh mục gốc) --' },
        ...elems.map((category: any) => ({
          value: String(category.id),
          label: category.name,
        })),
      ]);
    } catch (error) {
      console.error('Error loading parent categories', error);
      setAvailableParents([{ value: '', label: '-- Không có (danh mục gốc) --' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        label="Tên danh mục"
        value={formData.name}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder="Nhập tên danh mục"
        readonly={readonlyFields.includes('name')}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Nhập mô tả danh mục"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          readOnly={readonlyFields.includes('description')}
        />
      </div>

      <Dropdown
        label="Danh mục cha"
        value={formData.parentId}
        onChange={(e) => onChange('parentId', e.target.value)}
        options={availableParents}
        readonly={readonlyFields.includes('parentId')}
        helperText={loading ? "Đang tải danh sách danh mục..." : undefined}
      />
    </div>
  );
}