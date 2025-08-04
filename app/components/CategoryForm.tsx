import { Input } from './Input';

interface CategoryFormData {
	name: string;
	description: string;
}

interface CategoryFormProps {
	formData: CategoryFormData;
	onChange: (field: keyof CategoryFormData, value: string) => void;
}

export function CategoryForm({ formData, onChange }: CategoryFormProps) {
	return (
		<div className='space-y-4'>
			<Input
				label='Tên danh mục'
				value={formData.name}
				onChange={(e) => onChange('name', e.target.value)}
				placeholder='Nhập tên danh mục'
			/>
			<div>
				<label className='block text-sm font-medium text-gray-700 mb-1'>Mô tả</label>
				<textarea
					value={formData.description}
					onChange={(e) => onChange('description', e.target.value)}
					placeholder='Nhập mô tả danh mục'
					rows={3}
					className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
				/>
			</div>
		</div>
	);
}
