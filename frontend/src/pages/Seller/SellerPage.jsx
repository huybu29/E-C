import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../services/AuthContext";

export default function SellerPage({ children }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col gap-4">
        <NavLink
          to="/"
          className="block px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
        >
          ⬅ Quay lại trang chủ
        </NavLink>

        <NavLink
          to="/seller/products"
          className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700 font-bold" : ""
            }`
          }
        >
          Quản lý sản phẩm
        </NavLink>

        <NavLink
          to="/seller/orders"
          className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700 font-bold" : ""
            }`
          }
        >
          Quản lý đơn hàng
        </NavLink>
        <NavLink
          to="/seller/dashboard"
          className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700 font-bold" : ""
            }`
          }
        >
          Thong kê bán hàng
        </NavLink>
        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2 bg-red-600 rounded hover:bg-red-500"
        >
          🚪 Đăng xuất
        </button>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 bg-gray-100">
        {children || <Outlet />}
      </main>
    </div>
  );
}
