import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import SellerPage from "./SellerPage";

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/order/seller-order-detail/${id}/`);
      setOrder(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      alert("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await API.patch(`/order/seller-order-detail/${id}/`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      alert("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 font-semibold";
      case "processing":
        return "text-blue-600 font-semibold";
      case "shipped":
        return "text-purple-600 font-semibold";
      case "delivered":
        return "text-green-600 font-semibold";
      case "canceled":
        return "text-red-600 font-semibold";
      default:
        return "";
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (!order) return <p>Không tìm thấy đơn hàng</p>;

  return (
    <SellerPage>
      <div className="p-6 bg-white rounded shadow flex-1">
        <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng #{order.id}</h1>

        <div className="mb-4">
          <p>
            <strong>Khách hàng:</strong> {order.user.username}
          </p>
          <p>
            <strong>Tổng tiền:</strong> {order.total_price} ₫
          </p>
          <p>
            <strong>Ngày tạo:</strong> {new Date(order.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span className={getStatusColor(order.status)}>{order.status}</span>
          </p>

          {/* Dropdown cập nhật trạng thái */}
          <div className="mt-2 flex items-center gap-2">
            <label className="font-semibold">Cập nhật trạng thái:</label>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="border p-1 rounded"
            >
              <option value="pending">Đang chờ</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="canceled">Hủy</option>
            </select>
            {updating && <span className="ml-2 text-gray-500">Đang cập nhật...</span>}
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-4 mb-2">Sản phẩm của shop bạn</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Ảnh</th>
              <th className="border p-2">Tên</th>
              <th className="border p-2">Giá</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="border p-2 text-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover mx-auto"
                  />
                </td>
                <td className="border p-2">{item.product.name}</td>
                <td className="border p-2">{item.price} ₫</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">{item.price * item.quantity} ₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SellerPage>
  );
}
