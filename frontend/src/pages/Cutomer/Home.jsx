import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import API from "../../services/api";
import HorizontalFilter from "../../components/HorizontalFilter";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams();

  const keyword = searchParams.get("keyword") || "";
  const categories = searchParams.get("categories") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const rating = searchParams.get("rating") || "";
  const sort = searchParams.get("sort") || "-created_at";

  useEffect(() => {
    fetchProducts();
    if (id) fetchCategoryName(id);
  }, [keyword, categories, minPrice, maxPrice, rating, sort, id]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: keyword || undefined,
        categories: categories || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        rating: rating || undefined,
        ordering: sort,
      };

      const res = await API.get("/product/", { params });
      setProducts(res.data.results || res.data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryName = async (categoryId) => {
    try {
      const res = await API.get(`/category/categories/${categoryId}/`);
      setCategoryName(res.data.name);
    } catch (err) {
      console.error("Lỗi tải tên danh mục:", err);
      setCategoryName("");
    }
  };

  const viewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  if (loading) return <p className="text-center mt-10 text-blue-700">Đang tải...</p>;

  return (
    <div className="flex flex-col max-w-7xl mx-auto p-6">
      {/* Filter ngang */}
      <HorizontalFilter currentSort={sort} />

      {/* Tiêu đề */}
      <h1 className="text-2xl font-extrabold mb-6 mt-2 text-blue-700">
        {keyword
          ? `Kết quả cho "${keyword}"`
          : id
          ? `Sản phẩm danh mục: ${categoryName || "Đang tải..."}`
          : "Tất cả sản phẩm"}
      </h1>

      {/* Danh sách sản phẩm */}
      {products.length === 0 ? (
        <p className="text-gray-500 text-lg">Không có sản phẩm nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gradient-to-br from-[#BC6FF1] via-[#52057B] to-[#000000] rounded-2xl p-[2px] shadow-md hover:shadow-xl transition cursor-pointer flex flex-col"
              onClick={() => viewProduct(product.id)}
            >
              <div className="bg-purple-200 rounded-2xl p-4 flex flex-col h-full">
                <img
                  src={product.image || "https://via.placeholder.com/200"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex-1">
                  {product.name}
                </h2>
                <p className="text-[#52057B] font-bold text-lg mb-4">
                  {Number(product.price).toLocaleString("vi-VN")} VND
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    viewProduct(product.id);
                  }}
                  className="mt-auto bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white py-2 rounded-xl hover:from-[#52057B] hover:to-[#000000] transition font-medium"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
