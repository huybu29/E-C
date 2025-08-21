import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/order/orders/");
        setOrders(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn hàng:", err);
        setError("Không thể lấy danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-6">Đang tải đơn hàng...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (orders.length === 0)
    return <p className="text-center mt-6">Bạn chưa có đơn hàng nào.</p>;

  return (
    <div className="max-w-6xl my-[100px] mx-auto p-8 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">🛒 Danh sách đơn hàng</h1>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-purple-200 to-purple-100 text-gray-900">
            <tr>
              <th className="px-6 py-3 font-semibold">Mã đơn</th>
              <th className="px-6 py-3 font-semibold">Ngày tạo</th>
              <th className="px-6 py-3 font-semibold text-right">Tổng tiền</th>
              <th className="px-6 py-3 font-semibold">Trạng thái</th>
              <th className="px-6 py-3 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-purple-50 transition cursor-pointer"
              >
                <td className="px-6 py-3">{order.id}</td>
                <td className="px-6 py-3">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 text-right font-medium text-purple-700">
                  {Number(order.total_price).toLocaleString()} đ
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "Hoàn tất"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Đang xử lý"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status || "Chưa cập nhật"}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow hover:opacity-90 transition"
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
