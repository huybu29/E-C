import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { AuthContext } from "../../services/AuthContext";
import ReactStars from "react-stars";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [filterStars, setFilterStars] = useState(0);

  useEffect(() => {
    API.get(`/product/${id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));

    API.get(`/product/reviews/?product=${id}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleNotLoggedIn = () => {
    alert("Vui lòng đăng nhập để thực hiện hành động này!");
    navigate("/login");
  };

  const addToCart = (qty) => {
    if (!isLoggedIn) return handleNotLoggedIn();
    API.post("/cart/cart-items/", { product_id: product.id, quantity: qty })
      .then(() => alert("Đã thêm sản phẩm vào giỏ hàng!"))
      .catch((err) => console.error(err));
  };

  const buyNow = () => {
    if (!isLoggedIn) return handleNotLoggedIn();
    API.post("/cart/cart-items/", { product_id: product.id, quantity: 1 })
      .then(() => navigate("/cart"))
      .catch((err) => console.error(err));
  };

  if (!product)
    return <div className="text-center text-gray-500 text-lg mt-20">Đang tải...</div>;

  const filteredReviews =
    filterStars > 0
      ? reviews.filter((r) => Math.round(r.rating) === filterStars)
      : reviews;

  return (
    <div className="max-w-7xl mx-20 my-30 px-4 py-10 bg-purple-900 rounded-2xl shadow-lg">
      {/* Thông tin sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-purple-100  p-10 rounded-2xl shadow-lg">
        <div className="flex justify-center items-center">
          <img
            src={product.image || "https://via.placeholder.com/400"}
            alt={product.name}
            className="max-w-full h-auto rounded-xl shadow-lg transition-transform hover:scale-105"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold text-[#52057B] mb-4">
            {product.name}
          </h1>
          <p className="text-2xl text-[#BC6FF1] font-semibold mb-4">
            {Number(product.price).toLocaleString("vi-VN")}₫
          </p>
          <p className="text-gray-700 mb-6 text-lg">{product.description}</p>

          <div className="flex items-center mb-6 gap-4">
            <label className="text-gray-800 font-medium">Số lượng:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1 w-24 focus:ring-2 focus:ring-[#BC6FF1] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => addToCart(quantity)}
              className="flex-1 bg-gradient-to-r from-[#BC6FF1] to-[#52057B] hover:from-[#52057B] hover:to-[#000000] text-white px-6 py-3 rounded-xl shadow-md transition font-medium"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={buyNow}
              className="flex-1 bg-gradient-to-r from-[#52057B] to-[#000000] hover:from-[#000000] hover:to-[#52057B] text-white px-6 py-3 rounded-xl shadow-md transition font-medium"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Review */}
      <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-[#52057B] mb-4">Đánh giá sản phẩm</h2>

        {/* Bộ lọc số sao */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold text-[#52057B]">Lọc theo số sao:</span>
          {[0, 5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setFilterStars(star)}
              className={`px-3 py-1 rounded-full border transition ${
                filterStars === star
                  ? "bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white border-[#52057B]"
                  : "bg-white text-[#52057B] border-[#BC6FF1] hover:bg-[#BC6FF1]/10"
              }`}
            >
              {star === 0 ? "Tất cả" : `${star} ★`}
            </button>
          ))}
        </div>

        {filteredReviews.length === 0 ? (
          <p className="text-gray-500">Chưa có đánh giá nào</p>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 border rounded-lg hover:shadow-md transition bg-[#BC6FF1]/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://via.placeholder.com/40"
                      alt={review.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-semibold text-[#52057B]">
                        {review.user.username}
                      </span>
                      <p className="text-gray-500 text-sm">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <ReactStars
                    count={5}
                    size={20}
                    value={review.rating}
                    edit={false}
                    color2="#ffd700"
                  />
                </div>
                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
                {review.image && (
                  <p>
                    <img
                      src={review.image}
                      alt="Review"
                      className="w-50 h-auto rounded-lg"
                    />
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
