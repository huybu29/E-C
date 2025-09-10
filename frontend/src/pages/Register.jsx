import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Nếu dùng React Router

export default function () {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); // Điều hướng về trang chủ
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.username || !form.email || !form.password) {
      setMessage({ text: "Vui lòng điền đầy đủ thông tin", type: "error" });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage({ text: "Email không hợp lệ", type: "error" });
      return false;
    }
    if (form.password.length < 6) {
      setMessage({ text: "Mật khẩu phải từ 6 ký tự trở lên", type: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post("/account/register/", form);
      setMessage({ text: "Đăng ký thành công!", type: "success" });
      setForm({ username: "", email: "", password: "" });
      navigate("/login");
    } catch (err) {
      const errorMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        "Đăng ký thất bại";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gradient-to-r from-purple-200 to-pink-200 relative">
      
      {/* Nút quay về Home */}
      <button
        onClick={() => navigate("/")} // hoặc: window.location.href = "/"
        className="absolute top-5 left-5 px-4 py-2 bg-white/80 hover:bg-white text-purple-600 font-semibold rounded-xl shadow-md transition"
      >
        ← Trang chủ
      </button>

      {/* Container bao 2 layout */}
      <motion.div
        className="flex w-[200vw] h-full"
        animate={{ x: isLogin ? "0vw" : "-100vw" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        {/* Layout Login */}
        <div className="w-screen h-full flex">
          {/* Left Form */}
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
              <form className="space-y-5">
                <input
                  type="email"
                  placeholder="Email"
                  autocomplete="off"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-purple-500"
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  autocomplete="off"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-purple-500"
                />
                <button className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-md">
                  Đăng nhập
                </button>
              </form>
              <p className="mt-6 text-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </motion.div>

          {/* Right Image */}
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
          {/* Left Image */}
          <motion.div
            className="w-1/2 flex items-center justify-center bg-pink-100"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/5087/5087589.png"
              alt="Register Illustration"
              className="w-80 h-80 object-contain"
            />
          </motion.div>

          {/* Right Form */}
          <motion.div
            className="w-1/2 flex items-center justify-center bg-white shadow-lg"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-2/3">
              <h2 className="text-3xl font-bold text-pink-600 mb-6">
                Đăng ký
              </h2>
              <form className="space-y-5">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-pink-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-pink-500"
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-pink-500"
                />
                <button className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-md">
                  Đăng ký
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
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
