// src/pages/admin/ProductManagement.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminPage from "./AdminPage";

export default function ProductManagement() {
  const [allProducts, setAllProducts] = useState([]); // Lưu tất cả sản phẩm
  const [products, setProducts] = useState([]); // Sản phẩm hiển thị
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const currencyVN = (v) => Number(v || 0).toLocaleString("vi-VN") + " VND";
  // Fetch toàn bộ sản phẩm 1 lần
  const fetchProducts = () => {
    api
      .get("/account/admin/products/")
      .then((res) => {
        setAllProducts(res.data);
        setProducts(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Lọc sản phẩm theo search và statusFilter
  useEffect(() => {
    let filtered = allProducts;

    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setProducts(filtered);
  }, [search, statusFilter, allProducts]);

  const handleRowClick = (id) => {
    navigate(`/admin/products/${id}`);
  };

  return (
    <AdminPage>
      <div>
        <h1 className="text-2xl font-bold mb-6 text-[#FF7ED4]">
          Product Management
        </h1>

        {/* Search & Filter */}
        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded bg-[#3B0A4F] text-white border border-[#4E1883] flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded bg-[#3B0A4F] text-white border border-[#4E1883]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Product Table */}
        <div className="bg-[#2A083B] rounded-lg shadow-xl p-4 border border-[#4E1883] overflow-x-auto">
          <table className="w-full text-left border-collapse text-white">
            <thead>
              <tr className="bg-[#3B0A4F] text-white">
                <th className="p-3 border border-[#4E1883]">ID</th>
                <th className="p-3 border border-[#4E1883]">Image</th>
                <th className="p-3 border border-[#4E1883]">Name</th>
                <th className="p-3 border border-[#4E1883]">Price</th>
                <th className="p-3 border border-[#4E1883]">Stock</th>
                <th className="p-3 border border-[#4E1883]">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handleRowClick(p.id)}
                  className="hover:bg-[#4E1883] transition cursor-pointer"
                >
                  <td className="p-3 border border-[#4E1883] font-semibold">{p.id}</td>
                  <td className="p-3 border border-[#4E1883]">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="p-3 border border-[#4E1883]">{p.name}</td>
                  <td className="p-3 border border-[#4E1883]">{currencyVN(p.price)}</td>
                  <td className="p-3 border border-[#4E1883]">{p.stock}</td>
                  <td className="p-3 border border-[#4E1883]">
                    <span
                      className={`px-2 py-1 rounded font-bold ${
                        p.status === "approved"
                          ? "bg-green-500 text-white"
                          : p.status === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-black"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-400">
                    Không có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
