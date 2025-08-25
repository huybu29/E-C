import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    api.get("/account/admin/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);
  const handleRowClick = (userId) => {
    navigate(`/admin/users/${userId}`);
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#333446]">User Management</h1>
      <div className="bg-white rounded-lg shadow p-4 border border-[#B8CFCE]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#7F8CAA] text-white">
              <th className="p-3 border border-[#B8CFCE]">ID</th>
              <th className="p-3 border border-[#B8CFCE]">Username</th>
              <th className="p-3 border border-[#B8CFCE]">Email</th>
              <th className="p-3 border border-[#B8CFCE]">Is Staff</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#EAEFEF]" onClick={() => handleRowClick(u.id)}>
                <td className="p-3 border border-[#B8CFCE]">{u.id}</td>
                <td className="p-3 border border-[#B8CFCE]">{u.username}</td>
                <td className="p-3 border border-[#B8CFCE]">{u.email}</td>
                <td className="p-3 border border-[#B8CFCE]">
                  {u.is_staff ? "✅" : "❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
