import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 flex flex-col">
      {/* Thanh tiêu đề */}
      <div className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 shadow-md px-6 py-4 flex items-center">
        <Link
          to="/"
          className="text-[28px] font-bold text-white hover:text-gray-200 mx-4"
        >
          MyShop
        </Link>
        <h1 className="text-[28px] font-semibold text-white">Đăng ký</h1>
      </div>

      {/* Form đăng ký */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mt-[100px] space-y-4 border border-purple-200"
      >
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-bold py-2 px-4 rounded-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:opacity-90 cursor-pointer"
          }`}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <div className="text-center text-gray-600">
          <span>Đã có tài khoản?</span>
          <Link
            to="/login"
            className="ml-2 font-bold text-purple-600 hover:text-purple-800"
          >
            Đăng nhập
          </Link>
        </div>

        {message.text && (
          <p
            className={`text-center text-sm ${
              message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}

export default Register;
