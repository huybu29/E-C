import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("keyword") || "";

  const { id } = useParams(); // Lấy category id từ URL nếu có

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, id]); // chạy lại khi searchTerm hoặc id thay đổi

  const fetchProducts = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (id) params.category = id;

      const res = await API.get("/product/", { params });
      setProducts(res.data);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    }
  };

  const viewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="max-w-[5000px] p-6 mx-[300px]">
      <h1 className="text-2xl font-bold mb-6">
        {searchTerm
          ? `Kết quả cho "${searchTerm}"`
          : id
          ? `Sản phẩm danh mục ${id}`
          : "Danh sách sản phẩm"}
      </h1>
      {products.length === 0 ? (
        <p>Không có sản phẩm nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => viewProduct(product.id)}
            >
              <img
                src={product.image || "https://via.placeholder.com/200"}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
              />
              <h2 className="mt-4 font-semibold text-lg">{product.name}</h2>
              <p className="text-gray-600">{product.price} VND</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  viewProduct(product.id);
                }}
                className="mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
