import { useState, useEffect } from "react";
import API from "../../services/api"; 
import SellerPage from "./SellerPage";
import { useNavigate } from "react-router-dom";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState("recent"); 
  const [status, setStatus] = useState("all");

  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { applyFilter(); }, [orders, sort, status]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/order/seller-orders/");
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally { setLoading(false); }
  };

  const applyFilter = () => {
    let result = [...orders];
    if (status !== "all") result = result.filter(o => o.status === status);

    if (sort === "recent") result.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
    else if (sort === "oldest") result.sort((a,b)=> new Date(a.created_at)-new Date(b.created_at));
    else if (sort === "price_high") result.sort((a,b)=> 
      b.items.reduce((s,i)=>s+i.price*i.quantity,0) - a.items.reduce((s,i)=>s+i.price*i.quantity,0));
    else if (sort === "price_low") result.sort((a,b)=> 
      a.items.reduce((s,i)=>s+i.price*i.quantity,0) - b.items.reduce((s,i)=>s+i.price*i.quantity,0));

    setFilteredOrders(result);
  };

  return (
    <SellerPage>
      <div className="p-6 bg-gray-900 rounded-2xl shadow-lg flex-1">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">Quản lý đơn hàng</h1>
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price_high">Giá cao → thấp</option>
              <option value="price_low">Giá thấp → cao</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang chờ</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-300 font-semibold">Đang tải đơn hàng...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-sm">
            <table className="w-full text-center border-collapse text-gray-100">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-3 border-b border-gray-700">Mã đơn</th>
                  <th className="p-3 border-b border-gray-700">Khách hàng</th>
                  <th className="p-3 border-b border-gray-700">Ngày đặt</th>
                  <th className="p-3 border-b border-gray-700">Tổng tiền</th>
                  <th className="p-3 border-b border-gray-700">Trạng thái</th>
                  <th className="p-3 border-b border-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700 transition">
                    <td className="p-3 border-b border-gray-700">{order.id}</td>
                    <td className="p-3 border-b border-gray-700">{order.user.username}</td>
                    <td className="p-3 border-b border-gray-700">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="p-3 border-b border-gray-700 font-semibold">
                      {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} ₫
                    </td>
                    <td className="p-3 border-b border-gray-700">
                      {order.status === "pending" && <span className="px-2 py-1 rounded-full bg-yellow-500 text-gray-900 font-semibold">Đang chờ</span>}
                      {order.status === "processing" && <span className="px-2 py-1 rounded-full bg-blue-600 text-white font-semibold">Đang xử lý</span>}
                      {order.status === "shipped" && <span className="px-2 py-1 rounded-full bg-purple-600 text-white font-semibold">Đang giao</span>}
                      {order.status === "delivered" && <span className="px-2 py-1 rounded-full bg-green-600 text-white font-semibold">Đã giao</span>}
                    </td>
                    <td className="p-3 border-b border-gray-700">
                      <button
                        onClick={() => navigate(`${order.id}`)}
                        className="px-4 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold transition"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-300">
                      Không có đơn hàng phù hợp
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
