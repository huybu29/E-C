import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import SellerPage from "./SellerPage";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/product/seller/");
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SellerPage>
      <div className="p-6 bg-white rounded-2xl shadow-lg flex-1 ">
        {/* Tiêu đề và nút thêm */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Quản lý sản phẩm</h1>
          <button
            onClick={() => navigate("/seller/products/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
          className="-2 -blue-500 p-2 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-500"
        />

        {/* Bảng sản phẩm */}
        {loading ? (
          <p className="text-center  text-blue-700">Đang tải sản phẩm...</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full    overflow-hidden">
              <thead className="bg-blue-100  text-blue-700">
                <tr >
                  <th className=" p-2">Ảnh</th>
                  <th className=" p-2">Tên</th>
                  <th className=" p-2">Giá</th>
                  <th className=" p-2">Số lượng</th>
                  <th className=" p-2">Trạng thái</th>
                  <th className=" p-2">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-blue-800">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50 transition">
                    <td className=" p-2 text-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover mx-auto rounded"
                      />
                    </td>
                    <td className=" p-2">{product.name}</td>
                    <td className=" p-2">{product.price.toLocaleString()} ₫</td>
                    <td className=" p-2">{product.stock}</td>
                    <td className=" p-2">
                      {product.stock > 0 ? (
                        <span className="text-green-600 font-semibold">Còn hàng</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Hết hàng</span>
                      )}
                    </td>
                    <td className=" p-2 flex gap-2 justify-center items-center">
                      <button
                        onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-blue-500">
                      Không tìm thấy sản phẩm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SellerPage>
  );
}
