import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../../services/api";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function ProfileProfilePage() {
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ fullname: "", email: "", phone_number: "" });

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
      console.error(t("cannotLoadProfile"), err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    try {
      const res = await API.patch(`/account/profiles/${profile.id}/`, formData);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await API.get("/order/address/");
      setAddresses(res.data);
    } catch (err) {
      console.error(err);
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
    const payload = { province: provinceName, ward: wardName, detail_address: detailAddress };

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
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    setErrorPassword(""); setSuccessPassword("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorPassword(t("fillAllFields")); return;
    }
    if (newPassword !== confirmPassword) {
      setErrorPassword(t("passwordMismatch")); return;
    }

    try {
      await API.post("/account/change-password/", { current_password: currentPassword, new_password: newPassword });
      setSuccessPassword(t("changePasswordSuccess"));
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setErrorPassword(err.response?.data?.detail || t("changePasswordFail"));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-600">{t("loadingProfile")}</p>
    </div>
  );

  if (!profile) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-red-500">{t("cannotLoadProfile")}</p>
    </div>
  );

  const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullname)}&background=52057B&color=fff&size=128&rounded=true`;

  return (
    <div className="max-w-6xl mx-auto my-30 px-4 sm:px-6 lg:px-8 flex gap-8">
      {/* Sidebar */}
      <motion.div className="w-64 bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex flex-col items-center mb-6">
          <img src={avatarUrl} alt="Avatar" className="w-24 h-24 object-cover rounded-full border-4 border-purple-600" />
          <h2 className="text-xl font-bold mt-2">{profile.fullname}</h2>
          <p className="text-gray-500">{profile.email}</p>
        </div>
        <button onClick={() => setActiveTab("profile")} className={`text-left px-4 py-2 rounded-lg ${activeTab==="profile"?"bg-purple-600 text-white":"hover:bg-purple-100"}`}>{t("profileTab")}</button>
        <button onClick={() => setActiveTab("address")} className={`text-left px-4 py-2 rounded-lg ${activeTab==="address"?"bg-purple-600 text-white":"hover:bg-purple-100"}`}>{t("addressTab")}</button>
        <button onClick={() => setActiveTab("password")} className={`text-left px-4 py-2 rounded-lg ${activeTab==="password"?"bg-purple-600 text-white":"hover:bg-purple-100"}`}>{t("passwordTab")}</button>
      </motion.div>

      {/* Content */}
      <motion.div className="flex-1 bg-white rounded-2xl shadow-lg p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">{t("profileTitle")}</h1>
            {editing ? (
              <div className="flex flex-col gap-4">
                {["fullname","email","phone_number"].map(field => (
                  <div key={field}>
                    <label className="block font-semibold">{t(field)}</label>
                    <input type={field==="email"?"email":"text"} name={field} value={formData[field]} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2"/>
                  </div>
                ))}
                <div className="flex gap-4 mt-4">
                  <button onClick={handleSaveProfile} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{t("save")}</button>
                  <button onClick={()=>setEditing(false)} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p><span className="font-semibold">{t("fullName")}:</span> {profile.fullname}</p>
                <p><span className="font-semibold">{t("email")}:</span> {profile.email}</p>
                <p><span className="font-semibold">{t("phoneNumber")}:</span> {profile.phone_number || "Chưa cập nhật"}</p>
                <button onClick={()=>setEditing(true)} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{t("edit")}</button>
              </div>
            )}
          </div>
        )}

        {/* Address Tab */}
        {activeTab === "address" && (
          <div>
            <h1 className="text-2xl font-bold mb-4 flex justify-between">
              <span>{t("addressTitle")}</span>
              <button onClick={() => { setIsModalOpen(true); setDetailAddress(""); setSelectedProvince(""); setSelectedWard(""); setEditingAddressId(null); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{t("addAddress")}</button>
            </h1>
            <ul className="flex flex-col gap-2">
              {addresses.length ? addresses.map(addr => (
                <li key={addr.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <span>{addr.detail_address}, {addr.ward}, {addr.province}</span>
                  <div className="flex gap-2">
                    <button onClick={async ()=>{ /* handle edit */ }} className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">{t("edit")}</button>
                    <button onClick={async ()=>{ if(!confirm(t("deleteConfirm"))) return; await API.delete(`/order/address/${addr.id}/`); fetchAddresses(); }} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">Xóa</button>
                  </div>
                </li>
              )) : <p>{t("noAddresses")}</p>}
            </ul>

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 flex justify-center items-center z-40">
                <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>
                <div className="bg-white p-6 rounded-xl w-full max-w-md flex flex-col gap-4 z-50 relative">
                  <h2 className="text-xl font-bold">{editingAddressId ? t("editAddress") : t("newAddress")}</h2>
                  <input type="text" placeholder={t("detailAddress")} value={detailAddress} onChange={(e)=>setDetailAddress(e.target.value)} className="border px-3 py-2 rounded-lg w-full"/>
                  <select value={selectedProvince} onChange={(e)=>handleProvinceChange(Number(e.target.value))} className="border px-3 py-2 rounded-lg w-full">
                    <option value="">{t("selectProvince")}</option>
                    {provinces.map(p=><option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                  <select value={selectedWard} onChange={(e)=>setSelectedWard(Number(e.target.value))} className="border px-3 py-2 rounded-lg w-full" disabled={!wards.length}>
                    <option value="">{t("selectWard")}</option>
                    {wards.map(w=><option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                  <div className="flex gap-4 mt-4">
                    <button onClick={handleSaveAddress} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{t("save")}</button>
                    <button onClick={()=>setIsModalOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">{t("cancel")}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">{t("passwordTitle")}</h1>
            <div className="flex flex-col gap-4">
              {[
                {value: currentPassword, set: setCurrentPassword, show: showCurrent, setShow: setShowCurrent, placeholder: t("currentPassword")},
                {value: newPassword, set: setNewPassword, show: showNew, setShow: setShowNew, placeholder: t("newPassword")},
                {value: confirmPassword, set: setConfirmPassword, show: showConfirm, setShow: setShowConfirm, placeholder: t("confirmNewPassword")}
              ].map((input,i)=>(
                <div className="relative" key={i}>
                  <input type={input.show?"text":"password"} placeholder={input.placeholder} value={input.value} onChange={(e)=>input.set(e.target.value)} className="w-full border px-3 py-2 rounded-lg"/>
                  <button type="button" onClick={()=>input.setShow(!input.show)} className="absolute right-3 top-2 text-gray-500">{input.show?t("hide"):t("show")}</button>
                </div>
              ))}
              {errorPassword && <p className="text-red-500">{errorPassword}</p>}
              {successPassword && <p className="text-green-500">{successPassword}</p>}
              <button onClick={handleChangePassword} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{t("changePassword")}</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
