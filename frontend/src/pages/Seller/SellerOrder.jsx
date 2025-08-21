import { useState, useEffect } from "react";
import API from "../../services/api"; 
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
      const res = await API.get("/order/seller-orders/");
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerPage>
      <div className="p-6 bg-white rounded-2xl shadow flex-1">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Quản lý đơn hàng</h1>

        {loading ? (
          <p className="text-center text-blue-600">Đang tải đơn hàng...</p>
        ) : (
          <div className="overflow-x-auto  border-blue-900 border-2 rounded-lg">
            <table className="w-full border-collapse  rounded-lg overflow-hidden">
              <thead className="bg-blue-100 text-blue-700">
                <tr>
                  <th className=" p-2">Mã đơn</th>
                  <th className=" p-2">Khách hàng</th>
                  <th className=" p-2">Ngày đặt</th>
                  <th className=" p-2">Tổng tiền</th>
                  <th className=" p-2">Trạng thái</th>
                  <th className=" p-2">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-blue-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition text-center">
                    <td className=" p-2">{order.id}</td>
                    <td className=" p-2">{order.user.username}</td>
                    <td className=" p-2">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className=" p-2">{order.total_price.toLocaleString()} ₫</td>
                    <td className=" p-2 font-semibold">
                      {order.status === "pending" && <span className="text-yellow-600">Đang chờ</span>}
                      {order.status === "processing" && <span className="text-blue-600">Đang xử lý</span>}
                      {order.status === "shipped" && <span className="text-purple-600">Đang giao</span>}
                      {order.status === "delivered" && <span className="text-green-600">Đã giao</span>}
                    </td>
                    <td className=" p-2 text-center">
                      <button
                        onClick={() => navigate(`${order.id}`)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-blue-500">
                      Chưa có đơn hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SellerPage>
  );
}
