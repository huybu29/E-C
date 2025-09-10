import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setTokens } from "../services/token";
import { AuthContext } from "../services/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Validate password
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // ít nhất 8 ký tự, chữ + số
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (isLogin) {
        // === LOGIN ===
        const res = await api.post("/token/", {
          username: form.username,
          password: form.password,
        });
        setTokens(res.data.access, res.data.refresh);
        login(res.data.access);
        navigate("/");
      } else {
        // === REGISTER ===
        if (form.password !== form.confirmPassword) {
          setMessage({ text: "Mật khẩu xác nhận không khớp!", type: "error" });
          setLoading(false);
          return;
        }

        if (!validatePassword(form.password)) {
          setMessage({
            text: "Mật khẩu tối thiểu 8 ký tự, bao gồm chữ và số.",
            type: "error",
          });
          setLoading(false);
          return;
        }

        await api.post("/account/register/", {
          username: form.username,
          email: form.email,
          password: form.password,
        });

        setMessage({
          text: "Đăng ký thành công! Hãy kiểm tra email để xác nhận.",
          type: "success",
        });
        setIsLogin(true);
      }
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.detail ||
          err.response?.data?.username?.[0] ||
          err.response?.data?.email?.[0] ||
          "Có lỗi xảy ra!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // === GOOGLE LOGIN HANDLER ===
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google token:", credentialResponse.credential);
      const token = credentialResponse.credential; // Google ID Token
      // Gửi ID token lên API backend Django
      const res = await api.post("/account/auth/google/", { token });
      setTokens(res.data.access, res.data.refresh);
      login(res.data.access);
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      setMessage({ text: "Đăng nhập Google thất bại!", type: "error" });
    }
  };
  
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gradient-to-r from-purple-200 to-pink-200">
      <motion.div
        className="flex w-[200vw] h-full"
        animate={{ x: isLogin ? "0vw" : "-100vw" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        {/* Layout Login */}
        <div className="w-screen h-full flex">
          <motion.div
            className="w-1/2 flex items-center justify-center bg-white shadow-lg"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-2/3">
              <h2 className="text-3xl font-bold text-purple-600 mb-6">
                Đăng nhập
              </h2>
              {message.text && (
                <p
                  className={`mb-4 text-sm font-medium ${
                    message.type === "error" ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {message.text}
                </p>
              )}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="username"
                  autoComplete="off"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:outline-purple-500"
                />
                <input
                  type="password"
                  autoComplete="off"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mật khẩu"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:outline-purple-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </form>

              {/* Nút Google Login */}
              <div className="mt-4 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setMessage({ text: "Google Login Failed", type: "error" })
                  }
                />
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Đăng ký ngay
                </button>
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 font-semibold shadow"
              >
                ← Trở về trang chủ
              </button>
            </div>
          </motion.div>

          <motion.div
            className="w-1/2 flex items-center justify-center bg-purple-100"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/5087/5087579.png"
              alt="Login Illustration"
              className="w-80 h-80 object-contain"
            />
          </motion.div>
        </div>

        {/* Layout Register */}
        <div className="w-screen h-full flex">
          <motion.div className="w-1/2 flex items-center justify-center bg-pink-100">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5087/5087589.png"
              alt="Register Illustration"
              className="w-80 h-80 object-contain"
            />
          </motion.div>

          <motion.div className="w-1/2 flex items-center justify-center bg-white shadow-lg">
            <div className="w-2/3">
              <h2 className="text-3xl font-bold text-pink-600 mb-6">Đăng ký</h2>
              {message.text && (
                <p
                  className={`mb-4 text-sm font-medium ${
                    message.type === "error" ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {message.text}
                </p>
              )}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:outline-pink-500"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:outline-pink-500"
                />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mật khẩu"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:outline-pink-500"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:outline-pink-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-500">
                Đã có tài khoản?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-pink-600 font-semibold hover:underline"
                >
                  Đăng nhập ngay
                </button>
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 font-semibold shadow "
              >
                ← Trở về trang chủ
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
