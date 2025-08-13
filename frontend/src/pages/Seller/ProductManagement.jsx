import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api"; // axios instance đã cấu hình
import SellerPage from "./SellerPage"; // Layout có sidebar

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Lấy danh sách sản phẩm của seller hiện tại
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/product/seller/"); // đúng endpoint backend
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await API.delete(`/product/${id}/`);
        fetchProducts();
      } catch (err) {
        console.error("Lỗi xóa sản phẩm:", err);
      }
    }
  };

  // Lọc theo tên sản phẩm
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SellerPage>
      <div className="p-6 bg-white rounded-lg shadow flex-1">
        {/* Tiêu đề */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <button
            onClick={() => navigate("/seller/products/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Thêm sản phẩm
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        {/* Bảng sản phẩm */}
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Ảnh</th>
                <th className="border p-2">Tên</th>
                <th className="border p-2">Giá</th>
                <th className="border p-2">Số lượng</th>
                <th className="border p-2">Trạng thái</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="border p-2 text-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover mx-auto"
                    />
                  </td>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.price} ₫</td>
                  <td className="border p-2">{product.stock}</td>
                  <td className="border p-2">
                    {product.stock > 0 ? (
                      <span className="text-green-600 font-semibold">
                        Còn hàng
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Hết hàng
                      </span>
                    )}
                  </td>
                  <td className="border p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-400"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SellerPage>
  );
}
