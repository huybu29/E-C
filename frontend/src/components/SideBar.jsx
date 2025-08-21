import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SideBar() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState(null);

  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const keyword = params.get("keyword") || "";
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category/categories/");
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    }
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

   const applyFilter = () => {
    const query = new URLSearchParams();

    if (keyword) query.set("keyword", keyword);
    if (selectedCategories.length > 0)
      query.set("categories", selectedCategories.join(","));
    if (minPrice) query.set("minPrice", minPrice);
    if (maxPrice) query.set("maxPrice", maxPrice);
    if (rating) query.set("rating", rating);

    navigate(`/search?${query.toString()}`);
  };
  const clearFilter = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setRating(null);
    navigate("/");
  };

  return (
    <div className="flex">
    <aside
      className="  mt-20 left-0 h-screen w-72 
                 bg-gradient-to-b from-purple-700 via-[#52057B] to-[#000000] 
                 text-white shadow-lg p-5 overflow-y-auto"
    >
      <h2 className="text-2xl font-bold mb-5">Bộ lọc</h2>

      {/* Danh mục */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Danh mục</h3>
        <ul className="space-y-2">
          {categories.length === 0 ? (
            <li className="text-gray-300">Không có danh mục.</li>
          ) : (
            categories.map((cat) => (
              <li key={cat.id} className="flex items-center space-x-2 text-lg">
                <input
                  type="checkbox"
                  id={`cat-${cat.id}`}
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="accent-purple-500"
                />
                <label htmlFor={`cat-${cat.id}`} className="cursor-pointer">
                  {cat.name}
                </label>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Phân khúc giá */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Khoảng giá (VNĐ)</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 px-2 py-1 rounded bg-white/10 text-white 
                       focus:outline-none focus:ring focus:ring-purple-400"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Tối đa"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 px-2 py-1 rounded bg-white/10 text-white 
                       focus:outline-none focus:ring focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Đánh giá */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Đánh giá</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                className="accent-yellow-400"
              />
              <span>{"⭐".repeat(star)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <button
        onClick={applyFilter}
        className="bg-green-500 w-full hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-3"
      >
        Áp dụng bộ lọc
      </button>
      <button
        onClick={clearFilter}
        className="bg-purple-500 w-full hover:bg-purple-600 text-white font-bold py-2 px-4 rounded mt-3"
      >
        Xóa bộ lọc
      </button>
    </aside>
    </div>
  );
}
