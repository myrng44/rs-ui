import Container from "../components/ui/Container";
import StatsCard from "../components/ui/StatsCard";
import { Card, CardHeader, CardBody } from "~/components/ui/Card";
import Button from "../components/ui/Button";

export default function Dashboard() {

  //mock cho dep
  const stats = [
    {
      title: "Tổng Doanh Thu",
      value: "1000đ",
      change: "+1%",
      changeType: 'positive',
      color: "text-[--dashboard-primary]",
    },
    {
      title: "Đơn Hàng",
      value: "1,234",
      change: "+15.3%",
      changeType: 'positive',
      color: "text-[--dashboard-secondary]",
    },
    {
      title: "Sản Phẩm",
      value: "100",
      change: "+8.2%",
      changeType: 'positive',
      color: "text-[--dashboard-tertiary]",
    },
    {
      title: "Khách Hàng",
      value: "432",
      change: "+12.5%",
      changeType: 'positive',
      color: "text-[--dashboard-accent]",
    },
  ];

  const quickActions = [
    { label: "Thêm Sản Phẩm", variant: "primary" as const },
    { label: "Tạo Đơn Hàng", variant: "secondary" as const },
    { label: "Thêm Khách Hàng", variant: "primary" as const },
    { label: "Xem Báo Cáo", variant: "secondary" as const },
  ];

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Tổng quan hệ thống quản lý cửa hàng Store maN
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              color={stat.color}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Thao Tác Nhanh</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  className="h-20 flex-col space-y-2"
                >
                  <svg
                    className="w-6 h-6"
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
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
