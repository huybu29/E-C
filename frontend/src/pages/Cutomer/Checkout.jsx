import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Modal from "react-modal";
import axios from "axios";

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

  const [shippingMethod, setShippingMethod] = useState(""); // phương thức vận chuyển
  const [finalAddress, setFinalAddress] = useState("");

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
    } catch (err) {
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
    if (cartItems.length === 0) {
      alert("Giỏ hàng trống, không thể đặt hàng");
      return;
    }
    if (!finalAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    if (!shippingMethod) {
      alert("Vui lòng chọn phương thức vận chuyển");
      return;
    }

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
      console.log(orderData);
      await api.post("/order/orders/", orderData);

      alert("Đặt hàng thành công!");
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      alert("Đặt hàng thất bại, vui lòng thử lại.");
    }
  };

  if (loading) return <p className="text-center mt-6">Đang tải giỏ hàng...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  if (cartItems.length === 0)
    return <p className="text-center mt-6">Giỏ hàng của bạn đang trống.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sản phẩm trong giỏ</h2>
        <ul className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <li key={item.id} className="flex py-4">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.product.name}</h3>
                <p>
                  {item.quantity} ×{" "}
                  {Number(item.product.price).toLocaleString()} đ ={" "}
                  {(item.quantity * item.product.price).toLocaleString()} đ
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 text-right text-xl font-bold text-pink-600">
          Tổng tiền: {totalPrice.toLocaleString()} đ
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Địa chỉ giao hàng:</label>
        <div className="flex items-center gap-3">
          <span>{finalAddress || "Chưa chọn"}</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Chọn địa chỉ
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Phương thức vận chuyển:</label>
        <select
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Chọn phương thức</option>
          {shippingOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} (+{opt.cost.toLocaleString()} đ)
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-12 rounded"
      >
        Đặt hàng
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-6 rounded shadow max-w-lg mx-auto mt-20"
      >
        <h2 className="text-xl font-bold mb-4">Chọn địa chỉ giao hàng</h2>

        <select
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(Number(e.target.value))}
          className="w-full border p-2 mb-3"
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
          className="w-full border p-2 mb-3"
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
          className="w-full border p-2 mb-3"
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
          className="w-full border p-2 mb-3"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 border rounded"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveAddress}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Lưu
          </button>
        </div>
      </Modal>
    </div>
  );
}
