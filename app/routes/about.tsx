import { Layout } from "~/components/Layout";

export default function About() {
  return (
    <Layout>
      <section className="max-w-5xl mx-auto py-10 px-2 sm:px-4 space-y-12">
        <header>
          <h1 className="text-4xl font-extrabold text-primary mb-3 tracking-tight drop-shadow-sm">
            Về chúng tôi
          </h1>
          <p className="text-2xl text-gray-600 font-light">
            <span className="font-semibold text-primary">Store</span> - Hệ thống quản lý cửa hàng toàn diện, hiện đại và dễ sử dụng.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-200">
            <h2 className="text-xl font-bold text-primary mb-3 flex items-center gap-2">
              <span>🌟</span> Tầm nhìn
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">
              Trở thành giải pháp quản lý cửa hàng đáng tin cậy, giúp doanh nghiệp tối ưu hóa quy trình kinh doanh và nâng cao hiệu quả vận hành.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-200">
            <h2 className="text-xl font-bold text-primary mb-3 flex items-center gap-2">
              <span>🚀</span> Sứ mệnh
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">
              Cung cấp công cụ quản lý hiện đại, toàn diện, hỗ trợ doanh nghiệp phát triển bền vững trong thời đại số.
            </p>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-extrabold text-primary mb-8 text-center tracking-tight">
            Tính năng nổi bật
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            <Feature
              icon="📊"
              title="Dashboard thông minh"
              desc="Theo dõi thống kê kinh doanh real-time"
            />
            <Feature
              icon="📦"
              title="Quản lý sản phẩm"
              desc="Thêm, sửa, xóa sản phẩm dễ dàng"
            />
            <Feature
              icon="🛒"
              title="Xử lý đơn hàng"
              desc="Theo dõi đơn hàng từ A đến Z"
            />
            <Feature
              icon="📋"
              title="Quản lý kho"
              desc="Kiểm soát tồn kho hiệu quả"
            />
            <Feature
              icon="🏭"
              title="Nhà cung cấp"
              desc="Quản lý đối tác, nhà phân phối"
            />
            <Feature
              icon="🎫"
              title="Mã giảm giá"
              desc="Tạo và quản lý khuyến mãi"
            />
          </div>
        </section>
      </section>
    </Layout>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center flex flex-col items-center p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}