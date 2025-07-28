import { useState } from "react";
import { Layout } from "~/components/layout";
import { Button } from "~/components/button";
import { Modal } from "~/components/modal";
import { Input } from "~/components/input";

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  categoryId: number;
  supplierId: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, sku: "PROD001", name: "Sản phẩm A", description: "Mô tả sản phẩm A", unitPrice: 100000, categoryId: 1, supplierId: 1 },
    { id: 2, sku: "PROD002", name: "Sản phẩm B", description: "Mô tả sản phẩm B", unitPrice: 200000, categoryId: 2, supplierId: 1 },
    { id: 3, sku: "PROD003", name: "Sản phẩm C", description: "Mô tả sản phẩm C", unitPrice: 150000, categoryId: 1, supplierId: 2 },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    unitPrice: "",
    categoryId: "",
    supplierId: "",
  });

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      description: "",
      unitPrice: "",
      categoryId: "",
      supplierId: "",
    });
  };

  const handleAdd = () => {
    const newProduct: Product = {
      id: Date.now(),
      sku: formData.sku,
      name: formData.name,
      description: formData.description,
      unitPrice: Number(formData.unitPrice),
      categoryId: Number(formData.categoryId),
      supplierId: Number(formData.supplierId),
    };
    setProducts([...products, newProduct]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice.toString(),
      categoryId: product.categoryId.toString(),
      supplierId: product.supplierId.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editingProduct) return;

    setProducts(products.map(p =>
      p.id === editingProduct.id
        ? {
          ...p,
          sku: formData.sku,
          name: formData.name,
          description: formData.description,
          unitPrice: Number(formData.unitPrice),
          categoryId: Number(formData.categoryId),
          supplierId: Number(formData.supplierId),
        }
        : p
    ));
    setIsEditModalOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const ProductForm = () => (
    <div className="space-y-4">
      <Input
        label="Mã SKU"
        value={formData.sku}
        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
        placeholder="Nhập mã SKU"
      />
      <Input
        label="Tên sản phẩm"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Nhập tên sản phẩm"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Nhập mô tả sản phẩm"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <Input
        label="Giá bán"
        type="number"
        value={formData.unitPrice}
        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
        placeholder="Nhập giá bán"
      />
      <Input
        label="Danh mục ID"
        type="number"
        value={formData.categoryId}
        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
        placeholder="Nhập ID danh mục"
      />
      <Input
        label="Nhà cung cấp ID"
        type="number"
        value={formData.supplierId}
        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
        placeholder="Nhập ID nhà cung cấp"
      />
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
            <p className="text-gray-600">Thêm, sửa, xóa và quản lý sản phẩm</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            Thêm sản phẩm
          </Button>
        </div>

        <div className="bg-surface rounded-lg shadow-md border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-900">Mã SKU</th>
                <th className="text-left p-4 font-semibold text-gray-900">Tên sản phẩm</th>
                <th className="text-left p-4 font-semibold text-gray-900">Mô tả</th>
                <th className="text-left p-4 font-semibold text-gray-900">Giá bán</th>
                <th className="text-left p-4 font-semibold text-gray-900">Thao tác</th>
              </tr>
              </thead>
              <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{product.sku}</td>
                  <td className="p-4 text-gray-900">{product.name}</td>
                  <td className="p-4 text-gray-600">{product.description}</td>
                  <td className="p-4 text-gray-900">{formatPrice(product.unitPrice)}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title="Thêm sản phẩm mới"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleAdd}>
                Thêm
              </Button>
            </>
          }
        >
          <ProductForm />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
            resetForm();
          }}
          title="Chỉnh sửa sản phẩm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleUpdate}>
                Cập nhật
              </Button>
            </>
          }
        >
          <ProductForm />
        </Modal>
      </div>
    </Layout>
  );
}
