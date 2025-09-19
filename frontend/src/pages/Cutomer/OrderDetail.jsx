import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import ReactStars from "react-stars";
import { motion, AnimatePresence, useViewportScroll, useTransform } from "framer-motion";
import { User, FileText, DollarSign, Truck, Archive, Home, CreditCard, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

// ------------------- Order Tracking -------------------
const statusSteps = [
  { key: "pending", labelKey: "pending", icon: FileText },
  { key: "canceled", labelKey: "canceled", icon: XCircle },
  { key: "processing", labelKey: "processing", icon: DollarSign },
  { key: "shipped", labelKey: "shipped", icon: Truck },
  { key: "delivered", labelKey: "delivered", icon: Archive },
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
              animate={{ scale: isActive ? 1.2 : 1, backgroundColor: isActive ? "#ede9fe" : "#f9fafb" }}
              whileHover={{ scale: 1.25 }}
              className={`flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-md ${
                isActive ? "border-purple-500" : "border-gray-300"
              }`}
            >
              <Icon size={28} strokeWidth={2.5} color={isActive ? "#7C3AED" : "#9CA3AF"} />
            </motion.div>
            {index < statusSteps.length - 1 && (
              <div className={`flex-1 h-1 ${index < currentIndex ? "bg-purple-500" : "bg-gray-200"}`}></div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ------------------- Customer Order Detail Page -------------------
export default function CustomerOrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState({});
  const [canceling, setCanceling] = useState(false);

  const { scrollY } = useViewportScroll();
  const parallax = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`order/orders/${id}/`);
      setOrder(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      alert(t("orderNotFound"));
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
      for (let [productId, data] of Object.entries(reviews)) {
        if (data.rating > 0 || data.comment || data.image) {
          const formData = new FormData();
          formData.append("product", productId);
          formData.append("rating", data.rating || 0);
          formData.append("comment", data.comment || "");
          if (data.image) formData.append("image", data.image);
          await API.post("product/reviews/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }
      setShowReviewModal(false);
      alert(t("submitReview"));
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err.response?.data || err.message);
      alert(t("submitReview"));
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm(t("confirmCancel"))) return;
    try {
      setCanceling(true);
      const res = await API.patch(`order/orders/${id}/`, { status: "canceled" });
      setOrder(res.data);
      alert(t("cancelOrder"));
    } catch (err) {
      console.error("Lỗi hủy đơn hàng:", err.response?.data || err.message);
      alert(t("cancelOrder"));
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <p className="text-center text-purple-600 animate-pulse">{t("loading")}</p>;
  if (!order) return <p className="text-center text-red-500">{t("orderNotFound")}</p>;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 my-[80px] max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-purple-100 relative overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div style={{ y: parallax }} className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 -z-10" />

      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        {t("invoice")} #{order.id}
      </h1>

      {/* Info Boxes */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          { icon: User, label: t("customer"), value: order.user.username },
          { icon: FileText, label: t("status"), value: order.status },
          { icon: Home, label: t("address"), value: order.address },
          { icon: Truck, label: t("shipping"), value: `${order.shipping_method} (${order.shipping_cost.toLocaleString()} ₫)` },
        ].map((info, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <InfoBox icon={info.icon} label={info.label} value={info.value} />
          </motion.div>
        ))}
      </div>

      {/* Order Tracking */}
      <OrderTracking currentStatus={order.status} />

      {/* Items List */}
      <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-700">{t("rateProducts")}</h2>
      <div className="grid gap-4">
        {order.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: "0px 20px 25px rgba(0,0,0,0.1)" }}
            className="flex items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
              <p className="text-purple-600">{item.price.toLocaleString()} ₫ x {item.quantity}</p>
            </div>
            <span className="font-bold text-purple-700 text-lg">{(item.price * item.quantity).toLocaleString()} ₫</span>
          </motion.div>
        ))}
      </div>

      {/* Bill */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
        className="mt-6 p-6 rounded-xl shadow-inner bg-gradient-to-r from-purple-50 to-indigo-50"
      >
        <h2 className="text-lg font-bold mb-3 text-purple-700 flex items-center gap-2"><CreditCard size={20} strokeWidth={2.5} color="#7C3AED" /> {t("invoice")}</h2>
        {[{label:t("subtotal"), value:subtotal}, {label:t("shippingFee"), value:order.shipping_cost}].map((row, idx) => (
          <motion.div key={idx} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx*0.1 }}>
            <BillRow label={row.label} value={row.value} />
          </motion.div>
        ))}
        <div className="flex justify-between font-bold text-xl text-purple-700 mt-2">
          <span>{t("total")}:</span>
          <span>{order.total_price.toLocaleString()} ₫</span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        {order.status === "delivered" && <ActionButton label={t("rateProducts")} onClick={() => setShowReviewModal(true)} />}
        {(order.status === "pending" || order.status === "processing") &&
          <CancelButton canceling={canceling} handleCancelOrder={handleCancelOrder} t={t} />}
      </div>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        reviews={reviews}
        order={order}
        handleReviewChange={handleReviewChange}
        submitReviews={submitReviews}
        t={t}
      />
    </motion.div>
  );
}

