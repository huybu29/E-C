// src/pages/admin/AdminPage.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../services/AuthContext";
import { Users, ShoppingCart, Package, BarChart2, LogOut, Home } from "lucide-react";

export default function AdminPage({ children }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#2A0434] text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#3B0A4F] text-gray-100 p-4 flex flex-col gap-4 border-r border-[#6420AA]">
        <h2 className="text-xl font-bold mb-6 text-[#FF7ED4]">⚙️ Khu vực Admin</h2>

        <NavLink
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-[#6420AA] rounded-lg hover:bg-[#4E1883] transition"
        >
          <Home size={18} /> Quay lại trang chủ
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-[#FF3EA5] text-white font-bold"
                : "hover:bg-[#4E1883]"
            }`
          }
        >
          <Users size={18} /> Quản lý người dùng
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-[#FF3EA5] text-white font-bold"
                : "hover:bg-[#4E1883]"
            }`
          }
        >
          <ShoppingCart size={18} /> Quản lý đơn hàng
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-[#FF3EA5] text-white font-bold"
                : "hover:bg-[#4E1883]"
            }`
          }
        >
          <Package size={18} /> Quản lý sản phẩm
        </NavLink>

        <NavLink
          to="/admin/stats"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-[#FF3EA5] text-white font-bold"
                : "hover:bg-[#4E1883]"
            }`
          }
        >
          <BarChart2 size={18} /> Thống kê
        </NavLink>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 px-4 py-2 bg-[#B5176E] rounded-lg hover:bg-[#8E1257] transition"
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 bg-[#1C0126]">
        {children || <Outlet />}
      </main>
    </div>
  );
}
