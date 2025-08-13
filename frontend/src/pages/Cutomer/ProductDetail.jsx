import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    API.get(`/product/${id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const addToCart = (qty) => {
    API.post("/cart/cart-items/", { product_id: product.id, quantity: qty })
      .then(() => {
        alert("Đã thêm sản phẩm vào giỏ hàng!");
      })
      .catch((err) => console.error(err));
  };

  const buyNow = () => {
    API.post("/cart/cart-items/", { product_id: product.id, quantity: 1 })
      .then(() => {
        navigate("/cart"); // Điều hướng sang giỏ hàng
      })
      .catch((err) => console.error(err));
  };

  if (!product) return <div className="text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 rounded-2xl shadow-lg">
        {/* Hình ảnh */}
        <div className="flex justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full rounded-xl shadow-md"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-xl text-pink-600 font-semibold mb-4">
            {product.price}₫
          </p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Input số lượng */}
          <div className="flex items-center mb-6">
            <label className="mr-3 text-gray-700 font-medium">Số lượng:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-1 w-20 focus:outline-pink-500"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4">
            <button
              onClick={() => addToCart(quantity)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl shadow-md transition"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={buyNow}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl shadow-md transition"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
