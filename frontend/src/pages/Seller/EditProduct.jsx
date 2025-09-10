import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import ReactStars from "react-stars";
import SellerPage from "./SellerPage";

export default function SellerProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [replyEditId, setReplyEditId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [discountMethod, setDiscountMethod] = useState(""); // chọn phương thức giảm giá

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes, reviewRes] = await Promise.all([
          API.get(`/product/${id}/`),
          API.get("/category/categories/"),
          API.get(`/product/reviews/?product=${id}`),
        ]);
        setProduct(productRes.data);
        setCategories(categoryRes.data);
        setReviews(reviewRes.data);

        // gán phương thức giảm giá ban đầu
        if (productRes.data.discount_price) setDiscountMethod("price");
        else if (productRes.data.discount_percent) setDiscountMethod("percent");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !product)
    return <p className="text-center mt-10 text-gray-400">Đang tải dữ liệu...</p>;

  const calculateFinalPrice = (price, discountPrice, discountPercent) => {
    let final = parseFloat(price) || 0;
    if (discountPrice) {
      final = discountPrice;
    } else if (discountPercent) {
      final = price - (price * discountPercent) / 100;
    }
    return final > 0 ? final : 0;
  };

  const currencyVN = (v) =>
    Number(v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProduct((prev) => {
      const updated = { ...prev, [name]: files ? files[0] : value };

      const price = parseFloat(updated.price) || 0;
      const discountPrice =
        discountMethod === "price" ? parseFloat(updated.discount_price) || null : null;
      const discountPercent =
        discountMethod === "percent" ? parseFloat(updated.discount_percent) || null : null;

      updated.final_price = calculateFinalPrice(price, discountPrice, discountPercent);
      updated.discount_price = discountPrice;
      updated.discount_percent = discountPercent;

      return updated;
    });
  };

  const handleDiscountMethodChange = (e) => {
    const method = e.target.value;
    setDiscountMethod(method);
    setProduct((prev) => ({
      ...prev,
      discount_price: method === "price" ? prev.discount_price : null,
      discount_percent: method === "percent" ? prev.discount_percent : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: product.name,
      price: parseFloat(product.price),
      stock: parseInt(product.stock, 10),
      description: product.description,
      status: product.status,
      is_active: Boolean(product.is_active),
      category: parseInt(product.category, 10),
      discount_price: discountMethod === "price" ? product.discount_price : null,
      discount_percent: discountMethod === "percent" ? product.discount_percent : null,
      discount_start: product.discount_start || null,
      discount_end: product.discount_end || null,
    };
    try {
      await API.put(`/product/${id}/`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    }
  };

  const handleReplySave = async (reviewId) => {
    try {
      await API.patch(`/product/reviews/${reviewId}/`, { reply: replyText });
      setReplyEditId(null);
      setReplyText("");
      const res = await API.get(`/product/reviews/?product=${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      alert("Cập nhật phản hồi thất bại");
    }
  };

  return (
    <SellerPage>
      <div className="max-w-6xl mx-auto my-8 p-6 bg-gray-900 text-gray-100 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">
          Chi tiết sản phẩm
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hình ảnh */}
          <div className="flex justify-center items-center">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md h-auto object-cover rounded-xl shadow-md"
              />
            )}
          </div>

          {/* Form chỉnh sửa */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Các field cơ bản */}
            {[
              { label: "Tên sản phẩm", key: "name" },
              { label: "Mô tả", key: "description" },
              { label: "Giá (VND)", key: "price" },
              { label: "Số lượng tồn", key: "stock" },
              { label: "Trạng thái", key: "status" },
              { label: "Hoạt động", key: "is_active" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block font-semibold">{field.label}:</label>
                <input
                  type={
                    field.key === "price" || field.key === "stock"
                      ? "number"
                      : "text"
                  }
                  name={field.key}
                  value={product[field.key] ?? ""}
                  onChange={handleChange}
                  className="border border-gray-700 rounded-lg p-2 w-full bg-gray-800 text-gray-100"
                />
              </div>
            ))}

            {/* Danh mục */}
            <div>
              <label className="block font-semibold">Danh mục:</label>
              <select
                name="category"
                value={product.category || ""}
                onChange={handleChange}
                className="border border-gray-700 rounded-lg p-2 w-full bg-gray-800 text-gray-100"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phương thức giảm giá */}
            <div>
              <label className="block font-semibold">Phương thức giảm giá:</label>
              <select
                value={discountMethod}
                onChange={handleDiscountMethodChange}
                className="border border-gray-700 rounded-lg p-2 w-full bg-gray-800 text-gray-100"
              >
                <option value="">-- Không áp dụng --</option>
                <option value="price">Giảm theo giá cố định (VND)</option>
                <option value="percent">Giảm theo %</option>
              </select>
            </div>

            {/* Input giảm giá */}
            {discountMethod === "price" && (
              <div>
                <label className="block font-semibold">Giá sau giảm (VND):</label>
                <input
                  type="number"
                  name="discount_price"
                  value={product.discount_price ?? ""}
                  onChange={handleChange}
                  className="border border-gray-700 rounded-lg p-2 w-full bg-gray-800 text-gray-100"
                />
              </div>
            )}

            {discountMethod === "percent" && (
              <div>
                <label className="block font-semibold">Phần trăm giảm (%):</label>
                <input
                  type="number"
                  name="discount_percent"
                  value={product.discount_percent ?? ""}
                  onChange={handleChange}
                  className="border border-gray-700 rounded-lg p-2 w-full bg-gray-800 text-gray-100"
                />
              </div>
            )}

            {/* Thời gian giảm giá */}
            <div>
              <label className="block font-semibold">Bắt đầu giảm giá:</label>
              <input
                type="datetime-local"
                name="discount_start"
                value={
                  product.discount_start
                    ? product.discount_start.substring(0, 16)
                    : ""
                }
                onChange={handleChange}
                className="border border-gray-700 rounded-lg p-2 w-full bg-gray-800 text-gray-100"
              />
            </div>

            <div>
              <label className="block font-semibold">Kết thúc giảm giá:</label>
              <input
                type="datetime-local"
                name="discount_end"
                value={
                  product.discount_end
                    ? product.discount_end.substring(0, 16)
                    : ""
                }
                onChange={handleChange}
                className="border border-gray-700 rounded-lg p-2 w-full bg-gray-800 text-gray-100"
              />
            </div>

            {/* Hiển thị giá */}
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="font-semibold">Giá gốc: {currencyVN(product.price)}</p>
              {discountMethod && (
                <p className="text-red-400 font-bold">
                  Giá sau giảm: {currencyVN(product.final_price || product.price)}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Rating + Reviews */}
        <div className="mt-6 p-4 bg-gray-800 rounded-xl shadow-inner">
          <h2 className="text-xl font-semibold text-purple-400">
            Thông tin đánh giá
          </h2>
          <p>
            Trung bình:{" "}
            <span className="text-yellow-400">{product.average_rating} ★</span>
          </p>
          <p>Tổng số review: {product.total_reviews}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">
            Danh sách Review
          </h2>
          {reviews.length === 0 && <p>Chưa có đánh giá nào</p>}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border p-4 rounded-lg mb-4 bg-gray-800"
            >
              <div className="flex justify-between items-center">
                <strong>{review.user_name}</strong>
                <ReactStars
                  count={5}
                  size={20}
                  value={parseFloat(review.rating)}
                  edit={false}
                  color2="#ffd700"
                />
              </div>
              {review.comment && <p className="mt-1">{review.comment}</p>}
              {review.image && (
                <img
                  src={review.image}
                  alt="review"
                  className="w-32 mt-2 rounded"
                />
              )}

              {replyEditId === review.id ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 border border-gray-700 rounded p-1 bg-gray-700 text-gray-100"
                    placeholder="Nhập phản hồi..."
                  />
                  <button
                    onClick={() => handleReplySave(review.id)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setReplyEditId(null)}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  {review.reply && (
                    <p className="text-green-400 italic">
                      Phản hồi: {review.reply}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setReplyEditId(review.id);
                      setReplyText(review.reply || "");
                    }}
                    className="mt-1 text-sm text-purple-400 hover:underline"
                  >
                    Trả lời
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SellerPage>
  );
}
