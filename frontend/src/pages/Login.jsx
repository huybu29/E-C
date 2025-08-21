import React, { useState, useContext } from "react";
import api from "../services/api";
import { setTokens } from "../services/token";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/token/", form);

      setTokens(res.data.access, res.data.refresh);
      login(res.data.access);

      setError("");
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.detail || "Đăng nhập thất bại, vui lòng thử lại";
      setError(message);
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
          className="text-[28px] font-bold text-white hover:text-gray-200 mx-6"
        >
          🛒 MyShop
        </Link>
        <h1 className="text-[28px] font-semibold text-white">Đăng nhập</h1>
      </div>

      {/* Form login */}
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mt-[100px] border border-purple-200 space-y-4"
      >
        <h1 className="text-[20px] font-semibold text-purple-700">Đăng nhập</h1>

        <div className="mb-4">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
              error && !form.username ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>

        <div className="mb-4">
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
              error && !form.password ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 
                     text-white font-bold py-2 px-4 rounded-lg 
                     hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="text-center text-gray-600">
          <span>Chưa có tài khoản?</span>
          <Link
            to="/register/"
            className="ml-2 font-bold text-purple-600 hover:text-purple-800"
          >
            Đăng ký
          </Link>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