// ------------------- Reusable Components -------------------
const InfoBox = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-purple-50 rounded-xl shadow-sm flex items-center gap-3 hover:scale-105 transition">
    <Icon size={24} strokeWidth={2.5} color="#7C3AED" />
    <span><strong>{label}:</strong> {value}</span>
  </div>
);

const BillRow = ({ label, value }) => (
  <div className="flex justify-between text-gray-700">
    <span>{label}:</span>
    <span>{value.toLocaleString()} ₫</span>
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick}
    className="px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow hover:from-purple-600 hover:to-purple-800 transition">{label}</motion.button>
);

const CancelButton = ({ canceling, handleCancelOrder, t }) => (
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={canceling} onClick={handleCancelOrder}
    className={`px-5 py-3 flex items-center gap-2 rounded-lg shadow transition ${canceling ? "bg-gray-400 text-white cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}>
    <XCircle size={20} strokeWidth={2.5} color="white" />
    {canceling ? t("canceling") : t("cancelOrder")}
  </motion.button>
);

// ------------------- Review Modal with Image Upload -------------------
const ReviewModal = ({ visible, onClose, reviews, order, handleReviewChange, submitReviews, t }) => {
  const [previews, setPreviews] = useState({});

  const handleImageChange = (productId, file) => {
    handleReviewChange(productId, "image", file);
    setPreviews((prev) => ({ ...prev, [productId]: URL.createObjectURL(file) }));
  };

  return (
    <AnimatePresence>
      {visible && (
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
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-xl font-bold mb-4 text-purple-700">{t("rateProducts")}</h2>

            {order.items.map((item) => (
              <div key={item.id} className="mb-4 p-3 border rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded" />
                  <strong className="text-gray-800">{item.product.name}</strong>
                </div>

                <ReactStars
                  count={5}
                  size={28}
                  value={reviews[item.product.id]?.rating || 0}
                  color2="#BC6FF1"
                  onChange={(newRating) => handleReviewChange(item.product.id, "rating", newRating)}
                />

                <textarea
                  className="w-full border p-2 mt-2 rounded"
                  rows="3"
                  placeholder={t("reviewPlaceholder")}
                  value={reviews[item.product.id]?.comment || ""}
                  onChange={(e) => handleReviewChange(item.product.id, "comment", e.target.value)}
                />

                {/* Image Upload */}
                <div className="mt-2">
                  {previews[item.product.id] && (
                    <img src={previews[item.product.id]} alt="preview" className="w-28 h-28 object-cover rounded mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImageChange(item.product.id, e.target.files[0])}
                  />
                </div>
              </div>
            ))}

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-200 transition" onClick={onClose}>
                {t("cancel")}
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded hover:from-purple-600 hover:to-purple-800 transition"
                onClick={submitReviews}
              >
                {t("submitReview")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
