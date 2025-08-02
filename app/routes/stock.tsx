import { useState, useEffect } from "react";
import { Layout } from "~/components/Layout";
import { storeStockApi } from "~/utils/api";
import { useAuth } from "~/contexts/authContext";

interface StoreStock {
  id: string;
  productId: number;
  storeId: number;
  quantity: number;
}

export default function Stock() {
  const [ stocks, setStocks] = useState<StoreStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user?.storeId) {
      loadStocks();
    }
  }, [user]);

  const loadStocks = async () => {
    if (!user?.storeId) {
      setError("Không tìm thấy thông tin cửa hàng");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await storeStockApi.getFiltered(user.storeId);
      setStocks(response.elements);
      setError("");
    } catch (err: any) {
      setError("Không thể tải thông tin kho");
      console.error("Error loading stock:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Hết hàng", color: "bg-red-500 text-white" };
    if (quantity <= 10) return { label: "Sắp hết", color: "bg-warning text-white" };
    if (quantity <= 50) return { label: "Ít", color: "bg-blue-500 text-white" };
    return { label: "Đủ", color: "bg-success text-white" };
  };

  const formatProductId = (productId: number) => {
    return productId.toString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho</h1>
            <p className="text-gray-600">
              Theo dõi tồn kho cửa hàng {user?.storeId ? `#${user.storeId}` : ""}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Tổng {stocks.length} sản phẩm
          </div>
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
                <th className="text-left p-4 font-semibold text-gray-900">Product ID</th>
                <th className="text-left p-4 font-semibold text-gray-900">Số lượng tồn kho</th>
                <th className="text-left p-4 font-semibold text-gray-900">Trạng thái</th>
              </tr>
              </thead>
              <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải...</p>
                  </td>
                </tr>
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-600">
                    Chưa có sản phẩm nào trong kho
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => {
                  const status = getStockStatus(stock.quantity);
                  return (
                    <tr key={stock.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">
                        {formatProductId(stock.productId)}
                      </td>
                      <td className="p-4 text-gray-900 text-lg font-semibold">
                        {stock.quantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 text-sm rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && stocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {stocks.length}
              </div>
              <div className="text-sm text-gray-600">Sản phẩm</div>
            </div>
            <div className="bg-surface p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-success">
                {stocks.filter(s => s.quantity > 50).length}
              </div>
              <div className="text-sm text-gray-600">Đủ hàng</div>
            </div>
            <div className="bg-surface p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-warning">
                {stocks.filter(s => s.quantity > 0 && s.quantity <= 50).length}
              </div>
              <div className="text-sm text-gray-600">Sắp hết</div>
            </div>
            <div className="bg-surface p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-error">
                {stocks.filter(s => s.quantity === 0).length}
              </div>
              <div className="text-sm text-gray-600">Hết hàng</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
