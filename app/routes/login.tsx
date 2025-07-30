import {type FormEvent, useState} from "react";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { authApi } from "~/utils/api";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    storeId: "1",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await authApi.login(formData);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      window.location.href = "/dashboard";
    } catch (err: any) {
      if (err.status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
      } else {
        setError("Lỗi kết nối đến server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-white font-bold">RS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập Store maN</h1>
          <p className="text-gray-600">Vui lòng nhập thông tin đăng nhập</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Username *"
            type="text"
            placeholder="Nhập username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <div className="relative">
            <Input
              label="Password *"
              type="password"
              placeholder="Nhập password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <Input
            label="Store ID (Tùy chọn)"
            type="text"
            placeholder="Nhập Store ID"
            value={formData.storeId}
            onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
          />

          {error && (
            <div className="text-error text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <div className="text-center">
            <button type="button" className="text-sm text-gray-500 hover:text-gray-700">
              <a href={"https://forms.office.com/r/DkAixzbSjg"}>Gửi yêu cầu hỗ trợ?</a>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
