import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import API from "../../services/api";
import SellerPage from "./SellerPage";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [ordering, setOrdering] = useState("-updated_at");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => { fetchProducts(); }, [search, category, status, ordering]);
  useEffect(() => { fetchCategories(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (status) params.append("status", status.toLowerCase());
      if (ordering) params.append("ordering", ordering);

      const res = await API.get(`/product/seller/?${params.toString()}`);
      setProducts(res.data);
    } catch (err) { console.error("Lỗi tải sản phẩm:", err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category/categories");
      setCategories(res.data);
    } catch (err) { console.error("Lỗi tải danh mục:", err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try { await API.delete(`/product/${id}/`); fetchProducts(); }
      catch (err) { console.error("Lỗi xóa sản phẩm:", err); }
    }
  };

  return (
    <SellerPage>
      <div className="p-6 bg-gray-900 rounded-2xl shadow-lg text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">📦 Quản lý sản phẩm</h1>
          <button
            onClick={() => navigate("/seller/products/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Thêm sản phẩm
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="p-2 border border-gray-700 rounded bg-gray-800 text-gray-100 flex-1 min-w-[200px]"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border border-gray-700 rounded bg-gray-800 text-gray-100">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border border-gray-700 rounded bg-gray-800 text-gray-100">
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="p-2 border border-gray-700 rounded bg-gray-800 text-gray-100">
            <option value="-updated_at">Mới nhất</option>
            <option value="updated_at">Cũ nhất</option>
            <option value="price">Giá thấp → cao</option>
            <option value="-price">Giá cao → thấp</option>
            <option value="-average_rating">Rating cao</option>
            <option value="average_rating">Rating thấp</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow border border-gray-700">
          <table className="w-full text-left border-collapse text-gray-100">
            <thead className="bg-gray-800 text-white uppercase text-sm">
              <tr>
                <th className="p-3 rounded-tl-lg">Ảnh</th>
                <th className="p-3">Tên sản phẩm</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Kho</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Rating</th>
                <th className="p-3 rounded-tr-lg">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-400">Đang tải sản phẩm...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">Không có sản phẩm nào</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700 transition border-b">
                    <td className="p-2 text-center">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mx-auto rounded" />
                    </td>
                    <td className="p-2 font-medium">{product.name}</td>
                    <td className="p-2 text-yellow-400 font-semibold">{Number(product.price).toLocaleString()} ₫</td>
                    <td className="p-2">{product.stock}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === "approved" ? "bg-green-700 text-white" :
                        product.status === "pending" ? "bg-yellow-600 text-gray-900" :
                        "bg-red-700 text-white"
                      }`}>{product.status}</span>
                    </td>
                    <td className="p-2 text-yellow-400 font-semibold">{product.average_rating} ⭐</td>
                    <td className="p-2 flex gap-2 justify-center">
                      <button
                        onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition"
                      >
                        <Edit size={16} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 size={16} /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SellerPage>
  );
}
