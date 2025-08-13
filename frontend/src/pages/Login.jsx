import React, { useState } from "react";
import api from "../services/api"; // axios instance
import { setTokens } from "../services/token";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

    // Lưu token
    setTokens(res.data.access, res.data.refresh);

    // Decode token
    const user = jwtDecode(res.data.access);
    console.log("User info:", user);

    setError("");

    if (onLogin) onLogin(user); // cập nhật trạng thái login
    navigate("/"); // điều hướng về trang chủ

  } catch (err) {
    console.error(err.response?.data || err.message);
    const message =
      err.response?.data?.detail || "Đăng nhập thất bại, vui  lòng thử lại";
    setError(message);
  } finally {
    setLoading(false);
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md w-full max-w-sm mx-auto mt-[200px] border border-gray-200 space-y-4"
    >
      <div className="mb-4">
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded ${
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
          className={`w-full px-4 py-2 border rounded ${
            error && !form.password ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Đang đăng nhập..." : "Login"}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
}

export default Login;
