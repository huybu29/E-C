import React, { useState } from "react";
import api from "../../services/api";

export default function SellerRegister() {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/account/seller/", {
        shop_name: shopName,
        phone,
        address,
      });
      setMessage("Đăng ký người bán thành công!");
    } catch (error) {
      setMessage("Lỗi khi đăng ký người bán.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded mt-10">
      <h2 className="text-xl font-bold mb-4">Đăng ký làm người bán</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên cửa hàng"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <textarea
          placeholder="Địa chỉ"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Đăng ký
        </button>
      </form>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}
