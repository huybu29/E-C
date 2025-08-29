
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function SideBar() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

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
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-20  left-0 h-full w-72 
                 bg-gradient-to-b from-purple-700 via-[#52057B] to-[#000000] 
                 text-white shadow-2xl p-5 overflow-y-auto rounded-r-2xl"
    >
      <h2 className="text-2xl font-bold mb-5">🎯 Bộ lọc</h2>

      {/* Danh mục */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">📂 Danh mục</h3>
        <ul className="space-y-2">
          {categories.length === 0 ? (
            <li className="text-gray-300">Không có danh mục.</li>
          ) : (
            categories.map((cat, i) => (
              <motion.li
                key={cat.id}
                className="flex items-center space-x-2 text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <input
                  type="checkbox"
                  id={`cat-${cat.id}`}
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="accent-purple-500 scale-110 transition-transform duration-200 hover:scale-125"
                />
                <label
                  htmlFor={`cat-${cat.id}`}
                  className="cursor-pointer hover:text-purple-300 transition"
                >
                  {cat.name}
                </label>
              </motion.li>
            ))
          )}
        </ul>
      </div>

      {/* Khoảng giá */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">💰 Khoảng giá (VNĐ)</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 px-2 py-1 rounded bg-white/10 text-white 
                       focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Tối đa"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 px-2 py-1 rounded bg-white/10 text-white 
                       focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
        </div>
      </div>

      {/* Đánh giá */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">⭐ Đánh giá</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <motion.label
              key={star}
              whileHover={{ scale: 1.05 }}
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
              <span className="text-yellow-400 drop-shadow">
                {"⭐".repeat(star)}
              </span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={applyFilter}
        className="bg-green-500 w-full hover:bg-gradient-to-r hover:from-green-400 hover:to-green-600 
                   text-white font-bold py-2 px-4 rounded-lg shadow-lg mt-3 transition"
      >
        Áp dụng bộ lọc
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={clearFilter}
        className="bg-purple-500 w-full hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-700 
                   text-white font-bold py-2 px-4 rounded-lg shadow-lg mt-3 transition"
      >
        Xóa bộ lọc
      </motion.button>
    </motion.aside>
  );
}
