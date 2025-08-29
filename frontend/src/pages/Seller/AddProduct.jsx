// src/pages/seller/AddProduct.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import SellerPage from "./SellerPage";

export default function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: null,
    is_active: true,
  });

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách category từ API
  useEffect(() => {
    API.get("/category/categories").then((res) => setCategories(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("category", formData.category); // id category
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("is_active", formData.is_active ? "true" : "false");
      if (formData.image) data.append("image", formData.image);

      await API.post("/product/seller/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Thêm sản phẩm thành công!");
      navigate("/seller/products");
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);
      alert("Không thể thêm sản phẩm. Kiểm tra lại dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerPage>
      <div className="p-6 max-w-3xl mx-auto bg-gray-800 text-gray-100 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-purple-400 text-center">
          Thêm sản phẩm mới
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên sản phẩm */}
          <div>
            <label className="block font-semibold mb-1">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-600 p-2 rounded w-full bg-gray-900 text-white focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block font-semibold mb-1">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border border-gray-600 p-2 rounded w-full bg-gray-900 text-white focus:ring-2 focus:ring-purple-400"
            ></textarea>
          </div>

          {/* Danh mục */}
          <div>
            <label className="block font-semibold mb-1">Danh mục</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border border-gray-600 p-2 rounded w-full bg-gray-900 text-white focus:ring-2 focus:ring-purple-400"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Giá và số lượng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Giá</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="border border-gray-600 p-2 rounded w-full bg-gray-900 text-white focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Số lượng</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="border border-gray-600 p-2 rounded w-full bg-gray-900 text-white focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
          </div>

          {/* Hình ảnh */}
          <div>
            <label className="block font-semibold mb-1">Hình ảnh</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="text-gray-100"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-600"
              />
            )}
          </div>

          {/* Kích hoạt sản phẩm */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <label className="font-semibold">Kích hoạt sản phẩm</label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex-1"
            >
              {loading ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 flex-1"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </SellerPage>
  );
}
