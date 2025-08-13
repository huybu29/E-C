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
        const res = await api.get("/order/orders/"); // endpoint backend lấy list order của user
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
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Danh sách đơn hàng</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Mã đơn</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Ngày tạo</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Tổng tiền</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-gray-50 cursor-pointer"
              // Bạn có thể thêm onClick để xem chi tiết
              // onClick={() => navigate(`/orders/${order.id}`)}
            >
              <td className="border border-gray-300 px-4 py-2">{order.id}</td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {Number(order.total_price).toLocaleString()} đ
              </td>
              <td className="border border-gray-300 px-4 py-2">{order.status || "Chưa cập nhật"}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
              <button
                onClick={() => navigate(`/order/${order.id}`)}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-400"
              >
                Xem chi tiết
              </button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
