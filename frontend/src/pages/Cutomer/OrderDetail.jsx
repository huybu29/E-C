import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import { Navigate } from "react-router-dom";
export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`order/orders/${id}/`);
      setOrder(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      alert("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (!order) return <p>Không tìm thấy đơn hàng</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng #{order.id}</h1>
      <p>
        <strong>Khách hàng:</strong> {order.user.username}
      </p>
      <p>
        <strong>Trạng thái:</strong> {order.status}
      </p>
      <p>
        <strong>Tổng tiền:</strong> {order.total_price} ₫
      </p>
      <p>
        <strong>Ngày tạo:</strong> {new Date(order.created_at).toLocaleString()}
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">Sản phẩm</h2>
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
  );
}
