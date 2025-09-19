import React, { useState, useEffect } from "react";
import api from "../../services/api";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, MapPin } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const location = useLocation();
  const shippingOptions = [
    { id: "standard", name: t("Standard (3-5 days)"), cost: 30000 },
    { id: "express", name: t("Express (1-2 days)"), cost: 50000 },
    { id: "pickup", name: t("Pickup"), cost: 0 },
  ];

  useEffect(() => {
    if (location.state?.selectedItems) {
      const selected = location.state.selectedItems;
      setCartItems(selected);
      const total = selected.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      setTotalPrice(total);
      setLoading(false);
    } else fetchCart();

    fetchAddresses();
    fetchProvinces();
  }, [location.state]);

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
      setError(t("emptyCartMsg"));
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/order/address/");
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
        setSelectedAddressId(res.data.id);
      }
      fetchAddresses();
      setIsModalOpen(false);
      setEditingAddressId(null);
      setDetailAddress("");
      setSelectedProvince("");
      setSelectedWard("");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return alert(t("cartEmptyAlert"));
    if (!selectedAddressId) return alert(t("chooseAddressAlert"));
    if (!shippingMethod) return alert(t("chooseShippingAlert"));

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
      console.log("Order Data:", orderData);
      await api.post("/order/orders/", orderData);
      await Promise.all(
        cartItems.map((item) => api.delete(`/cart/cart-items/${item.id}/`))
      );
      navigate("/order");
    } catch {
      alert("Order failed, please try again.");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-6 text-purple-500">{t("loadingCart")}</p>
    );
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (cartItems.length === 0)
    return <p className="text-center mt-6 text-purple-300">{t("emptyCartMsg")}</p>;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const selectedShippingCost =
    shippingOptions.find((opt) => opt.id === shippingMethod)?.cost || 0;

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-24 p-6 bg-white rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 text-purple-700"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {t("checkoutTitle")}
      </motion.h1>

      {/* Danh sách sản phẩm */}
      <motion.div
        className="mb-8 overflow-x-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200">
          <thead className="bg-purple-100">
            <tr>
              <th className="px-4 py-2 text-left text-purple-700">{t("product")}</th>
              <th className="px-4 py-2 text-right text-purple-700">{t("unitPrice")}</th>
              <th className="px-4 py-2 text-center text-purple-700">{t("quantity")}</th>
              <th className="px-4 py-2 text-right text-purple-700">{t("total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <motion.tr
                key={item.id}
                className="hover:bg-purple-50 transition-transform duration-300 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <td className="px-4 py-2 flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Swiper slidesPerView={1} className="w-16 h-16">
                      <SwiperSlide>
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded border border-purple-200"
                        />
                      </SwiperSlide>
                      {/* Nếu có nhiều ảnh, thêm slide khác */}
                    </Swiper>
                  </motion.div>
                  <span className="text-purple-800 font-semibold">{item.product.name}</span>
                </td>
                <td className="px-4 py-2 text-right text-purple-600">{item.product.price.toLocaleString()} đ</td>
                <td className="px-4 py-2 text-center">{item.quantity}</td>
                <td className="px-4 py-2 text-right font-bold text-purple-700">
                  {(item.product.price * item.quantity).toLocaleString()} đ
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <motion.div
          className="mt-4 text-right text-xl font-bold text-purple-700 sticky top-6 bg-white p-2 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {t("totalPrice")}: {(totalPrice + selectedShippingCost).toLocaleString()} đ
        </motion.div>
      </motion.div>

      {/* Chọn địa chỉ */}
      <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <label className="block mb-1 font-semibold text-purple-700">{t("shippingAddress")}:</label>
        <div className="flex items-center gap-3">
          <MapPin className="text-purple-500" />
          <span className="text-gray-700">
            {selectedAddress
              ? `${selectedAddress.detail_address}, ${selectedAddress.ward}, ${selectedAddress.province}`
              : t("noAddress")}
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-transform hover:scale-105"
          >
            {t("chooseAddAddress")}
          </button>
        </div>
      </motion.div>

      {/* Phương thức vận chuyển */}
      <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <label className="block mb-1 font-semibold text-purple-700">{t("shippingMethod")}:</label>
        <select
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
          className="w-full border border-purple-200 p-2 rounded hover:border-purple-400 focus:ring focus:ring-purple-200 transition"
        >
          <option value="">{t("chooseMethod")}</option>
          {shippingOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} (+{opt.cost.toLocaleString()} đ)
            </option>
          ))}
        </select>
      </motion.div>

      {/* Nút đặt hàng */}
      <motion.button
        onClick={handlePlaceOrder}
        className="bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 text-white font-semibold py-3 px-12 rounded-xl shadow mt-4 transition-transform hover:scale-105"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {t("placeOrder")}
      </motion.button>

      {/* Modal quản lý địa chỉ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gray-700 bg-opacity-50 backdrop-blur-sm"></div>
            <motion.div
              className="bg-white p-6 rounded-xl w-full max-w-lg flex flex-col gap-4 z-50 relative"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <h2 className="text-xl font-bold">{t("manageAddress")}</h2>
              {addresses.length > 0 ? (
                <motion.ul
                  className="flex flex-col gap-2 max-h-48 overflow-y-auto"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                >
                  {addresses.map((addr) => (
                    <motion.li
                      key={addr.id}
                      className={`p-3 border rounded-lg flex justify-between items-center ${
                        selectedAddressId === addr.id ? "bg-purple-100" : ""
                      }`}
                      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                      whileHover={{ scale: 1.02 }}
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
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-1"
                        >
                          <Edit size={16} /> {t("edit")}
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(t("confirmDeleteAddress"))) return;
                            try {
                              await api.delete(`/order/address/${addr.id}/`);
                              fetchAddresses();
                              if (selectedAddressId === addr.id)
                                setSelectedAddressId(null);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> {t("delete")}
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <p>{t("noAddress")}</p>
              )}

              <hr className="my-2" />

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder={t("detailAddress")}
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-purple-300 transition"
                />
                <select
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(Number(e.target.value))}
                  className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-purple-300 transition"
                >
                  <option value="">{t("selectProvince")}</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(Number(e.target.value))}
                  className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-purple-300 transition"
                  disabled={!wards.length}
                >
                  <option value="">{t("selectWard")}</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-4 mt-2">
                  <button
                    onClick={handleSaveAddress}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-transform hover:scale-105"
                  >
                    {t("add")}
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingAddressId(null);
                      setDetailAddress("");
                      setSelectedProvince("");
                      setSelectedWard("");
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-gray-500 transition-transform hover:scale-105"
                  >
                    {t("select")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
