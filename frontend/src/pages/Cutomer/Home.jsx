// src/pages/HomePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import HorizontalFilter from "../../components/HorizontalFilter";

// ====== Small helpers ======
const currencyVN = (v) => Number(v || 0).toLocaleString("vi-VN") + " VND";

// Inline Star rating (không cần lib ngoài)


// Skeleton card cho trạng thái loading
function SkeletonCard() {
  return (
    <div className="rounded-2xl p-[2px] bg-gradient-to-br from-[#BC6FF1] via-[#52057B] to-black">
      <div className="bg-purple-200 rounded-2xl p-4 h-full">
        <div className="w-full h-48 rounded-xl mb-4 bg-purple-300 animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-purple-300 animate-pulse mb-3" />
        <div className="h-5 w-1/3 rounded bg-purple-300 animate-pulse mb-6" />
        <div className="h-10 w-full rounded bg-purple-300 animate-pulse" />
      </div>
    </div>
  );
}

// Card sản phẩm có animation
function ProductCard({ product, onClick, index }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ scale: 1.03, rotate: 0.2 }}
      className="bg-gradient-to-br from-[#BC6FF1] via-[#52057B] to-[#000000] rounded-2xl p-[2px] shadow-md hover:shadow-2xl cursor-pointer flex flex-col"
    >
      <div className="bg-purple-200 rounded-2xl p-4 flex flex-col h-full">
        <motion.div className="relative overflow-hidden rounded-xl mb-4" whileHover={{ scale: 1.01 }}>
          <img
            src={product.image || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={product.name}
            className="w-full h-48 object-cover rounded-xl"
            loading="lazy"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/10"
          />
        </motion.div>

        <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-1 line-clamp-2 flex-1">
          {product.name}
        </h2>

        {/* Tên shop */}
        <p className="text-sm text-gray-500 mb-2">{product.shop_name || "Shop không xác định"}</p>

        <div className="flex items-center justify-between mb-4">
          <p className="text-[#52057B] font-bold text-lg">{currencyVN(product.price)}</p>
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <span className="text-yellow-400">⭐</span>
            <span>{product.average_rating || "0.0"}</span>
          </div>
        </div>

        <motion.button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="mt-auto bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white py-2 rounded-xl hover:from-[#52057B] hover:to-[#000000] font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Xem chi tiết
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const keyword = searchParams.get("keyword") || "";
  const categories = searchParams.get("categories") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const rating = searchParams.get("rating") || "";
  const sort = searchParams.get("sort") || "-created_at";

  useEffect(() => {
    fetchProducts();
    if (id) fetchCategoryName(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Lọc chỉ những sản phẩm approved
    const approvedProducts = (res.data?.results || res.data || []).filter(
      (p) => p.status === "approved"
    );
    setProducts(approvedProducts);
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
      setCategoryName(res.data?.name || "");
    } catch (err) {
      console.error("Lỗi tải tên danh mục:", err);
      setCategoryName("");
    }
  };

  const viewProduct = (pid) => navigate(`/product/${pid}`);

  const titleText = useMemo(() => {
    if (keyword) return `Kết quả cho “${keyword}”`;
    if (id) return `Sản phẩm danh mục: ${categoryName || "Đang tải..."}`;
    return "";
  }, [keyword, id, categoryName]);

  return (
    <div className="flex flex-col max-w-7xl py-10 mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero/Title với parallax nhẹ */}
      <motion.div
        className="mt-[72px] mb-6 rounded-3xl relative overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-10 bg-gradient-to-r from-[#BC6FF1]/20 via-[#52057B]/10 to-transparent" />
        <motion.h1
          className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {titleText}
        </motion.h1>
        <motion.p
          className="text-gray-600 mt-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
         
        </motion.p>
      </motion.div>

      {/* Filter ngang chỉ hiện ở trang /search */}
       (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-4"
        >
          <HorizontalFilter currentSort={sort} />
        </motion.div>
      )

      {/* Content */}
      <div className="min-h-[40vh]">
        {/* Loading skeleton */}
        {loading && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.07 } },
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                <SkeletonCard />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <AnimatePresence>
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <svg width="120" height="120" viewBox="0 0 200 200" className="mb-4">
                <circle cx="100" cy="100" r="80" fill="#E9D5FF" />
                <rect x="60" y="70" width="80" height="60" rx="12" fill="#A78BFA" />
                <circle cx="85" cy="100" r="8" fill="white" />
                <circle cx="115" cy="100" r="8" fill="white" />
                <rect x="85" y="120" width="30" height="6" rx="3" fill="#FFF" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800">Không có sản phẩm phù hợp</h3>
              <p className="text-gray-600 mt-2">
                Thử điều chỉnh bộ lọc, từ khóa hoặc sắp xếp khác nhé.
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Grid sản phẩm */}
        {!loading && products.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
          >
            <AnimatePresence>
              {products.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} onClick={() => viewProduct(p.id)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* CTA strip dưới cùng */}
      <motion.div
        className="mt-10 mb-16 relative overflow-hidden rounded-2xl"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <div className="bg-gradient-to-r from-[#52057B] via-[#BC6FF1] to-[#52057B] p-[1px] rounded-2xl">
          <div className="bg-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-[#52057B]">Gợi ý hôm nay</h4>
              <p className="text-gray-600">Lọc theo giá, đánh giá, và danh mục để tìm nhanh hơn.</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => {
                const params = new URLSearchParams(location.search);
                if (!params.get("sort")) params.set("sort", "-created_at");
                navigate(`/search?${params.toString()}`);
              }}
              className="bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white px-5 py-2 rounded-xl font-medium"
            >
              Mở bộ lọc
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
