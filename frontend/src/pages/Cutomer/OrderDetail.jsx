import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import ReactStars from "react-stars";
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArchiveBoxIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const statusSteps = [
  { key: "pending", label: "Đang chờ", icon: DocumentTextIcon },
  { key: "processing", label: "Đang xử lý", icon: CurrencyDollarIcon },
  { key: "shipped", label: "Đang giao", icon: TruckIcon },
  { key: "delivered", label: "Đã giao", icon: ArchiveBoxIcon },
  { key: "rated", label: "Đã đánh giá", icon: StarIcon },
];

function OrderTracking({ currentStatus }) {
  const currentIndex = statusSteps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto mt-4">
      {statusSteps.map((status, index) => {
        const isActive = index <= currentIndex;
        const Icon = status.icon;

        return (
          <div key={status.key} className="flex-1 flex items-center">
            <div
              className={`flex items-center justify-center w-20 h-20 rounded-full border-6 transition-colors duration-300
              ${
                isActive
                  ? "border-purple-500 bg-purple-100"
                  : "border-gray-300 bg-gray-100"
              }`}
            >
              <Icon
                className={`w-10 h-10 ${
                  isActive ? "text-purple-600" : "text-gray-400"
                }`}
              />
            </div>
            {index < statusSteps.length - 1 && (
              <div
                className={`flex-1 h-2 ${
                  index < currentIndex ? "bg-purple-500" : "bg-gray-300"
                }`}
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState({});

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

  const handleReviewChange = (productId, field, value) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const submitReviews = async () => {
    try {
      const reviewEntries = Object.entries(reviews);
      for (let [productId, data] of reviewEntries) {
        if (data.rating > 0) {
          const payload = {
            product: parseInt(productId, 10),
            rating: data.rating,
            comment: data.comment || "",
          };
          await API.post("product/reviews/", payload);
        }
      }
      alert("Đánh giá thành công!");
      setShowReviewModal(false);
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err.response?.data || err.message);
      alert("Có lỗi xảy ra khi gửi đánh giá!");
    }
  };

  if (loading) return <p className="text-center text-purple-600">Đang tải...</p>;
  if (!order)
    return <p className="text-center text-red-500">Không tìm thấy đơn hàng</p>;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 my-[80px] max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-purple-100">
      <h1 className="text-3xl font-bold mb-4 text-purple-700">
        Chi tiết đơn hàng #{order.id}
      </h1>

      <div className="mb-4 space-y-2">
        <p>
          <strong>Khách hàng:</strong> {order.user.username}
        </p>
        <p>
          <strong>Trạng thái:</strong> {order.status}
        </p>
        <OrderTracking currentStatus={order.status} />
        {order.status === "delivered" && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded hover:from-purple-600 hover:to-purple-800 transition"
          >
            Đánh giá sản phẩm
          </button>
        )}
        <p>
          <strong>Ngày tạo:</strong>{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-purple-700 mb-1">
          Địa chỉ giao hàng
        </h2>
        <p>{order.address}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-purple-700 mb-1">
          Phương thức vận chuyển
        </h2>
        <p>
          {order.shipping_method} ({order.shipping_cost.toLocaleString()} ₫)
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-4 mb-2 text-purple-700">
        Sản phẩm
      </h2>
      <table className="w-full border rounded">
        <thead className="bg-purple-100">
          <tr>
            <th className="border p-2 text-left text-purple-700">Ảnh</th>
            <th className="border p-2 text-left text-purple-700">Tên</th>
            <th className="border p-2 text-right text-purple-700">Giá</th>
            <th className="border p-2 text-center text-purple-700">Số lượng</th>
            <th className="border p-2 text-right text-purple-700">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="hover:bg-purple-50 transition">
              <td className="border p-2 text-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover mx-auto rounded"
                />
              </td>
              <td className="border p-2 text-gray-800">{item.product.name}</td>
              <td className="border p-2 text-right text-purple-600">
                {item.price.toLocaleString()} ₫
              </td>
              <td className="border p-2 text-center">{item.quantity}</td>
              <td className="border p-2 text-right font-semibold text-purple-700">
                {(item.price * item.quantity).toLocaleString()} ₫
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 p-4 border rounded bg-purple-50">
        <h2 className="text-lg font-semibold mb-2 text-purple-700">Hóa đơn</h2>
        <div className="flex justify-between text-gray-800">
          <span>Tổng phụ:</span>
          <span>{subtotal.toLocaleString()} ₫</span>
        </div>
        <div className="flex justify-between text-gray-800">
          <span>Phí vận chuyển:</span>
          <span>{order.shipping_cost.toLocaleString()} ₫</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-purple-700 mt-2">
          <span>Tổng cộng:</span>
          <span>{order.total_price.toLocaleString()} ₫</span>
        </div>
      </div>

      {/* Modal đánh giá */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-purple-700">
              Đánh giá sản phẩm
            </h2>

            {order.items.map((item) => (
              <div key={item.id} className="mb-4 border-b pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt=""
                    className="w-16 h-16 object-cover rounded"
                  />
                  <strong className="text-gray-800">
                    {item.product.name}
                  </strong>
                </div>

                <ReactStars
                  count={5}
                  size={28}
                  value={reviews[item.product.id]?.rating || 0}
                  color2="#BC6FF1"
                  onChange={(newRating) =>
                    handleReviewChange(item.product.id, "rating", newRating)
                  }
                />

                <textarea
                  className="w-full border p-2 mt-2 rounded"
                  rows="3"
                  placeholder="Nhập nội dung đánh giá..."
                  value={reviews[item.product.id]?.comment || ""}
                  onChange={(e) =>
                    handleReviewChange(
                      item.product.id,
                      "comment",
                      e.target.value
                    )
                  }
                ></textarea>
              </div>
            ))}

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-200 transition"
                onClick={() => setShowReviewModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded hover:from-purple-600 hover:to-purple-800 transition"
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
