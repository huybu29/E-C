import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../services/AuthContext";
import {
  Users,
  ShoppingCart,
  Package,
  BarChart2,
  LogOut,
  Home,
} from "lucide-react";
import NotificationBell from "../../components/NotifiBell";
import API from "../../services/api";

export default function AdminPage({ children }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/account/me/");
      setUser(res.data);
    } catch (error) {
      console.error("Không thể lấy thông tin user", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null; // hoặc loading spinner

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

        {/* Chỉ superuser mới thấy mục Quản lý người dùng */}
        {user.is_superuser && (
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
        )}

        <NavLink
          to="/admin/sellers"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-[#FF3EA5] text-white font-bold"
                : "hover:bg-[#4E1883]"
            }`
          }
        >
          <Users size={18} /> Quản lý người bán
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
          to="/admin/categories"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-[#FF3EA5] text-white font-bold"
                : "hover:bg-[#4E1883]"
            }`
          }
        >
          <Package size={18} /> Quản lý danh mục
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
      </aside>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex justify-between items-center bg-[#3B0A4F] border-b border-[#6420AA] px-6 py-3">
          <h1 className="text-lg font-semibold text-[#FF7ED4]">
            Bảng điều khiển Admin
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />

            <button className="flex items-center gap-2 hover:text-[#FF3EA5] transition">
              Admin
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1 bg-[#B5176E] rounded-lg hover:bg-[#8E1257] transition"
            >
              <LogOut size={18} /> Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 bg-[#1C0126] overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
