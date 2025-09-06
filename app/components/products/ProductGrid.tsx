import { Button } from '../Button';

interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  stockQuantity?: number;
  imageUrl?: string;
}

interface ProductGridProps {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((p) => (
        <div
          key={p.id}
          className="bg-white border rounded-xl shadow hover:shadow-md transition p-4 flex flex-col"
        >
          <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold truncate">{p.name}</h3>
          <p className="text-gray-500 text-sm line-clamp-2">{p.description}</p>

          <div className="mt-2 text-base font-bold text-indigo-600">
            {p.unitPrice.toLocaleString()} đ
          </div>

          {p.stockQuantity !== undefined && (
            <div
              className={`mt-1 text-sm font-medium ${
                p.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {p.stockQuantity > 0
                ? `Còn ${p.stockQuantity} sp`
                : 'Hết hàng'}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button size="sm" onClick={() => onEdit(p)}>
              Sửa
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(p.id)}
            >
              Xoá
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
