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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/product/${id}/`);
        setProduct({
          name: res.data.name,
          price: res.data.price,
          stock: res.data.stock,
          description: res.data.description || "",
          image: null,
          imageUrl: res.data.image, // ảnh cũ
        });
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (product.image) {
      formData.append("image", product.image);
    }

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

  if (loading) return <p className="text-center mt-10">Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">
        ✏️ Chỉnh sửa sản phẩm
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Giá (VND)</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Số lượng tồn</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              rows="5"
              className="border rounded p-2 w-full"
            ></textarea>
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Ảnh sản phẩm</label>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded border mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>

        {/* Nút submit */}
        <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
