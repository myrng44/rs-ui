import { useState, useEffect } from "react";
import type { Product, ProductListResponse } from "~/types/product";
import Container from "../components/ui/Container";
import { Card, CardHeader, CardBody } from "~/components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import AddProductForm from "../components/forms/AddProductForm";
import EditProductForm from "../components/forms/EditProductForm";
import ProductTable from '../components/forms/ProductTable'
import apiClient from "../utils/api";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  //fetch products from API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/api/v1/products");

      if (response.ok) {
        const data: ProductListResponse = await response.json();
        setProducts(data.elements);
        setTotalProducts(data.totalElements);
        setError("");
      } else {
        setError("Có lỗi xảy ra khi tải danh sách sản phẩm");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Có lỗi xảy ra khi tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  //load products
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddSuccess = () => {
    //refresh product list and close modal
    fetchProducts();
    setTimeout(() => {
      setIsAddModalOpen(false);
    }, 1500);
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    //refresh product list and close modal
    fetchProducts();
    setTimeout(() => {
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    }, 1500);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/v1/products/${productId}`);

      if (response.ok) {
        //refresh product list
        fetchProducts();
      } else {
        alert("Có lỗi xảy ra khi xóa sản phẩm");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  //calculate stats from products
  const stats = [
    {
      title: "Tổng Sản Phẩm",
      value: totalProducts.toString(),
      color: "text-blue-600",
      icon: "📦",
    },
    {
      title: "Sản Phẩm Còn Hàng",
      value: Math.floor(totalProducts * 0.87).toString(), //mock
      color: "text-green-600",
      icon: "✅",
    },
    {
      title: "Sắp Hết Hàng",
      value: Math.floor(totalProducts * 0.1).toString(), //mock
      color: "text-yellow-600",
      icon: "⚠️",
    },
    {
      title: "Hết Hàng",
      value: Math.floor(totalProducts * 0.03).toString(), //mock
      color: "text-red-600",
      icon: "❌",
    },
  ];

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản Lý Sản Phẩm
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý kho hàng và thông tin sản phẩm ({totalProducts} sản phẩm)
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Thêm Sản Phẩm
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-red-800 text-sm">{error}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchProducts}
                  className="mt-2"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Product Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} hover>
              <div className="text-center p-2">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Product List Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Danh Sách Sản Phẩm
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={fetchProducts}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Làm mới
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Product Table */}
          <ProductTable
            products={products}
            onEdit={handleEditClick}
            onDelete={handleDeleteProduct}
            isLoading={isLoading}
          />
        </div>

        {/* Add Product Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleAddCancel}
          title="Thêm Sản Phẩm Mới"
          size="lg"
        >
          <AddProductForm
            onSuccess={handleAddSuccess}
            onCancel={handleAddCancel}
          />
        </Modal>

        {/* Edit Product Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleEditCancel}
          title="Sửa Thông Tin Sản Phẩm"
          size="lg"
        >
          {selectedProduct && (
            <EditProductForm
              product={selectedProduct}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </Modal>
      </div>
    </Container>
  );
}
