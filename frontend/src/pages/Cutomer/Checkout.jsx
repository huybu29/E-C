import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        console.error("Lỗi lấy giỏ hàng:", err);
        setError("Không thể lấy giỏ hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng trống, không thể đặt hàng");
      return;
    }
    try {
      const orderData = {
        // Bỏ phần thông tin khách hàng
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        total_price: totalPrice,
      };
      console.log(orderData)
      await api.post("/order/orders/", orderData);

      alert("Đặt hàng thành công!");
      // Có thể reset form hoặc redirect
    } catch (err) {
      console.log(orderData)
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Thanh toán</h1>

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

      <div className="flex justify-center">
        <button
          onClick={handlePlaceOrder}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-12 rounded"
        >
          Đặt hàng
        </button>
      </div>
    </div>
  );
}
