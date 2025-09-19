// src/components/NotificationBell.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import api from "../services/api";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("account/notifications/");
      let data = res.data;

      // lọc theo role dựa trên URL
      if (location.pathname.startsWith("/admin/")) {
        data = data.filter((n) => n.target_role === "admin");
      } else if (location.pathname.startsWith("/seller")) {
        data = data.filter((n) => n.target_role === "seller");
      } else {
        data = data.filter((n) => n.target_role === "customer");
      }

      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Lỗi khi tải thông báo", err);
    }
  };

  const handleClickNotification = async (n) => {
    if (n.link) navigate(n.link);

    if (!n.is_read) {
      try {
        await api.patch(`account/notifications/${n.id}/`, { is_read: true });
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, is_read: true } : item
          )
        );
        setUnreadCount((prev) => prev - 1);
      } catch (err) {
        console.error("Không thể đánh dấu thông báo đã đọc", err);
      }
    }

    setOpen(false);
  };


  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [location]);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      case "warning":
        return <AlertCircle className="text-yellow-500 w-5 h-5" />;
      default:
        return <Info className="text-blue-500 w-5 h-5" />;
    }
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-200 transition"
        onClick={() => setOpen(!open)}
      >
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white text-black border rounded-lg shadow-xl z-50"
          >
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-bold">Thông báo</span>
             
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-3 text-gray-500 text-center">
                  Không có thông báo
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-2 p-3 border-b cursor-pointer transition ${
                      n.is_read ? "bg-white" : "bg-blue-50"
                    } hover:bg-gray-100`}
                    onClick={() => handleClickNotification(n)}
                  >
                    {getIcon(n.type)}
                    <div className="flex-1">
                      <p className="text-sm">{n.message}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
