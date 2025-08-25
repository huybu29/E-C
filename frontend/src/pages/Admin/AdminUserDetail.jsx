import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get(`/account/admin/users/${userId}/`)
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error(err);
        navigate("/admin/users"); // nếu lỗi hoặc user không tồn tại, quay về danh sách
      });
  }, [userId, navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/admin/users")}
        className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        ← Quay lại
      </button>

      <h1 className="text-2xl font-bold mb-4">User Detail: {user.username}</h1>
      <div className="bg-white rounded-lg shadow p-6 border border-[#B8CFCE] space-y-2">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Is Staff:</strong> {user.is_staff ? "✅" : "❌"}</p>
        <p><strong>Is Superuser:</strong> {user.is_superuser ? "✅" : "❌"}</p>
        <p><strong>Date Joined:</strong> {new Date(user.date_joined).toLocaleString()}</p>
        <p><strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleString() : "Chưa đăng nhập"}</p>
      </div>
    </div>
  );
}
