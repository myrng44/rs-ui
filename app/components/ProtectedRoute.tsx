import type { ReactNode } from "react";
import { useAuth } from "~/context/AuthContext";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  //show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[--dashboard-primary] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  //if user is not authenticated return ve trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //user is authenticated thi render protected content
  return <>{children}</>;
}
