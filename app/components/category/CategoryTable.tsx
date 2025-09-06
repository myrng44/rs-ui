import { Button } from '../Button';

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
}

interface CategoryTableProps {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">STT</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Tên</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Mô tả</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="font-medium">{cat.name}</div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="max-w-xs truncate" title={cat.description}>
                  {cat.description || '—'}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex justify-center gap-2">
                  <Button size="sm" onClick={() => onEdit(cat)}>
                    Sửa
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => onDelete(cat.id)}
                  >
                    Xoá
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}