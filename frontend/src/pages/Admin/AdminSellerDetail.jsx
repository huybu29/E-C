import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminPage from "./AdminPage";

export default function SellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await api.get(`/account/admin/sellers/${id}/`);
        setSeller(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu seller");
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeller((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch(`/account/admin/sellers/${id}/`, seller);
      alert("Cập nhật thành công!");
      setSaving(false);
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải seller...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <AdminPage>
      <div className="min-h-screen bg-[#1C0126] p-6 text-white">
        <h1 className="text-2xl font-bold mb-6 text-[#FF7ED4]">
          Chi tiết Seller: {seller.shop_name}
        </h1>

        <div className="bg-[#2A083B] p-6 rounded-lg shadow-xl max-w-lg">
          <label className="block mb-3">
            <span className="text-gray-300">Shop Name</span>
            <input
              type="text"
              name="shop_name"
              value={seller.shop_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg p-2 bg-[#1C0126] border border-[#4E1883] text-white focus:outline-none focus:ring-2 focus:ring-[#FF7ED4]"
            />
          </label>

          <label className="block mb-3">
            <span className="text-gray-300">Phone</span>
            <input
              type="text"
              name="phone"
              value={seller.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg p-2 bg-[#1C0126] border border-[#4E1883] text-white focus:outline-none focus:ring-2 focus:ring-[#FF7ED4]"
            />
          </label>

          <label className="block mb-3">
            <span className="text-gray-300">Address</span>
            <input
              type="text"
              name="address"
              value={seller.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg p-2 bg-[#1C0126] border border-[#4E1883] text-white focus:outline-none focus:ring-2 focus:ring-[#FF7ED4]"
            />
          </label>

          <label className="flex items-center mb-4 gap-2">
            <input
              type="checkbox"
              name="is_approved"
              checked={seller.is_approved}
              onChange={handleChange}
            />
            <span className="text-gray-300">Approved</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#FF7ED4] text-[#1C0126] font-bold rounded hover:bg-[#FF3EA5] transition"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              onClick={() => navigate("/admin/sellers")}
              className="px-4 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
