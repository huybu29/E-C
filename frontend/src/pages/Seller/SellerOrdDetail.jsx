import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import SellerPage from "./SellerPage";

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchOrder(); }, []);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/order/seller-order-detail/${id}/`);
      setOrder(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      alert("Không thể tải đơn hàng");
    } finally { setLoading(false); }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await API.patch(`/order/seller-order-detail/${id}/`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái");
    } finally { setUpdating(false); }
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full font-semibold";
    switch (status) {
      case "pending": return `${base} bg-yellow-500 text-gray-900`;
      case "processing": return `${base} bg-blue-600 text-white`;
      case "shipped": return `${base} bg-purple-600 text-white`;
      case "delivered": return `${base} bg-green-600 text-white`;
      case "canceled": return `${base} bg-red-600 text-white`;
      default: return base;
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-300">Đang tải...</p>;
  if (!order) return <p className="text-center mt-10 text-red-500">Không tìm thấy đơn hàng</p>;

  return (
    <SellerPage>
      <div className="p-6 bg-gray-900 rounded-2xl shadow-lg flex-1 text-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-white">Chi tiết đơn hàng #{order.id}</h1>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-inner space-y-2">
          <p><strong>Khách hàng:</strong> <span className="text-blue-400">{order.user.username}</span></p>
          <p><strong>Tổng tiền:</strong> {order.total_price.toLocaleString()} ₫</p>
          <p><strong>Ngày tạo:</strong> {new Date(order.created_at).toLocaleString()}</p>
          <p>
            <strong>Trạng thái:</strong> <span className={getStatusBadge(order.status)}>{order.status}</span>
          </p>

          <div className="mt-2 flex items-center gap-2">
            <label className="font-semibold text-gray-100">Cập nhật trạng thái:</label>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="bg-gray-700 border border-gray-600 p-1 rounded focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="pending">Đang chờ</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="canceled">Hủy</option>
            </select>
            {updating && <span className="ml-2 text-gray-400">Đang cập nhật...</span>}
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-white">Sản phẩm của shop bạn</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-md">
          <table className="w-full border-collapse text-gray-100">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="border p-3 text-left">Ảnh</th>
                <th className="border p-3 text-left">Tên</th>
                <th className="border p-3 text-left">Giá</th>
                <th className="border p-3 text-left">Số lượng</th>
                <th className="border p-3 text-left">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700 transition-colors">
                  <td className="border p-2 text-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover mx-auto rounded"
                    />
                  </td>
                  <td className="border p-2">{item.product.name}</td>
                  <td className="border p-2">{item.price.toLocaleString()} ₫</td>
                  <td className="border p-2">{item.quantity}</td>
                  <td className="border p-2">{(item.price * item.quantity).toLocaleString()} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SellerPage>
  );
}
