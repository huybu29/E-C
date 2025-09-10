import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function SideBar() {
  const { t } = useTranslation();
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

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className=" left-0 top-0 h-full w-72 
                 bg-gradient-to-b from-purple-700 via-[#52057B] to-[#000000] 
                 text-white shadow-2xl p-5 overflow-y-auto rounded-r-2xl"
    >
      <motion.h2
        className="text-2xl font-bold mb-5"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        {t("filters.title")}
      </motion.h2>

      {/* Categories */}
      <motion.div
        className="mb-6"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <h3 className="text-lg font-semibold mb-3">{t("filters.categories")}</h3>
        <ul className="space-y-2">
          {categories.length === 0 ? (
            <li className="text-gray-300">{t("filters.noCategories")}</li>
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
                  className="cursor-pointer hover:text-purple-300 transition-all duration-200"
                >
                  {cat.name}
                </label>
              </motion.li>
            ))
          )}
        </ul>
      </motion.div>

      {/* Price Range */}
      <motion.div
        className="mb-6"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <h3 className="text-lg font-semibold mb-3">{t("filters.priceRange")}</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder={t("filters.minPrice")}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 px-2 py-1 rounded bg-white/10 text-white 
                       focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
          <span>-</span>
          <input
            type="number"
            placeholder={t("filters.maxPrice")}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 px-2 py-1 rounded bg-white/10 text-white 
                       focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>
      </motion.div>

      {/* Rating */}
      <motion.div
        className="mb-6"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <h3 className="text-lg font-semibold mb-3">{t("filters.rating")}</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <motion.label
              key={star}
              whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
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
      </motion.div>

      {/* Buttons */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={applyFilter}
        className="bg-green-500 w-full hover:bg-gradient-to-r hover:from-green-400 hover:to-green-600 
                   text-white font-bold py-2 px-4 rounded-lg shadow-lg mt-3 transition-all"
      >
        {t("filters.apply")}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={clearFilter}
        className="bg-purple-500 w-full hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-700 
                   text-white font-bold py-2 px-4 rounded-lg shadow-lg mt-3 transition-all"
      >
        {t("filters.clear")}
      </motion.button>
    </motion.aside>
  );
}
