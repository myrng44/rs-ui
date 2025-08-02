import { type FormEvent, useState } from "react";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { authApi } from "~/utils/api";

export default function Login() {
  const [formData, setFormData] = useState({
    userName: "",
    passWord: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

 const handleLogin = async (e: FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  try {
    const data = await authApi.login({
      userName: formData.userName,
      passWord: formData.passWord,
    });
    localStorage.setItem("token", data.token);
    window.location.href = "/";
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      ("status" in err || ("response" in err && typeof err.response === "object" && err.response !== null && "status" in err.response))
    ) {
      const status =
        (err as { status?: number }).status ??
        (err as { response?: { status?: number } }).response?.status;
      if (status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
      } else {
        setError("Lỗi kết nối đến server");
      }
    } else {
      setError("Lỗi không xác định");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img
            className="w-20 h-20 rounded-lg mx-auto mb-4 flex items-center justify-center"
            src="https://www.circlek.com.vn/wp-content/themes/circlek//images/img/ckclub.png"
            alt="Store maN logo"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập Store maN</h1>
          <p className="text-gray-600">Vui lòng nhập thông tin đăng nhập</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Username"
            type="text"
            placeholder="Nhập username"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            required
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Nhập password"
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
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <div className="text-center">
            <a
              href="https://forms.office.com/r/DkAixzbSjg"
              className="text-sm text-gray-500 hover:text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gửi yêu cầu hỗ trợ?
            </a>
            <div className="bg-emerald-100 rounded-lg w-xs justify-center items-center mx-auto p-2 mt-2">
              <p>(TEST)account: admin</p>
              <p>(TEST)password: password123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}