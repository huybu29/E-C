import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import ReactStars from "react-stars";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArchiveBoxIcon,
  StarIcon,
  HomeIcon,
  CreditCardIcon,
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
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto mt-6">
      {statusSteps.map((status, index) => {
        const isActive = index <= currentIndex;
        const Icon = status.icon;

        return (
          <motion.div
            key={status.key}
            className="flex-1 flex items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <motion.div
              animate={{
                scale: isActive ? 1.15 : 1,
                backgroundColor: isActive ? "#ede9fe" : "#f9fafb",
              }}
              className={`flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-md ${
                isActive ? "border-purple-500" : "border-gray-300"
              }`}
            >
              <Icon
                className={`w-8 h-8 ${
                  isActive ? "text-purple-600" : "text-gray-400"
                }`}
              />
            </motion.div>
            {index < statusSteps.length - 1 && (
              <div
                className={`flex-1 h-1 ${
                  index < currentIndex ? "bg-purple-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </motion.div>
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
     
      setShowReviewModal(false);
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err.response?.data || err.message);
      alert("Có lỗi xảy ra khi gửi đánh giá!");
    }
  };

  if (loading)
    return <p className="text-center text-purple-600 animate-pulse">Đang tải...</p>;
  if (!order)
    return <p className="text-center text-red-500">Không tìm thấy đơn hàng</p>;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 my-[80px] max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-purple-100"
    >
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        Chi tiết đơn hàng #{order.id}
      </h1>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-purple-50 rounded-xl shadow-sm flex items-center gap-3">
          <UserIcon className="w-6 h-6 text-purple-600" />
          <span><strong>Khách hàng:</strong> {order.user.username}</span>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl shadow-sm flex items-center gap-3">
          <DocumentTextIcon className="w-6 h-6 text-purple-600" />
          <span><strong>Trạng thái:</strong> {order.status}</span>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl shadow-sm flex items-center gap-3">
          <HomeIcon className="w-6 h-6 text-purple-600" />
          <span><strong>Địa chỉ:</strong> {order.address}</span>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl shadow-sm flex items-center gap-3">
          <TruckIcon className="w-6 h-6 text-purple-600" />
          <span>
            <strong>Vận chuyển:</strong> {order.shipping_method} (
            {order.shipping_cost.toLocaleString()} ₫)
          </span>
        </div>
      </div>

      {/* Tracking */}
      <OrderTracking currentStatus={order.status} />

      {/* Sản phẩm */}
      <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-700">Sản phẩm</h2>
      <div className="grid gap-4">
        {order.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
              <p className="text-purple-600">
                {item.price.toLocaleString()} ₫ x {item.quantity}
              </p>
            </div>
            <span className="font-bold text-purple-700 text-lg">
              {(item.price * item.quantity).toLocaleString()} ₫
            </span>
          </motion.div>
        ))}
      </div>

      {/* Invoice */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-6 rounded-xl shadow-inner bg-gradient-to-r from-purple-50 to-indigo-50"
      >
        <h2 className="text-lg font-bold mb-3 text-purple-700 flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5" /> Hóa đơn
        </h2>
        <div className="flex justify-between text-gray-700">
          <span>Tổng phụ:</span>
          <span>{subtotal.toLocaleString()} ₫</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Phí vận chuyển:</span>
          <span>{order.shipping_cost.toLocaleString()} ₫</span>
        </div>
        <div className="flex justify-between font-bold text-xl text-purple-700 mt-2">
          <span>Tổng cộng:</span>
          <span>{order.total_price.toLocaleString()} ₫</span>
        </div>
      </motion.div>

      {/* Nút đánh giá */}
      {order.status === "delivered" && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReviewModal(true)}
          className="mt-6 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow hover:from-purple-600 hover:to-purple-800 transition"
        >
          Đánh giá sản phẩm
        </motion.button>
      )}

      {/* Modal đánh giá */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl"
            >
              <h2 className="text-xl font-bold mb-4 text-purple-700">
                Đánh giá sản phẩm
              </h2>

              {order.items.map((item) => (
                <div key={item.id} className="mb-4 p-3 border rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={item.product.image}
                      alt=""
                      className="w-14 h-14 object-cover rounded"
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded hover:from-purple-600 hover:to-purple-800 transition"
                  onClick={submitReviews}
                >
                  Gửi đánh giá
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
