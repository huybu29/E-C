import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import AdminPage from "./AdminPage";

export default function SellerManagement() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // lọc trạng thái
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/account/admin/sellers/") // API backend trả danh sách sellers
      .then((res) => {
        console.log("Fetched sellers:", res.data);
        setSellers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải danh sách người bán");
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleRowClick = (sellerId) => {
    navigate(`/admin/sellers/${sellerId}`);
  };

  const handleApprove = async (sellerId) => {
    try {
      await api.patch(`/account/admin/sellers/${sellerId}/`);
      setSellers(
        sellers.map((s) =>
          s.id === sellerId ? { ...s, is_approved: true } : s
        )
      );
    } catch (err) {
      console.error("Lỗi khi duyệt seller:", err);
      alert("Không thể duyệt seller");
    }
  };

  const handleDelete = async (sellerId) => {
    try {
      await api.delete(`/account/admin/sellers/${sellerId}/`);
      setSellers(sellers.filter((s) => s.id !== sellerId));
    } catch (err) {
      console.error("Lỗi khi xóa seller:", err);
      alert("Không thể xóa seller");
    }
  };

  // ===== Bộ lọc =====
  const filteredSellers = sellers.filter((s) => {
    const matchSearch =
      s.username.toLowerCase().includes(search.toLowerCase()) 
     

    let matchStatus = true;
    if (statusFilter === "approved") matchStatus = s.is_approved;
    if (statusFilter === "pending") matchStatus = !s.is_approved;

    return matchSearch && matchStatus;
  });

  if (loading) return <p>Đang tải danh sách người bán...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <AdminPage>
      <div className="min-h-screen bg-[#1C0126] p-6 text-white">
        <h1 className="text-2xl font-bold mb-6 text-[#FF7ED4]">
          Seller Management
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#4E1883] bg-[#2A083B] text-white focus:outline-none focus:ring-2 focus:ring-[#FF7ED4]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>

        {/* Bảng Seller */}
        <div className="bg-[#2A083B] rounded-lg shadow-xl p-4 border border-[#4E1883] overflow-x-auto">
          <table className="w-full text-left border-collapse text-white">
            <thead>
              <tr className="bg-[#3B0A4F] text-white">
                <th className="p-3 border border-[#4E1883]">ID</th>
                <th className="p-3 border border-[#4E1883]">Username</th>
                
                <th className="p-3 border border-[#4E1883]">Approved</th>
                <th className="p-3 border border-[#4E1883]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.length > 0 ? (
                filteredSellers.map((s) => (
                  <tr
                    key={s.user}
                    className="hover:bg-[#4E1883] transition cursor-pointer"
                  >
                    <td
                      className="p-3 border border-[#4E1883] font-semibold"
                      onClick={() => handleRowClick(s.user)}
                    >
                      {s.id}
                    </td>
                    <td
                      className="p-3 border border-[#4E1883] font-semibold"
                      onClick={() => handleRowClick(s.id)}
                    >
                      {s.username}
                    </td>
                    
                    <td className="p-3 border border-[#4E1883] text-center">
                      {s.is_approved ? "✅" : "⏳"}
                    </td>
                    <td className="p-3 border border-[#4E1883] text-center space-x-2">
                      {!s.is_approved && (
                        <button
                          onClick={() => handleApprove(s.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(s.id)}
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
                    colSpan="5"
                    className="p-3 text-center text-gray-400 italic"
                  >
                    Không tìm thấy người bán nào
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
