import { useState } from "react";
import { useAuth } from "~/context/AuthContext";
import { Navigate, useNavigate } from "react-router";
import { Card } from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    storeId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //handle form duoc submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setError("Username và password là bắt buộc!");
      setIsLoading(false);
      return;
    }

    try {
      //call login with backend API
      const storeId = formData.storeId ? parseInt(formData.storeId) : undefined;
      const success = await login(
        formData.username,
        formData.password,
        storeId,
      );

      if (success) {
        //navigate to dashboard neu successful login
        navigate("/", { replace: true });
      } else {
        setError("Username hoặc password không đúng");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  //redirect neu da logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center border-b border-gray-100 pb-6 mb-6">
{/*            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>*/}
            <img
              alt='Store maN'
              src='https://www.circlek.com.vn/wp-content/themes/circlek//images/img/ckclub.png'
              className='mx-auto h-16 w-auto'
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Đăng nhập Store maN
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Truy cập hệ thống quản lý cửa hàng
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert>{error}</Alert>}

            <FormField label="Username" htmlFor="username" required>
              <Input
                id="username"
                name="username"
                placeholder="Nhập username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Nhập password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </FormField>

            <FormField label="Store ID (Tùy chọn)" htmlFor="storeId">
              <Input
                id="storeId"
                name="storeId"
                type="number"
                placeholder="Nhập Store ID"
                value={formData.storeId}
                onChange={(e) => handleInputChange("storeId", e.target.value)}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Đăng nhập
            </Button>
          </form>

          <div className="pt-4 border-t border-gray-200 mt-6">
            <p className="text-xs text-gray-500 text-center">
              Hệ thống quản lý cửa hàng Store maN
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
