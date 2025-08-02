import { useState, useEffect, useCallback } from "react";
import { Layout } from "~/components/Layout";
import { Button } from "~/components/Button";
import Dropdown from "~/components/Dropdown";
import { Modal } from "~/components/Modal";
import { Pagination } from "~/components/Pagination";
import { ProductForm } from "~/components/ProductForm";
import { productsApi } from "~/utils/api";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  categoryId: number;
  supplierId: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage] = useState(10);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page);
  };

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const loadProducts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const sort = "-createdTime";
      const response = await productsApi.getAll({
        offset,
        limit: itemsPerPage,
        sort: sort,
      });
      setProducts(response.elements);
      setTotalElements(response.totalElements);
      setError("");
    } catch (err: any) {
      setError("Không thể tải danh sách sản phẩm");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      await productsApi.create(formData);
      setIsAddModalOpen(false);
      resetForm();
      //reload current page -> show the new product
      loadProducts(currentPage);
    } catch (err: any) {
      setError("Không thể thêm sản phẩm");
      console.error("Error adding product:", err);
    } finally {
      setIsSubmitting(false);
    }
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

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      setError("");
      await productsApi.update(editingProduct.id, {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        unitPrice: formData.unitPrice,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
      });
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
      // Reload current page to show updated product
      loadProducts(currentPage);
    } catch (err: any) {
      setError("Không thể cập nhật sản phẩm");
      console.error("Error updating product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Xác nhận xóa sản phẩm này?")) {
      try {
        setError("");
        await productsApi.delete(id);
        // Check if current page becomes empty after deletion
        const newTotal = totalElements - 1;
        const maxPage = Math.ceil(newTotal / itemsPerPage);
        const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setCurrentPage(targetPage);
        loadProducts(targetPage); //refresh sau khi delete
      } catch (err: any) {
        setError("Không thể xóa sản phẩm");
        console.error("Error deleting product:", err);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };



  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
            <p className="text-gray-600">Thêm, sửa, xóa và quản lý sản phẩm</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
            Thêm sản phẩm
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-600">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map((product) => (
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
                ))
              )}
              </tbody>
            </table>
          </div>

          {!loading && products.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalElements / itemsPerPage)}
              totalItems={totalElements}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              loading={loading}
            />
          )}
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
              <Button onClick={handleAdd} disabled={isSubmitting}>
                {isSubmitting ? "Đang thêm..." : "Thêm"}
              </Button>
            </>
          }
        >
          <ProductForm formData={formData} onChange={handleFormChange} />
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
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </>
          }
        >
          <ProductForm
            formData={formData}
            onChange={handleFormChange}
            readonlyFields={["sku"]}
          />
        </Modal>
      </div>
    </Layout>
  );
}
