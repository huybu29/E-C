import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const [shippingMethod, setShippingMethod] = useState("");
  const [finalAddress, setFinalAddress] = useState("");
  const navigate = useNavigate();

  const shippingOptions = [
    { id: "standard", name: "Giao hàng tiêu chuẩn (3-5 ngày)", cost: 30000 },
    { id: "express", name: "Giao hàng nhanh (1-2 ngày)", cost: 50000 },
    { id: "pickup", name: "Nhận tại cửa hàng", cost: 0 },
  ];

  useEffect(() => {
    fetchCart();
    fetchProvinces();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart/cart-items/");
      setCartItems(res.data);
      const total = res.data.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      setTotalPrice(total);
    } catch {
      setError("Không thể lấy giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    const res = await axios.get("https://provinces.open-api.vn/api/p/");
    setProvinces(res.data);
  };

  const handleProvinceChange = async (code) => {
    setSelectedProvince(code);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    const res = await axios.get(
      `https://provinces.open-api.vn/api/p/${code}?depth=2`
    );
    setDistricts(res.data.districts);
  };

  const handleDistrictChange = async (code) => {
    setSelectedDistrict(code);
    setSelectedWard("");
    setWards([]);
    const res = await axios.get(
      `https://provinces.open-api.vn/api/d/${code}?depth=2`
    );
    setWards(res.data.wards);
  };

  const handleSaveAddress = () => {
    const provinceName =
      provinces.find((p) => p.code === selectedProvince)?.name || "";
    const districtName =
      districts.find((d) => d.code === selectedDistrict)?.name || "";
    const wardName = wards.find((w) => w.code === selectedWard)?.name || "";

    const fullAddress = `${detailAddress}, ${wardName}, ${districtName}, ${provinceName}`;
    setFinalAddress(fullAddress);
    setIsModalOpen(false);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return alert("Giỏ hàng trống");
    if (!finalAddress) return alert("Chọn địa chỉ giao hàng");
    if (!shippingMethod) return alert("Chọn phương thức vận chuyển");

    try {
      const orderData = {
        address: finalAddress,
        shipping_method: shippingMethod,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        total_price: totalPrice,
      };
      await api.post("/order/orders/", orderData);
      alert("Đặt hàng thành công!");
    } catch {
      alert("Đặt hàng thất bại, vui lòng thử lại.");
    }
  };

  if (loading)
    return <p className="text-center mt-6 text-purple-500">Đang tải giỏ hàng...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (cartItems.length === 0)
    return <p className="text-center mt-6 text-purple-300">Giỏ hàng của bạn đang trống.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-[100px] p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">Thanh toán</h1>

      {/* Danh sách sản phẩm */}
      <div className="mb-8 overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200">
          <thead className="bg-purple-100">
            <tr>
              <th className="px-4 py-2 text-left text-purple-700">Sản phẩm</th>
              <th className="px-4 py-2 text-right text-purple-700">Đơn giá</th>
              <th className="px-4 py-2 text-center text-purple-700">Số lượng</th>
              <th className="px-4 py-2 text-right text-purple-700">Tổng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <tr key={item.id} className="hover:bg-purple-50 transition">
                <td className="px-4 py-2 flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded border border-purple-200"
                  />
                  <span className="text-purple-800 font-semibold">
                    {item.product.name}
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-purple-600">
                  {item.product.price.toLocaleString()} đ
                </td>
                <td className="px-4 py-2 text-center">{item.quantity}</td>
                <td className="px-4 py-2 text-right font-bold text-purple-700">
                  {(item.product.price * item.quantity).toLocaleString()} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-right text-xl font-bold text-purple-700">
          Tổng tiền: {totalPrice.toLocaleString()} đ
        </div>
      </div>

      {/* Chọn địa chỉ */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold text-purple-700">Địa chỉ giao hàng:</label>
        <div className="flex items-center gap-3">
          <span className="text-gray-700">{finalAddress || "Chưa chọn"}</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Chọn địa chỉ
          </button>
        </div>
      </div>

      {/* Phương thức vận chuyển */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold text-purple-700">
          Phương thức vận chuyển:
        </label>
        <select
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
          className="w-full border border-purple-200 p-2 rounded"
        >
          <option value="">Chọn phương thức</option>
          {shippingOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} (+{opt.cost.toLocaleString()} đ)
            </option>
          ))}
        </select>
      </div>

      {/* Nút đặt hàng */}
      <button
        onClick={() => {
          handlePlaceOrder();
          navigate("/order");
        }}
        className="bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 text-white font-semibold py-3 px-12 rounded-xl shadow mt-4 transition"
      >
        Đặt hàng
      </button>

      {/* Modal chọn địa chỉ */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-6 rounded-xl shadow-lg max-w-lg mx-auto mt-20"
      >
        <h2 className="text-xl font-bold mb-4 text-purple-700">
          Chọn địa chỉ giao hàng
        </h2>

        <select
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(Number(e.target.value))}
          className="w-full border border-purple-200 p-2 mb-3 rounded"
        >
          <option value="">Chọn tỉnh/thành phố</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(Number(e.target.value))}
          className="w-full border border-purple-200 p-2 mb-3 rounded"
          disabled={!selectedProvince}
        >
          <option value="">Chọn quận/huyện</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(Number(e.target.value))}
          className="w-full border border-purple-200 p-2 mb-3 rounded"
          disabled={!selectedDistrict}
        >
          <option value="">Chọn xã/phường</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>

        <textarea
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          placeholder="Nhập số nhà, tên đường..."
          className="w-full border border-purple-200 p-2 mb-3 rounded"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveAddress}
            className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Lưu
          </button>
        </div>
      </Modal>
    </div>
  );
}
