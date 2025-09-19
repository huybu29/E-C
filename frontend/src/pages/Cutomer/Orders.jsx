import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Package,
  Loader,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

export default function OrderListPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/order/orders/");
        const sorted = res.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setOrders(sorted);
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn hàng:", err);
        setError(t("errorOrders"));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [t]);

  const statusMap = {
    pending: { label: t("pending"), icon: <Package size={16} /> },
    processing: { label: t("processing"), icon: <Loader size={16} className="animate-spin" /> },
    shipping: { label: t("shipping"), icon: <Truck size={16} /> },
    delivered: { label: t("delivered"), icon: <CheckCircle size={16} /> },
    canceled: { label: t("canceled"), icon: <XCircle size={16} /> },
  };

  const filterOptions = [
    { value: "all", label: t("all") },
    { value: "pending", label: t("pending") },
    { value: "processing", label: t("processing") },
    { value: "shipping", label: t("shipping") },
    { value: "delivered", label: t("delivered") },
    { value: "canceled", label: t("canceled") },
  ];

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-700";
      case "processing": return "bg-yellow-100 text-yellow-700";
      case "shipping": return "bg-blue-100 text-blue-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "canceled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center mt-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Loader size={48} className="text-purple-500" />
        </motion.div>
      </div>
    );

  if (error)
    return <p className="text-center mt-6 text-red-500">{error}</p>;

  if (orders.length === 0)
    return <p className="text-center mt-6">{t("noOrders")}</p>;

  return (
    <motion.div
      className="max-w-6xl mx-auto my-[100px] p-8 bg-white rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Parallax */}
      <motion.h1
        className="text-3xl font-bold mb-8 text-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        🛒 {t("orderListTitle")}
      </motion.h1>
      <motion.div
        className="mt-12 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50"
        style={{ perspective: 1000 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        
      {/* Filter Buttons Staggered */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <AnimatePresence>
          {filterOptions.map((opt, idx) => (
            <motion.button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                filterStatus === opt.value
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-purple-200 to-purple-100 text-gray-900">
            <tr>
              <th className="px-6 py-3 font-semibold">{t("orderId")}</th>
              <th className="px-6 py-3 font-semibold">{t("createdAt")}</th>
              <th className="px-6 py-3 font-semibold text-right">{t("totalPrice")}</th>
              <th className="px-6 py-3 font-semibold">{t("status")}</th>
              <th className="px-6 py-3 font-semibold text-center">{t("action")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: "#f9f5ff" }}
                className="cursor-pointer"
              >
                <td className="px-6 py-3 flex items-center gap-2">
                  {order.id}
                </td>
                <td className="px-6 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-right font-medium text-purple-700">
                  {Number(order.total_price).toLocaleString()} đ
                </td>
                <td className="px-6 py-3 flex items-center gap-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusStyle(order.status)}`}>
                    {statusMap[order.status]?.icon} {statusMap[order.status]?.label || "-"}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow hover:opacity-90 transition flex items-center gap-1 justify-center"
                  >
                    <Eye size={16} /> {t("viewDetail")}
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional: Mini Parallax Section */}
      
      </motion.div>
    </motion.div>
  );
}
