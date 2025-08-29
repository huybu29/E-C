// src/pages/admin/AdminProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminPage from "./AdminPage";

export default function AdminProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyEditId, setReplyEditId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [modal, setModal] = useState({ show: false, message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes, reviewRes] = await Promise.all([
          api.get(`/account/admin/products/${productId}/`),
          api.get("/category/categories/"),
          api.get(`/product/reviews/?product=${productId}`),
        ]);
        setProduct(productRes.data);
        setCategories(categoryRes.data);
        setReviews(reviewRes.data);
      } catch (err) {
        console.error(err);
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, navigate]);

  if (loading || !product) {
    return (
      <AdminPage>
        <p className="text-white text-center mt-10">Đang tải dữ liệu...</p>
      </AdminPage>
    );
  }

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : files
          ? files[0]
          : type === "number"
          ? Number(value)
          : value,
      ...(name === "image" && files ? { imageUrl: URL.createObjectURL(files[0]) } : {}),
    }));
  };

  const handleSave = async () => {
    try {
      const payload = new FormData();
      payload.append("name", product.name);
      payload.append("description", product.description);
      payload.append("price", product.price);
      payload.append("stock", product.stock);
      payload.append("status", product.status);
      payload.append("is_active", product.is_active);
      payload.append("category", product.category);
      if (product.image instanceof File) {
        payload.append("image", product.image);
      }

      await api.patch(`/account/admin/products/${productId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModal({ show: true, message: "✅ Lưu sản phẩm thành công!" });
      // reload
      const res = await api.get(`/account/admin/products/${productId}/`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
      setModal({ show: true, message: "❌ Lưu sản phẩm thất bại!" });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await api.delete(`/account/admin/products/${productId}/`);
      setModal({ show: true, message: "❌ Sản phẩm đã bị xóa!" });
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setModal({ show: true, message: "❌ Xóa sản phẩm thất bại!" });
    }
  };

  const handleReplySave = async (reviewId) => {
    try {
      await api.patch(`/product/reviews/${reviewId}/`, { reply: replyText });
      setReplyEditId(null);
      setReplyText("");
      const res = await api.get(`/product/reviews/?product=${productId}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      alert("Cập nhật phản hồi thất bại");
    }
  };

  return (
    <AdminPage>
      <div className="max-w-6xl mx-auto my-8 p-6 bg-[#2A083B] text-white rounded-2xl shadow-lg">
        {/* Modal */}
        {modal.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-[#3B0A4F] p-6 rounded-lg border border-[#4E1883] shadow-lg text-white">
              <p>{modal.message}</p>
              <button
                onClick={() => setModal({ show: false, message: "" })}
                className="mt-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 rounded bg-[#4E1883] hover:bg-[#6B21A8]"
        >
          ← Quay lại
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">
          Chi tiết sản phẩm
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hình ảnh */}
          <div className="flex justify-center items-center">
            {product.image && (
              <img
                src={product.imageUrl || product.image}
                alt={product.name}
                className="w-full max-w-md h-auto object-cover rounded-xl shadow-md"
              />
            )}
          </div>

          {/* Thông tin chỉnh sửa */}
          <div className="space-y-4">
            {[
              { label: "Tên sản phẩm", key: "name" },
              { label: "Mô tả", key: "description" },
              { label: "Giá", key: "price", type: "number" },
              { label: "Số lượng tồn", key: "stock", type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block font-semibold">{field.label}:</label>
                <input
                  type={field.type || "text"}
                  name={field.key}
                  value={product[field.key] ?? ""}
                  onChange={handleChange}
                  className="border border-gray-700 rounded-lg p-2 w-full bg-[#3B0A4F]"
                />
              </div>
            ))}

            <div>
              <label className="block font-semibold">Trạng thái:</label>
              <select
                name="status"
                value={product.status}
                onChange={handleChange}
                className="border border-gray-700 rounded-lg p-2 w-full bg-[#3B0A4F]"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">Hoạt động:</label>
              <input
                type="checkbox"
                name="is_active"
                checked={product.is_active || false}
                onChange={handleChange}
                className="mr-2"
              />
            </div>

            <div>
              <label className="block font-semibold">Danh mục:</label>
              <select
                name="category"
                value={product.category || ""}
                onChange={handleChange}
                className="border border-gray-700 rounded-lg p-2 w-full bg-[#3B0A4F]"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold">Ảnh sản phẩm:</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="border border-gray-700 rounded-lg p-2 w-full mt-1 bg-[#3B0A4F]"
              />
            </div>

            <div className="flex gap-4 mt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
              >
                💾 Lưu sản phẩm
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                ❌ Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>

        {/* Review */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Danh sách Review</h2>
          {reviews.length === 0 && <p>Chưa có đánh giá nào</p>}
          {reviews.map((review) => (
            <div key={review.id} className="border p-4 rounded-lg mb-4 bg-[#3B0A4F]">
              <div className="flex justify-between items-center">
                <strong>{review.user}</strong>
                <span>Rating: {review.rating} ★</span>
              </div>
              {review.comment && <p className="mt-1">{review.comment}</p>}
              {review.image && <img src={review.image} alt="review" className="w-32 mt-2 rounded" />}
              {replyEditId === review.id ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 border border-gray-700 rounded p-1 bg-[#2A083B]"
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
                  {review.reply && <p className="text-green-400 italic">Phản hồi: {review.reply}</p>}
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
    </AdminPage>
  );
}
