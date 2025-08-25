import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart/cart-items/");
        setCartItems(res.data);
      } catch (err) {
        console.error("Lỗi lấy giỏ hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (id, change) => {
    try {
      const newQty = Math.max(
        1,
        cartItems.find((item) => item.id === id).quantity + change
      );
      await api.patch(`/cart/cart-items/${id}/`, { quantity: newQty });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/cart-items/${id}/`);
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading)
    return (
      <p className="text-center text-purple-500 mt-6 animate-pulse">
        Đang tải giỏ hàng...
      </p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-6 my-[100px] bg-gradient-to-br from-purple-50 via-white to-purple-100 min-h-screen rounded-2xl shadow-md"
    >
      <h1 className="text-3xl font-extrabold mb-8 text-purple-700 text-center drop-shadow-md">
        🛒 Giỏ hàng của bạn
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[75px] font-semibold text-purple-500 mb-4">
            Giỏ hàng của bạn đang trống 😢
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-purple-500 text-[50px] hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg"
          >
            🛍️ Mua sắm ngay
          </motion.button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center bg-white rounded-2xl border border-purple-100 shadow-sm p-4 hover:shadow-md transition"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg border border-purple-200"
                />
                <div className="flex-1 ml-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.product.name}
                  </h2>
                  <p className="text-purple-600 font-bold">
                    {item.product.price.toLocaleString()} đ
                  </p>

                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-3 py-1 bg-purple-100 text-purple-600 rounded-l-lg hover:bg-purple-200 transition"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-t border-b text-gray-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 py-1 bg-purple-100 text-purple-600 rounded-r-lg hover:bg-purple-200 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {(item.product.price * item.quantity).toLocaleString()} đ
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 text-sm hover:underline mt-2"
                  >
                    Xóa
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tổng tiền */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-6 bg-white rounded-2xl shadow p-4 flex justify-between items-center border-t-4 border-purple-400"
          >
            <p className="text-lg font-semibold text-gray-700">Tổng cộng:</p>
            <p className="text-2xl font-extrabold text-purple-600">
              {totalPrice.toLocaleString()} đ
            </p>
          </motion.div>

          {/* Nút thanh toán */}
          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg transition"
              onClick={() => navigate("/checkout")}
            >
              💳 Thanh toán
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
}
