// src/pages/admin/OrderDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminPage from "./AdminPage";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [modal, setModal] = useState({ show: false, message: "" });

  const fetchOrder = () => {
    api
      .get(`/account/admin/orders/${id}/`)
      .then((res) => {
        setOrder(res.data);
        setStatus(res.data.status);
        setTotalPrice(res.data.total_price);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (!order) {
    return (
      <AdminPage>
        <p className="text-white">Loading...</p>
      </AdminPage>
    );
  }

  // Cập nhật trạng thái
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    api
      .patch(`/account/admin/orders/${id}/`, { status: newStatus })
      .then(() => {
        setStatus(newStatus);
        fetchOrder();
        setModal({ show: true, message: "✅ Cập nhật trạng thái thành công!" });
      })
      .catch((err) => console.error(err));
  };

  // Cập nhật tổng tiền
  const handleTotalPriceChange = (e) => {
    const newTotal = parseFloat(e.target.value);
    setTotalPrice(newTotal);
  };

  const saveOrder = () => {
    api
      .patch(`/account/admin/orders/${id}/`, { status, total_price: totalPrice })
      .then(() => {
        fetchOrder();
        setModal({ show: true, message: "✅ Lưu đơn hàng thành công!" });
      })
      .catch((err) => console.error(err));
  };

  // Xóa sản phẩm
  const handleDeleteItem = (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?")) return;
    api
      .delete(`/account/admin/orders/${id}/items/${itemId}/`)
      .then(() => {
        fetchOrder();
        setModal({ show: true, message: "❌ Sản phẩm đã được xóa khỏi đơn hàng!" });
      })
      .catch((err) => console.error(err));
  };

  // Cập nhật sản phẩm (quantity, price)
  const handleItemChange = (itemId, field, value) => {
    const updatedItems = order.items.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setOrder({ ...order, items: updatedItems });
  };

  const saveItem = (item) => {
    api
      .patch(`/account/admin/orders/${id}/items/${item.id}/`, { quantity: item.quantity, price: item.price })
      .then(() => {
        fetchOrder();
        setModal({ show: true, message: "✅ Cập nhật sản phẩm thành công!" });
      })
      .catch((err) => console.error(err));
  };

  return (
    <AdminPage>
      <div className="relative p-6">
        {/* Modal */}
        {modal.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-[#2A083B] p-6 rounded-lg border border-[#4E1883] shadow-lg text-white">
              <p>{modal.message}</p>
              <button
                onClick={() => setModal({ show: false, message: "" })}
                className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 rounded bg-[#3B0A4F] text-white"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-6 text-[#FF7ED4]">
          Order #{order.id} Detail
        </h1>

        {/* Order Info */}
        <div className="bg-[#2A083B] rounded-lg shadow-xl p-6 border border-[#4E1883] text-white space-y-3">
          <p><strong>Customer:</strong> {order.user.username}</p>
          <p><strong>Email:</strong> {order.user.email}</p>
          <p>
            <strong>Status:</strong>{" "}
            <select
            value={status}
            onChange={handleStatusChange}
            className="bg-[#3B0A4F] text-white p-1 rounded border border-[#4E1883]"
          >
            <option value="pending">Đang chờ</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="canceled">Hủy</option>
          </select>
          </p>
          <p>
            <strong>Total:</strong>{" "}
            <input
              type="number"
              value={totalPrice}
              onChange={handleTotalPriceChange}
              className="bg-[#3B0A4F] text-white p-1 rounded border border-[#4E1883] w-32"
            />
          </p>
          <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
          <button
            onClick={saveOrder}
            className="mt-2 px-4 py-2 bg-green-500 rounded hover:bg-green-600"
          >
            💾 Lưu Order
          </button>
        </div>

        {/* Items */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Items</h2>
          <div className="bg-[#2A083B] rounded-lg p-4 border border-[#4E1883] overflow-x-auto">
            <table className="w-full text-left text-white border-collapse">
              <thead>
                <tr className="bg-[#3B0A4F]">
                  <th className="p-3 border border-[#4E1883]">Product</th>
                  <th className="p-3 border border-[#4E1883]">Quantity</th>
                  <th className="p-3 border border-[#4E1883]">Price</th>
                  <th className="p-3 border border-[#4E1883] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 border border-[#4E1883]">{item.product.name}</td>
                    <td className="p-3 border border-[#4E1883]">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value))}
                        className="bg-[#3B0A4F] text-white p-1 rounded border border-[#4E1883] w-20"
                      />
                    </td>
                    <td className="p-3 border border-[#4E1883]">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, "price", parseFloat(e.target.value))}
                        className="bg-[#3B0A4F] text-white p-1 rounded border border-[#4E1883] w-24"
                      />
                    </td>
                    <td className="p-3 border border-[#4E1883] text-center space-x-2">
                      <button
                        onClick={() => saveItem(item)}
                        className="px-3 py-1 bg-green-500 rounded hover:bg-green-600 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
