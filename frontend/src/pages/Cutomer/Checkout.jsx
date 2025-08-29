// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===== Address =====
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [detailAddress, setDetailAddress] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [shippingMethod, setShippingMethod] = useState("");
  const navigate = useNavigate();

  const shippingOptions = [
    { id: "standard", name: "Giao hàng tiêu chuẩn (3-5 ngày)", cost: 30000 },
    { id: "express", name: "Giao hàng nhanh (1-2 ngày)", cost: 50000 },
    { id: "pickup", name: "Nhận tại cửa hàng", cost: 0 },
  ];

  useEffect(() => {
    fetchCart();
    fetchAddresses();
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

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/order/address/");
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
      const res = await axios.get(
        `https://provinces.open-api.vn/api/v2/p/${code}?depth=2`
      );
      setWards(res.data.wards);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAddress = async () => {
    const provinceName =
      provinces.find((p) => p.code === selectedProvince)?.name || "";
    const wardName = wards.find((w) => w.code === selectedWard)?.name || "";
    const payload = {
      province: provinceName,
      ward: wardName,
      detail_address: detailAddress,
    };

    try {
      if (editingAddressId) {
        await api.patch(`/order/address/${editingAddressId}/`, payload);
      } else {
        const res = await api.post("/order/address/", payload);
        setSelectedAddressId(res.data.id); // chọn mới luôn
      }
      fetchAddresses();
      setIsModalOpen(false);
      setEditingAddressId(null);
      setDetailAddress("");
      setSelectedProvince("");
      setSelectedWard("");
    } catch (err) {
      console.error("Lỗi lưu địa chỉ:", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return alert("Giỏ hàng trống");
    if (!selectedAddressId) return alert("Chọn địa chỉ giao hàng");
    if (!shippingMethod) return alert("Chọn phương thức vận chuyển");

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    const shippingCost =
      shippingOptions.find((opt) => opt.id === shippingMethod)?.cost || 0;

    const orderData = {
      address: `${selectedAddress.detail_address}, ${selectedAddress.ward}, ${selectedAddress.province}`,
      shipping_method: shippingMethod,
      shipping_cost: shippingCost,
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        seller_id: item.product.seller,
      })),
      total_price:
        cartItems.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        ) + shippingCost,
    };

    try {
      await api.post("/order/orders/", orderData);
      await Promise.all(
        cartItems.map((item) => api.delete(`/cart/cart-items/${item.id}/`))
      );
      navigate("/order");
    } catch {
      alert("Đặt hàng thất bại, vui lòng thử lại.");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-6 text-purple-500">
        Đang tải giỏ hàng...
      </p>
    );
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (cartItems.length === 0)
    return (
      <p className="text-center mt-6 text-purple-300">Giỏ hàng của bạn đang trống.</p>
    );

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const selectedShippingCost =
    shippingOptions.find((opt) => opt.id === shippingMethod)?.cost || 0;

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
          Tổng tiền: {(totalPrice + selectedShippingCost).toLocaleString()} đ
        </div>
      </div>

      {/* Chọn địa chỉ */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold text-purple-700">Địa chỉ giao hàng:</label>
        <div className="flex items-center gap-3">
          <span className="text-gray-700">
            {selectedAddress
              ? `${selectedAddress.detail_address}, ${selectedAddress.ward}, ${selectedAddress.province}`
              : "Chưa chọn"}
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Chọn / Thêm địa chỉ
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
        onClick={handlePlaceOrder}
        className="bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 text-white font-semibold py-3 px-12 rounded-xl shadow mt-4 transition"
      >
        Đặt hàng
      </button>

      {/* Modal quản lý địa chỉ */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-40">
          <div className="absolute inset-0 bg-gray bg-opacity-60 backdrop-blur-sm"></div>
          <div className="bg-white p-6 rounded-xl w-full max-w-lg flex flex-col gap-4 z-50 relative">
            <h2 className="text-xl font-bold">Quản lý địa chỉ</h2>

            {/* Danh sách địa chỉ */}
            {addresses.length > 0 ? (
              <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className={`p-3 border rounded-lg flex justify-between items-center ${
                      selectedAddressId === addr.id ? "bg-purple-100" : ""
                    }`}
                  >
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="selectedAddress"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mr-2"
                      />
                      {addr.detail_address}, {addr.ward}, {addr.province}
                    </label>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAddressId(addr.id);
                          setDetailAddress(addr.detail_address);
                          const provinceObj = provinces.find(
                            (p) => p.name === addr.province
                          );
                          setSelectedProvince(provinceObj?.code || "");
                          if (provinceObj) {
                            axios
                              .get(
                                `https://provinces.open-api.vn/api/v2/p/${provinceObj.code}?depth=2`
                              )
                              .then((res) => {
                                setWards(res.data.wards || []);
                                const wardObj = res.data.wards.find(
                                  (w) => w.name === addr.ward
                                );
                                setSelectedWard(wardObj?.code || "");
                              });
                          }
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Bạn có chắc muốn xóa địa chỉ này?"))
                            return;
                          try {
                            await api.delete(`/order/address/${addr.id}/`);
                            fetchAddresses();
                            if (selectedAddressId === addr.id)
                              setSelectedAddressId(null);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có địa chỉ nào</p>
            )}

            <hr className="my-2" />

            {/* Thêm / chỉnh sửa địa chỉ */}
            <div className="flex flex-col gap-2">
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

              <div className="flex gap-4 mt-2">
                <button
                  onClick={handleSaveAddress}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Thêm
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAddressId(null);
                    setDetailAddress("");
                    setSelectedProvince("");
                    setSelectedWard("");
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-gray-500"
                >
                  Chọn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
