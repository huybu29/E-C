import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import SellerPage from "./SellerPage";

export default function SellerProfile() {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    shop_name: "",
    phone: "",
    address: "",
    description: "",
    email_contact: "",
    logo: null,
    banner: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const navigate = useNavigate();

  // Lấy thông tin seller hiện tại
  useEffect(() => {
    API.get("/account/seller/")
      .then((res) => {
        if (res.data.length > 0) {
          const s = res.data[0];
          setSeller(s);
          setFormData({
            shop_name: s.shop_name || "",
            phone: s.phone || "",
            address: s.address || "",
            description: s.description || "",
            email_contact: s.email_contact || "",
            logo: null,
            banner: null,
          });
          setLogoPreview(s.logo || null);
          setBannerPreview(s.banner || null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể tải thông tin người bán");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      // preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "logo") setLogoPreview(reader.result);
        if (name === "banner") setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) data.append(key, formData[key]);
      }

      await API.patch(`/account/seller/${seller.id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Cập nhật thông tin thành công!");
      navigate("/seller/dashboard");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại, vui lòng thử lại.");
    }
  };

  if (loading) return <p>Đang tải thông tin...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!seller) return <p>Bạn chưa đăng ký người bán.</p>;

  return (
    <SellerPage>
      <div className="min-h-screen p-6 bg-gray-900 text-white ">
        <h1 className="text-3xl font-bold mb-6 text-purple-400">
          Hồ sơ Người bán
        </h1>

        {/* Trạng thái phê duyệt */}
        <p className="mb-6">
          Trạng thái:{" "}
          {seller.is_approved ? (
            <span className="text-green-400 font-semibold">Đã phê duyệt ✅</span>
          ) : (
            <span className="text-yellow-400 font-semibold">
              Chờ phê duyệt ⏳
            </span>
          )}
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-2xl bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
        >
          <div>
            <label className="block mb-1 text-sm">Tên cửa hàng</label>
            <input
              type="text"
              name="shop_name"
              value={formData.shop_name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-purple-500 focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-purple-500 focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Email liên hệ</label>
              <input
                type="email"
                name="email_contact"
                value={formData.email_contact}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-purple-500 focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-purple-500 focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Mô tả cửa hàng</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-purple-500 focus:ring-2 focus:ring-purple-400"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Logo</label>
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-24 h-24 object-cover mb-2 rounded border border-gray-600"
              />
            )}
            <input type="file" name="logo" onChange={handleChange} />
          </div>

          <div>
            <label className="block mb-1 text-sm">Banner</label>
            {bannerPreview && (
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-32 object-cover mb-2 rounded border border-gray-600"
              />
            )}
            <input type="file" name="banner" onChange={handleChange} />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition"
          >
            💾 Lưu thay đổi
          </button>
        </form>
      </div>
    </SellerPage>
  );
}
