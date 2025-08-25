import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { AuthContext } from "../../services/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactStars from "react-stars";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [filterStars, setFilterStars] = useState(0);
  const [showModal, setShowModal] = useState(false);

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
      .then(() => {
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2000);
      })
      .catch((err) => console.error(err));
  };

  const buyNow = (qty) => {
    if (!isLoggedIn) return handleNotLoggedIn();
    API.post("/cart/cart-items/", { product_id: product.id, quantity: qty })
      .then(() => navigate("/cart"))
      .catch((err) => console.error(err));
  };

  if (!product)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500 text-lg mt-20"
      >
        Đang tải...
      </motion.div>
    );

  const filteredReviews =
    filterStars > 0
      ? reviews.filter((r) => Math.round(r.rating) === filterStars)
      : reviews;

  return (
    <div className="max-w-7xl mx-auto my-12 px-4 py-10 bg-gradient-to-b from-purple-900 via-[#52057B] to-black rounded-3xl shadow-2xl">
      {/* Thông tin sản phẩm */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-10 rounded-2xl shadow-xl"
      >
        {/* Ảnh */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex justify-center items-center"
        >
          <img
            src={product.image || "https://via.placeholder.com/400"}
            alt={product.name}
            className="max-w-full h-auto rounded-2xl shadow-lg"
          />
        </motion.div>

        {/* Nội dung */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold text-[#52057B] mb-4">
            {product.name}
          </h1>
          <p className="text-2xl text-[#BC6FF1] font-semibold mb-4">
            {Number(product.price).toLocaleString("vi-VN")}₫
          </p>
          <p className="text-gray-700 mb-6 text-lg">{product.description}</p>

          {/* Số lượng */}
          <div className="flex items-center mb-6 gap-4">
            <label className="text-gray-800 font-medium">Số lượng:</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center focus:ring-2 focus:ring-[#BC6FF1] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(quantity)}
              className="flex-1 bg-gradient-to-r from-[#BC6FF1] to-[#52057B] hover:from-[#52057B] hover:to-[#000000] text-white px-6 py-3 rounded-xl shadow-lg font-medium transition"
            >
              Thêm vào giỏ hàng
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => buyNow(quantity)}
              className="flex-1 bg-gradient-to-r from-[#52057B] to-[#000000] hover:from-[#000000] hover:to-[#52057B] text-white px-6 py-3 rounded-xl shadow-lg font-medium transition"
            >
              Mua ngay
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal thêm giỏ hàng */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm w-full"
            >
              <h2 className="text-lg font-bold text-[#52057B] mb-2">
                ✅ Đã thêm vào giỏ hàng
              </h2>
              <p className="text-gray-600 mb-4">{product.name}</p>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white px-4 py-2 rounded-lg shadow-md hover:from-[#52057B] hover:to-[#000000] transition"
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-10 bg-white p-6 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-[#52057B] mb-4">
          Đánh giá sản phẩm
        </h2>

        {/* Bộ lọc sao */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold text-[#52057B]">Lọc theo số sao:</span>
          {[0, 5, 4, 3, 2, 1].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.1 }}
              onClick={() => setFilterStars(star)}
              className={`px-3 py-1 rounded-full border transition ${
                filterStars === star
                  ? "bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white border-[#52057B]"
                  : "bg-white text-[#52057B] border-[#BC6FF1] hover:bg-[#BC6FF1]/10"
              }`}
            >
              {star === 0 ? "Tất cả" : `${star} ★`}
            </motion.button>
          ))}
        </div>

        {filteredReviews.length === 0 ? (
          <p className="text-gray-500">Chưa có đánh giá nào</p>
        ) : (
          <motion.div
            layout
            className="space-y-4"
          >
            {filteredReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
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
                  <img
                    src={review.image}
                    alt="Review"
                    className="w-50 h-auto rounded-lg mt-2"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
