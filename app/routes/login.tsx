import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { authApi } from "~/utils/api";
import { useAuth } from "~/contexts/authContext";

export default function Login() {
  const [formData, setFormData] = useState({ userName: "", passWord: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login: authLogin } = useAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await authApi.login(formData);
      const token = res?.data?.token;
      if (!token) {
        setError("Không nhận được token từ server");
        return;
      }
      localStorage.setItem("accessToken", token);
      authLogin(token);
      window.location.href = "/";
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
      } else {
        setError("Lỗi kết nối đến server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-4/5 flex items-center justify-center bg-gradient-to-br from-primary via-accent to-secondary p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <img
              className="w-20 h-20 mx-auto mb-4"
              src="https://www.circlek.com.vn/wp-content/themes/circlek//images/img/ckclub.png"
              alt="Store Logo"
            />
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập Store</h1>
            <p className="text-gray-600 text-sm">Quản lý cửa hàng dễ dàng hơn</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Tên đăng nhập"
              type="text"
              placeholder="Nhập username"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              required
              autoComplete="username"
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              value={formData.passWord}
              onChange={(e) => setFormData({ ...formData, passWord: e.target.value })}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="text-error text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r hover:3E5F44 from-cyan-700 to-cyan-400  hover:to-secondary/90"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <a
              href="https://forms.office.com/r/DkAixzbSjg"
              className="text-sm text-gray-500 hover:text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gửi yêu cầu hỗ trợ?
            </a>
          </div>
        </motion.div>
      </div>

     <div className="hidden lg:flex lg:w-1/5 items-center justify-center bg-white p-6">
          <img className="max-w-[300px] w-full h-auto object-contain" src = "https://tse2.mm.bing.net/th/id/OIP.pvheUab0fyXQJAHbht8ztwHaFS?rs=1&pid=ImgDetMain&o=7&rm=3"
          alt="HUS Logo" />
     </div>

  </div>
  );
}
