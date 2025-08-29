import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import AdminPage from "./AdminPage";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");   // lọc role
  const [activeFilter, setActiveFilter] = useState("all"); // lọc active
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/account/admin/users/")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải danh sách người dùng");
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleRowClick = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDelete = async (userId) => {
    
    try {
      await api.delete(`/account/admin/users/${userId}/`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Lỗi khi xóa user:", err);
      alert("Không thể xóa user");
    }
  };

  // ===== Bộ lọc =====
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    let matchRole = true;
    if (roleFilter === "staff") matchRole = u.is_staff;
    if (roleFilter === "superuser") matchRole = u.is_superuser;
    if (roleFilter === "normal") matchRole = !u.is_staff && !u.is_superuser;

    let matchActive = true;
    if (activeFilter === "active") matchActive = u.is_active;
    if (activeFilter === "inactive") matchActive = !u.is_active;

    return matchSearch && matchRole && matchActive;
  });

  if (loading) return <p>Đang tải danh sách người dùng...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <AdminPage>
      <div className="min-h-screen bg-[#1C0126] p-6 text-white">
        <h1 className="text-2xl font-bold mb-6 text-[#FF7ED4]">
          User Management
        </h1>

        {/* Bộ lọc */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm username/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#4E1883] bg-[#2A083B] text-white focus:outline-none focus:ring-2 focus:ring-[#FF7ED4]"
          />

          {/* Lọc role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#4E1883] bg-[#2A083B] text-white focus:outline-none focus:ring-2 focus:ring-[#FF7ED4]"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="staff">Staff</option>
            <option value="superuser">Superuser</option>
            <option value="normal">Người dùng thường</option>
          </select>

          {/* Lọc active */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#4E1883] bg-[#2A083B] text-white focus:outline-none focus:ring-2 focus:ring-[#FF7ED4]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        {/* Bảng User */}
        <div className="bg-[#2A083B] rounded-lg shadow-xl p-4 border border-[#4E1883] overflow-x-auto">
          <table className="w-full text-left border-collapse text-white">
            <thead>
              <tr className="bg-[#3B0A4F] text-white">
                <th className="p-3 border border-[#4E1883]">ID</th>
                <th className="p-3 border border-[#4E1883]">Username</th>
                <th className="p-3 border border-[#4E1883]">Email</th>
                <th className="p-3 border border-[#4E1883]">Is Staff</th>
                <th className="p-3 border border-[#4E1883]">Is Superuser</th>
                <th className="p-3 border border-[#4E1883]">Active</th>
                <th className="p-3 border border-[#4E1883]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-[#4E1883] transition cursor-pointer"
                  >
                    <td
                      className="p-3 border border-[#4E1883] font-semibold"
                      onClick={() => handleRowClick(u.id)}
                    >
                      {u.id}
                    </td>
                    <td
                      className="p-3 border border-[#4E1883] font-semibold"
                      onClick={() => handleRowClick(u.id)}
                    >
                      {u.username}
                    </td>
                    <td
                      className="p-3 border border-[#4E1883]"
                      onClick={() => handleRowClick(u.id)}
                    >
                      {u.email}
                    </td>
                    <td className="p-3 border border-[#4E1883] text-center">
                      {u.is_staff ? "✅" : "❌"}
                    </td>
                    <td className="p-3 border border-[#4E1883] text-center">
                      {u.is_superuser ? "👑" : "❌"}
                    </td>
                    <td className="p-3 border border-[#4E1883] text-center">
                      {u.is_active ? "🟢" : "🔴"}
                    </td>
                    <td className="p-3 border border-[#4E1883] text-center space-x-2">
                      <button
                        onClick={() => handleRowClick(u.id)}
                        className="px-3 py-1 bg-[#FF7ED4] text-[#1C0126] rounded font-bold hover:bg-[#FF3EA5] transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="px-3 py-1 bg-[#B5176E] text-white rounded font-bold hover:bg-[#8E1257] transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-3 text-center text-gray-400 italic"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
