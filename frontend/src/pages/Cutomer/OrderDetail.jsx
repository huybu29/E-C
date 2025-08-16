import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";

import ReactStars from "react-stars";

import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArchiveBoxIcon,
  StarIcon
} from "@heroicons/react/24/outline";


const statusSteps = [
  { key: "pending", label: "Đang chờ", icon: DocumentTextIcon },
  { key: "processing", label: "Đang xử lý", icon: CurrencyDollarIcon },
  { key: "shipped", label: "Đang giao", icon: TruckIcon },
  { key: "delivered", label: "Đã giao", icon: ArchiveBoxIcon },
  { key: "rated", label: "Đã đánh giá", icon: StarIcon }
];

function OrderTracking({ currentStatus }) {
  const currentIndex = statusSteps.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto mt-4">
      {statusSteps.map((status, index) => {
        const isActive = index <= currentIndex;
        const Icon = status.icon;

        return (
          <div key={status.key} className="flex-1 flex items-center">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-4 transition-colors duration-300
              ${isActive ? "border-green-500 bg-green-100" : "border-gray-300 bg-gray-100"}`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-green-500" : "text-gray-400"}`} />
            </div>
            {index < statusSteps.length - 1 && (
              <div
                className={`flex-1 h-1 ${index < currentIndex ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho đánh giá
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState({}); // { productId: { rating, comment } }

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`order/orders/${id}/`);
      setOrder(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      alert("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChange = (productId, field, value) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const submitReviews = async () => {
  try {
    const reviewEntries = Object.entries(reviews);

    for (let [productId, data] of reviewEntries) {
      if (data.rating > 0) {
        const payload = {
          product: parseInt(productId, 10), // thử ép về số
          rating: data.rating,
          comment: data.comment || ""
        };

        // 👉 Xuất payload ra console để debug
        console.log("Payload gửi:", payload);

        await API.post("product/reviews/", payload);
      }
    }

    alert("Đánh giá thành công!");
    setShowReviewModal(false);
  } catch (err) {
    console.error("Lỗi khi gửi đánh giá:", err.response?.data || err.message);
    alert("Có lỗi xảy ra khi gửi đánh giá!");
  }
};
  if (loading) return <p>Đang tải...</p>;
  if (!order) return <p>Không tìm thấy đơn hàng</p>;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng #{order.id}</h1>

      <div className="mb-4 space-y-1">
        <p><strong>Khách hàng:</strong> {order.user.username}</p>
        <p><strong>Trạng thái:</strong> {order.status}</p>
        <OrderTracking currentStatus={order.status} />
        {order.status === "delivered" && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Đánh giá sản phẩm
          </button>
        )}
        <p><strong>Ngày tạo:</strong> {new Date(order.created_at).toLocaleString()}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Địa chỉ giao hàng</h2>
        <p>{order.address}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Phương thức vận chuyển</h2>
        <p>{order.shipping_method} ({order.shipping_cost} ₫)</p>
      </div>

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
              <td className="border p-2">{item.price.toLocaleString()} ₫</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">
                {(item.price * item.quantity).toLocaleString()} ₫
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Hóa đơn</h2>
        <div className="flex justify-between">
          <span>Tổng phụ:</span>
          <span>{subtotal} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span>{order.shipping_cost} ₫</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Tổng cộng:</span>
          <span>{order.total_price} ₫</span>
        </div>
      </div>

      {/* Modal đánh giá */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>

            {order.items.map((item) => (
  <div key={item.id} className="mb-4 border-b pb-4">
    <div className="flex items-center gap-3">
      <img
        src={item.product.image}
        alt=""
        className="w-16 h-16 object-cover"
      />
      <strong>{item.product.name}</strong>
    </div>

    <ReactStars
      count={5}
      size={30}
      value={reviews[item.product.id]?.rating || 0}   // ⭐ lấy từ state
      color2="#ffd700"
      onChange={(newRating) =>
        handleReviewChange(item.product.id, "rating", newRating)
      }
    />

    <textarea
      className="w-full border p-2 mt-2"
      rows="3"
      placeholder="Nhập nội dung đánh giá..."
      value={reviews[item.product.id]?.comment || ""}
      onChange={(e) =>
        handleReviewChange(item.product.id, "comment", e.target.value)
      }
    ></textarea>
  </div>
))}

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowReviewModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={submitReviews}
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
