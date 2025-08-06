import { Layout } from "../components/Layout";
import ProductTable from "../components/ProductForm";

export default function Products() {
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý sản phẩm
          </h1>
        </div>
        
        <ProductTable />
      </div>
    </Layout>
  );
}
