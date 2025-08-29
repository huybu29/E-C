import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../services/AuthContext";
import { Home, Package, ShoppingCart, BarChart2, LogOut } from "lucide-react";

export default function SellerPage({ children }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-100 p-4 flex flex-col gap-4 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-purple-400">📦 Khu vực Người bán</h2>

        <NavLink
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition"
        >
          <Home size={18} /> Quay lại trang chủ
        </NavLink>

        <NavLink
          to="/seller/products"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition hover:bg-gray-700 ${
              isActive ? "bg-gray-700 font-bold" : ""
            }`
          }
        >
          <Package size={18} /> Quản lý sản phẩm
        </NavLink>

        <NavLink
          to="/seller/orders"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition hover:bg-gray-700 ${
              isActive ? "bg-gray-700 font-bold" : ""
            }`
          }
        >
          <ShoppingCart size={18} /> Quản lý đơn hàng
        </NavLink>

        <NavLink
          to="/seller/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition hover:bg-gray-700 ${
              isActive ? "bg-gray-700 font-bold" : ""
            }`
          }
        >
          <BarChart2 size={18} /> Thống kê bán hàng
        </NavLink>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 bg-gray-900">
        {children || <Outlet />}
      </main>
    </div>
  );
}
