// src/pages/admin/OrderManagement.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminPage from "./AdminPage";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Gọi API mỗi khi statusFilter thay đổi
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let url = "/account/admin/orders/";
        if (statusFilter !== "all") {
          url += `?status=${statusFilter}`;
        }
        const res = await api.get(url);
        setOrders(res.data);
      } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  // Xóa order
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Ngăn row click
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;
    try {
      await api.delete(`/account/admin/orders/${id}/`);
      setOrders(orders.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert("Không thể xóa đơn hàng");
    }
  };

  // Chọn màu hiển thị theo trạng thái
  const statusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500 text-black";
      case "processing": return "bg-blue-500 text-white";
      case "shipped": return "bg-purple-500 text-white";
      case "delivered": return "bg-green-500 text-white";
      case "canceled": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <AdminPage>
      <div>
        <h1 className="text-2xl font-bold mb-6 text-[#FF7ED4]">
          Quản lý đơn hàng
        </h1>

        {/* Bộ lọc */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-white font-medium">Lọc theo trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded bg-[#3B0A4F] text-white border border-[#4E1883]"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Đang chờ</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="canceled">Hủy</option>
          </select>
        </div>

        {/* Bảng đơn hàng */}
        <div className="bg-[#2A083B] rounded-lg shadow-xl p-4 border border-[#4E1883] overflow-x-auto">
          <table className="w-full text-left border-collapse text-white min-w-[700px]">
            <thead>
              <tr className="bg-[#3B0A4F] text-white">
                <th className="p-3 border border-[#4E1883]">ID</th>
                <th className="p-3 border border-[#4E1883]">Khách hàng</th>
                <th className="p-3 border border-[#4E1883]">Tổng tiền</th>
                <th className="p-3 border border-[#4E1883]">Trạng thái</th>
                <th className="p-3 border border-[#4E1883]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-300">
                    Đang tải đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-300">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/admin/orders/${o.id}`)}
                    className="hover:bg-[#4E1883] transition cursor-pointer"
                  >
                    <td className="p-3 border border-[#4E1883] font-semibold">{o.id}</td>
                    <td className="p-3 border border-[#4E1883]">{o.user.username}</td>
                    <td className="p-3 border border-[#4E1883]">{o.total_price.toLocaleString()} VND</td>
                    <td className="p-3 border border-[#4E1883]">
                      <span className={`px-2 py-1 rounded font-bold ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 border border-[#4E1883] text-center">
                      <button
                        onClick={(e) => handleDelete(o.id, e)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
