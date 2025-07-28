import { Layout } from "~/components/layout";

export default function Vouchers() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Mã giảm giá</h1>
          <p className="text-gray-600">Tạo và quản lý mã giảm giá</p>
        </div>

        <div className="bg-surface p-12 rounded-lg shadow-md border border-gray-200 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Trang Mã giảm giá</h2>
          <p className="text-gray-600 mb-4">Tính năng này đang được phát triển.</p>
          <p className="text-sm text-gray-500">
            Hãy tiếp tục yêu cầu để hoàn thiện trang này với đầy đủ chức năng CRUD.
          </p>
        </div>
      </div>
    </Layout>
  );
}
