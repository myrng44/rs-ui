import { Button } from '../Button';

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
}

interface CategoryGridProps {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryGrid({ categories, onEdit, onDelete }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-gray-800">{cat.name}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
            {cat.description || '—'}
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button size="sm" onClick={() => onEdit(cat)}>
              Sửa
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(cat.id)}>
              Xoá
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
