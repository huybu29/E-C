import { useState, useEffect } from "react";
import API from "../../services/api"; // axios instance đã config
import SellerPage from "./SellerPage";
import { useNavigate } from "react-router-dom";
export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/order/seller-orders/"); // endpoint lấy đơn hàng theo seller
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerPage>
      <div className="p-6 bg-white rounded-lg shadow flex-1">
        <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Mã đơn</th>
                <th className="border p-2">Khách hàng</th>
                <th className="border p-2">Ngày đặt</th>
                <th className="border p-2">Tổng tiền</th>
                <th className="border p-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="border p-2">{order.id}</td>
                  <td className="border p-2">{order.user}</td>
                  <td className="border p-2">{order.created_at}</td>
                  <td className="border p-2">{order.total_price} ₫</td>
                  <td className="border p-2">{order.status}</td>
                  <td className="border p-2" onClick={() => navigate(`${order.id}`)}>Chi tiết</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SellerPage>
  );
}
