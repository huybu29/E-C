import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api"; // Axios instance đã cấu hình baseURL + token

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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, image: files[0] });
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
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      await API.post("/product/seller/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Thêm sản phẩm thành công!");
      navigate("/seller/products");
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);
      alert("Không thể thêm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Thêm sản phẩm mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            className="border p-2 rounded w-full"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Mô tả</label>
          <textarea
            name="description"
            className="border p-2 rounded w-full"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div>
          <label className="block font-semibold mb-1">Danh mục</label>
          <input
            type="text"
            name="category"
            className="border p-2 rounded w-full"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Giá</label>
            <input
              type="number"
              name="price"
              className="border p-2 rounded w-full"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Số lượng</label>
            <input
              type="number"
              name="stock"
              className="border p-2 rounded w-full"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Hình ảnh</label>
          <input type="file" name="image" onChange={handleChange} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <label className="font-semibold">Kích hoạt sản phẩm</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
