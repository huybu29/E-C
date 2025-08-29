// src/pages/profileProfilePage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../../services/api";
import axios from "axios";

export default function ProfileProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
  });

  // ===== Address =====
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailAddress, setDetailAddress] = useState("");
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // ===== Password =====
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [successPassword, setSuccessPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchProvinces();
  }, []);

  // ===== Profile =====
  const fetchProfile = async () => {
    try {
      const res = await API.get("/account/profiles/");
      const profileData = res.data[0];
      setProfile(profileData);
      setFormData({
        fullname: profileData.fullname || "",
        email: profileData.email || "",
        phone_number: profileData.phone_number || "",
      });
    } catch (err) {
      console.error("Lỗi tải thông tin người dùng:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const res = await API.patch(`/account/profiles/${profile.id}/`, formData);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", err);
    }
  };

  // ===== Address =====
  const fetchAddresses = async () => {
    try {
      const res = await API.get("/order/address/");
      setAddresses(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách địa chỉ:", err);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await axios.get("https://provinces.open-api.vn/api/v2/p");
      setProvinces(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProvinceChange = async (code) => {
    setSelectedProvince(code);
    setSelectedWard("");
    setWards([]);
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/v2/p/${code}?depth=2`);
      setWards(res.data.wards);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAddress = async () => {
    const provinceName = provinces.find((p) => p.code === selectedProvince)?.name || "";
    const wardName = wards.find((w) => w.code === selectedWard)?.name || "";
    const payload = {
      province: provinceName,
      ward: wardName,
      detail_address: detailAddress,
    };

    try {
      if (editingAddressId) {
        await API.patch(`/order/address/${editingAddressId}/`, payload);
      } else {
        await API.post("/order/address/", payload);
      }
      fetchAddresses();
      setIsModalOpen(false);
      setDetailAddress("");
      setSelectedProvince("");
      setSelectedWard("");
      setEditingAddressId(null);
    } catch (err) {
      console.error("Lỗi lưu địa chỉ:", err);
    }
  };

  // ===== Password =====
  const handleChangePassword = async () => {
    setErrorPassword("");
    setSuccessPassword("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorPassword("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorPassword("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    try {
      await API.post("/account/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccessPassword("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorPassword(err.response?.data?.detail || "Đổi mật khẩu thất bại");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Đang tải thông tin cá nhân...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Không thể tải thông tin người dùng</p>
      </div>
    );

  const avatarUrl =
    profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullname)}&background=52057B&color=fff&size=128&rounded=true`;

  return (
    <div className="max-w-6xl mx-auto my-30 px-4 sm:px-6 lg:px-8 flex gap-8">
      {/* Sidebar */}
      <motion.div
        className="w-64 bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex flex-col items-center mb-6">
          <img src={avatarUrl} alt="Avatar" className="w-24 h-24 object-cover rounded-full border-4 border-purple-600" />
          <h2 className="text-xl font-bold mt-2">{profile.fullname}</h2>
          <p className="text-gray-500">{profile.email}</p>
        </div>

        <button onClick={() => setActiveTab("profile")} className={`text-left px-4 py-2 rounded-lg ${activeTab === "profile" ? "bg-purple-600 text-white" : "hover:bg-purple-100"}`}>Hồ sơ</button>
        <button onClick={() => setActiveTab("address")} className={`text-left px-4 py-2 rounded-lg ${activeTab === "address" ? "bg-purple-600 text-white" : "hover:bg-purple-100"}`}>Địa chỉ</button>
        <button onClick={() => setActiveTab("password")} className={`text-left px-4 py-2 rounded-lg ${activeTab === "password" ? "bg-purple-600 text-white" : "hover:bg-purple-100"}`}>Đổi mật khẩu</button>
      </motion.div>

      {/* Content */}
      <motion.div className="flex-1 bg-white rounded-2xl shadow-lg p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Hồ sơ của bạn</h1>
            {editing ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold">Họ và tên:</label>
                  <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block font-semibold">Email:</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block font-semibold">Số điện thoại:</label>
                  <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="flex gap-4 mt-4">
                  <button onClick={handleSaveProfile} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Lưu</button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">Hủy</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p><span className="font-semibold">Họ và tên:</span> {profile.fullname}</p>
                <p><span className="font-semibold">Email:</span> {profile.email}</p>
                <p><span className="font-semibold">Số điện thoại:</span> {profile.phone_number || "Chưa cập nhật"}</p>
                <button onClick={() => setEditing(true)} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Chỉnh sửa</button>
              </div>
            )}
          </div>
        )}

        {/* Address Tab */}
        {activeTab === "address" && (
          <div>
            <h1 className="text-2xl font-bold mb-4 flex justify-between">
              <span>Địa chỉ của bạn</span>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setDetailAddress("");
                  setSelectedProvince("");
                  setSelectedWard("");
                  setEditingAddressId(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Thêm địa chỉ
              </button>
            </h1>

            <ul className="flex flex-col gap-2">
              {addresses.length ? addresses.map((addr) => (
                <li key={addr.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <span>{addr.detail_address}, {addr.ward}, {addr.province}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                        setEditingAddressId(addr.id);
                        setDetailAddress(addr.detail_address);
                        const provinceObj = provinces.find((p) => p.name === addr.province);
                        setSelectedProvince(provinceObj?.code || "");
                        if (provinceObj) {
                          axios.get(`https://provinces.open-api.vn/api/v2/p/${provinceObj.code}?depth=2`)
                            .then(res => {
                              setWards(res.data.wards || []);
                              const wardObj = res.data.wards.find((w) => w.name === addr.ward);
                              setSelectedWard(wardObj?.code || "");
                            }).catch(err => console.error(err));
                        }
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
                        try {
                          await API.delete(`/order/address/${addr.id}/`);
                          fetchAddresses();
                        } catch (err) {
                          console.error("Lỗi xóa địa chỉ:", err);
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              )) : <p>Chưa có địa chỉ nào</p>}
            </ul>

            {/* Modal Thêm / Chỉnh sửa */}
            {isModalOpen && (
              <div className="fixed inset-0 flex justify-center items-center z-40">
                <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>
                <div className="bg-white p-6 rounded-xl w-full max-w-md flex flex-col gap-4 z-50 relative">
                  <h2 className="text-xl font-bold">{editingAddressId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</h2>
                  <input
                    type="text"
                    placeholder="Địa chỉ chi tiết"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    className="border px-3 py-2 rounded-lg w-full"
                  />
                  <select
                    value={selectedProvince}
                    onChange={(e) => handleProvinceChange(Number(e.target.value))}
                    className="border px-3 py-2 rounded-lg w-full"
                  >
                    <option value="">Chọn tỉnh</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(Number(e.target.value))}
                    className="border px-3 py-2 rounded-lg w-full"
                    disabled={!wards.length}
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={handleSaveAddress}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Đổi mật khẩu</h1>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2 text-gray-500"
                >
                  {showCurrent ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2 text-gray-500"
                >
                  {showNew ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2 text-gray-500"
                >
                  {showConfirm ? "Ẩn" : "Hiện"}
                </button>
              </div>

              {errorPassword && <p className="text-red-500">{errorPassword}</p>}
              {successPassword && <p className="text-green-500">{successPassword}</p>}

              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
