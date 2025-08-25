import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    image: null,
    imageUrl: "",
  });
  const [reviews, setReviews] = useState([]);
  const [reply, setReply] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/product/${id}/`);
      setProduct({
        name: res.data.name,
        price: res.data.price,
        stock: res.data.stock,
        description: res.data.description || "",
        image: null,
        imageUrl: res.data.image,
      });
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/product/reviews/?product=${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    }
  };

  const handleReplyChange = (reviewId, value) => {
    setReply((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleReplySubmit = async (reviewId) => {
    try {
      await API.post(`/product/reviews/${reviewId}/reply/`, {
        reply: reply[reviewId],
      });
      alert("Đã trả lời phản hồi!");
      fetchReviews();
      setReply((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      console.error("Lỗi gửi phản hồi:", err);
      alert("Không thể gửi phản hồi");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProduct((prev) => ({
      ...prev,
      image: file,
      imageUrl: file ? URL.createObjectURL(file) : prev.imageUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("description", product.description);
    if (product.image) formData.append("image", product.image);

    try {
      await API.put(`/product/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Cập nhật sản phẩm thành công!");
      navigate("/seller/products");
    } catch (err) {
      console.error("Lỗi cập nhật sản phẩm:", err);
      alert("Cập nhật thất bại");
    }
  };

  if (loading) return <p className="text-center mt-10 text-blue-700">Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        ✏️ Chỉnh sửa sản phẩm & Quản lý đánh giá
      </h1>

      {/* Form chỉnh sửa sản phẩm */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Cột trái */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-blue-700">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="border border-blue-200 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-blue-700">Giá (VND)</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="border border-blue-200 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-blue-700">Số lượng tồn</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="border border-blue-200 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-blue-700">Mô tả</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              rows="5"
              className="border border-blue-200 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-300"
            ></textarea>
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-blue-700">Ảnh sản phẩm</label>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border border-blue-200 mb-2 shadow"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border border-blue-200 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Nút submit */}
        <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>

      {/* Danh sách đánh giá */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">⭐ Đánh giá của khách hàng</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">Chưa có đánh giá nào.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border p-4 rounded-lg shadow-sm">
                <p className="font-semibold text-gray-800">
                  {r.user_name} - <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                </p>
                <p className="text-gray-700 mt-1">{r.comment}</p>

                {/* Hiển thị phản hồi của seller */}
                {r.reply && (
                  <p className="mt-2 text-sm text-blue-600">
                    💬 Phản hồi của bạn: {r.reply}
                  </p>
                )}

                {/* Form trả lời */}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Viết phản hồi..."
                    value={reply[r.id] || ""}
                    onChange={(e) => handleReplyChange(r.id, e.target.value)}
                    className="flex-1 border rounded-lg p-2 text-sm"
                  />
                  <button
                    onClick={() => handleReplySubmit(r.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
