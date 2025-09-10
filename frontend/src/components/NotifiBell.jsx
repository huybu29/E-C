// src/components/NotificationBell.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import api from "../services/api";
import { Bell } from "lucide-react";

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

      // lọc theo URL hiện tại
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
    // nếu có link thì chuyển trang
    if (n.link) navigate(n.link);

    // đánh dấu đã đọc nếu chưa đọc
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

    setOpen(false); // đóng dropdown khi click
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [location]);

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-500"
        onClick={() => setOpen(!open)}
      >
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white text-black border rounded-lg shadow-lg z-50">
          <div className="p-2 font-bold border-b">Thông báo</div>
          {notifications.length === 0 ? (
            <div className="p-2 text-gray-500">Không có thông báo</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2 border-b cursor-pointer ${
                  n.is_read ? "bg-white" : "bg-gray-100"
                } hover:bg-gray-200`}
                onClick={() => handleClickNotification(n)}
              >
                <p>{n.message}</p>
                <span className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
