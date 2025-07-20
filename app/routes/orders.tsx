export default function Orders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
        <p className="text-gray-600 mt-2">
          Theo dõi và quản lý đơn hàng
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[--dashboard-secondary] to-[--dashboard-tertiary] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Trang Đơn Hàng
          </h3>
          <p className="text-gray-600">
            TEST QUAN LY DON HANG ABC444.
          </p>
          <button className="mt-4 bg-gradient-to-r from-[--dashboard-secondary] to-[--dashboard-tertiary] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
            Tạo Đơn Hàng Mới
          </button>
        </div>
      </div>
    </div>
  );
}
