import { useState, useEffect } from "react";
import api from "../services/api";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy giỏ hàng từ backend khi load trang
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart/cart-items/");
        console.log("Cart API response:", res.data);
        setCartItems(res.data); // backend trả về list items
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

  if (loading) {
    return <p className="text-center">Đang tải giỏ hàng...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🛒 Giỏ hàng của bạn
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500 text-center">Giỏ hàng trống</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-white rounded-lg shadow p-4"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 ml-4">
                  <h2 className="text-lg font-semibold">
                    {item.product.name}
                  </h2>
                  <p className="text-pink-500 font-bold">
                    {item.product.price.toLocaleString()} đ
                  </p>

                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-3 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-t border-b">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
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
                    className="text-red-500 text-sm hover:underline mt-2"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="mt-6 bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <p className="text-lg font-semibold">Tổng cộng:</p>
            <p className="text-xl font-bold text-pink-500">
              {totalPrice.toLocaleString()} đ
            </p>
          </div>

          {/* Nút thanh toán */}
          <div className="mt-4 flex justify-end">
            <button
              className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow hover:bg-pink-600"
              onClick={() => alert("Đi đến trang thanh toán")}
            >
              Thanh toán
            </button>
          </div>
        </>
      )}
    </div>
  );
}
