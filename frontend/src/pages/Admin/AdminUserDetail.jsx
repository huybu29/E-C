// src/pages/admin/UserDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminPage from "./AdminPage";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    is_staff: false,
    is_superuser: false,
    is_active: true,
  });

  // Modal state
  const [modal, setModal] = useState({ show: false, message: "" });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = () => {
    setLoading(true);
    api
      .get(`/account/admin/users/${userId}/`)
      .then((res) => {
        setUser(res.data);
        setFormData({
          username: res.data.username,
          email: res.data.email,
          is_staff: res.data.is_staff,
          is_superuser: res.data.is_superuser,
          is_active: res.data.is_active,
        });
      })
      .catch((err) => {
        console.error(err);
        navigate("/admin/users");
      })
      .finally(() => setLoading(false));
  };

  const handleUpdate = () => {
    api
      .patch(`/account/admin/users/${userId}/`, formData)
      .then((res) => {
        setUser(res.data);
        setModal({ show: true, message: "✅ Lưu thay đổi thành công!" });
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = () => {
    
      api
        .delete(`/account/admin/users/${userId}/`)
        .then(() => {
          setModal({ show: true, message: "❌ User đã được xóa!" });
          setTimeout(() => navigate("/admin/users"), 1500); // Tự động quay lại sau 1.5s
        })
        .catch((err) => console.error(err));
    
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (!user) return <p className="text-red-400">User not found!</p>;

  return (
    <AdminPage>
      <div className="p-6 relative">
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
          onClick={() => navigate("/admin/users")}
          className="mb-4 px-4 py-2 bg-[#4E1883] text-white rounded-lg hover:bg-[#6B21A8] transition"
        >
          ← Quay lại
        </button>

        <h1 className="text-2xl font-bold mb-4 text-[#FF7ED4]">
          Chi tiết User: {user.username}
        </h1>

        <div className="bg-[#2A083B] rounded-lg shadow-xl p-6 border border-[#4E1883] space-y-4 text-white">
          <p><strong>ID:</strong> {user.id}</p>

          <div>
            <label className="block mb-1">Username:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-2 rounded bg-[#3B0A4F] border border-[#4E1883] text-white"
            />
          </div>

          <div>
            <label className="block mb-1">Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 rounded bg-[#3B0A4F] border border-[#4E1883] text-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <label>
              <input
                type="checkbox"
                checked={formData.is_staff}
                onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
              />{" "}
              Is Staff
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.is_superuser}
                onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
              />{" "}
              Is Superuser
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />{" "}
              Is Active
            </label>
          </div>

          <p><strong>Date Joined:</strong> {new Date(user.date_joined).toLocaleString()}</p>
          <p><strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleString() : "Chưa đăng nhập"}</p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              💾 Lưu thay đổi
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              ❌ Xóa User
            </button>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
