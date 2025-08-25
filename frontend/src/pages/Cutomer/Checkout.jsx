import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Trạng thái mở modal
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

  const handleCheckout = () => {
    // Ở đây có thể gọi API thanh toán, demo mình chỉ hiển thị modal
    setShowModal(true);
  };

  if (loading)
    return (
      <p className="text-center text-purple-500 mt-6">
        Đang tải giỏ hàng...
      </p>
    );

  return (
    <div className="relative">
      <div className="max-w-5xl mx-auto p-6 my-[100px] bg-gradient-to-br from-purple-50 via-white to-purple-100 min-h-screen rounded-2xl shadow-md">
        <h1 className="text-3xl font-extrabold mb-8 text-purple-700 text-center">
          🛒 Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="text-purple-400 mb-4">Giỏ hàng trống</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl shadow-md transition"
            >
              🛍️ Mua sắm ngay
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
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
                        className="px-3 py-1 bg-purple-100 text-purple-600 rounded-l-lg hover:bg-purple-200"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-t border-b text-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3 py-1 bg-purple-100 text-purple-600 rounded-r-lg hover:bg-purple-200"
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
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="mt-6 bg-white rounded-2xl shadow p-4 flex justify-between items-center border-t-4 border-purple-300">
              <p className="text-lg font-semibold text-gray-700">Tổng cộng:</p>
              <p className="text-xl font-bold text-purple-600">
                {totalPrice.toLocaleString()} đ
              </p>
            </div>

            {/* Nút thanh toán */}
            <div className="mt-6 flex justify-end">
              <button
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl shadow-md transition"
                onClick={handleCheckout}
              >
                Thanh toán
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal Thanh toán thành công */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay mờ */}
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>

          {/* Hộp thông báo */}
          <div className="relative bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center animate-fadeIn">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              ✅ Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/");
              }}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-md"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
