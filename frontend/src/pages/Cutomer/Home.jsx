import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from "framer-motion";
import API from "../../services/api";
import HorizontalFilter from "../../components/HorizontalFilter";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Tooltip } from "react-tooltip"; // Nếu bạn dùng package tooltip

// ===== Helper =====
const currencyVN = (v) => Number(v || 0).toLocaleString("vi-VN") + " VND";

// ===== Skeleton Card =====
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

// ===== Product Card =====
function ProductCard({ product, onClick, index, t }) {
  const isDiscounted = product.final_price && product.final_price < product.price;
  const discountPercent = product.discount_percent;
  const now = new Date();
  const isDiscountActive =
    product.discount_price &&
    product.discount_start &&
    product.discount_end &&
    new Date(product.discount_start) <= now &&
    new Date(product.discount_end) >= now;

  const controls = useAnimation();

  const handleAddToCart = () => {
    // Shake effect nếu thêm thất bại
    controls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    });
    onClick();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ scale: 1.03, rotate: 0.2, boxShadow: "0px 15px 25px rgba(0,0,0,0.3)" }}
      className="bg-gradient-to-br from-[#BC6FF1] via-[#52057B] to-[#000000] rounded-2xl p-[2px] cursor-pointer flex flex-col"
    >
      <motion.div
        className="bg-purple-200 rounded-2xl p-4 flex flex-col h-full"
        animate={controls}
      >
        <motion.div className="relative overflow-hidden rounded-xl mb-4" whileHover={{ scale: 1.02 }}>
          <img
            src={product.image || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={product.name}
            className="w-full h-48 object-cover rounded-xl"
            loading="lazy"
          />
          {isDiscounted && (
            <motion.span
              className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              -{discountPercent ? discountPercent + "%" : "SALE"}
            </motion.span>
          )}
          <motion.div
            className="absolute bottom-2 right-2 flex gap-2"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.div whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <Heart className="w-5 h-5 text-pink-500 cursor-pointer" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.3 }} transition={{ duration: 0.3 }}>
              <ShoppingCart className="w-5 h-5 text-green-500 cursor-pointer" onClick={handleAddToCart} />
            </motion.div>
          </motion.div>
        </motion.div>

        <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-1 line-clamp-2 flex-1">
          {product.name}
        </h2>

        <p className="text-sm text-gray-500 mb-2">{product.shop_name || t("shopUnknown")}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            {isDiscounted ? (
              <>
                <p className="text-red-600 font-bold text-lg">{currencyVN(product.final_price)}</p>
                <p className="text-gray-500 line-through text-sm">{currencyVN(product.price)}</p>
              </>
            ) : (
              <p className="text-[#52057B] font-bold text-lg">{currencyVN(product.price)}</p>
            )}
          </div>

          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <motion.div whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <Star className="w-4 h-4 text-yellow-400" />
            </motion.div>
            <span>{product.average_rating || "0.0"}</span>
          </div>
        </div>

        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="mt-auto bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white py-2 rounded-xl hover:from-[#52057B] hover:to-[#000000] font-medium flex items-center justify-center gap-2"
        >
          {t("viewDetails")}
          <ShoppingCart className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ===== HomePage =====
export default function HomePage() {
  const { t } = useTranslation();
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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // ===== Scroll parallax =====
  const scrollY = useMotionValue(0);
  const parallax = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const handleScroll = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ===== Fetch data =====
  useEffect(() => {
    fetchProducts();
    if (id) fetchCategoryName(id);
  }, [keyword, categories, minPrice, maxPrice, rating, sort, id, page]);

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
        page,
        page_size: pageSize,
      };
      const res = await API.get("/product/", { params });
      const approvedProducts = (res.data?.results || []).filter((p) => p.status === "approved");
      setProducts(approvedProducts);
      setTotalPages(Math.ceil((res.data.count || approvedProducts.length) / pageSize));
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryName = async (categoryId) => {
    try {
      const res = await API.get(`/category/categories/${categoryId}/`);
      setCategoryName(res.data?.name || "");
    } catch {
      setCategoryName("");
    }
  };

  const viewProduct = (pid) => navigate(`/product/${pid}`);

  const titleText = useMemo(() => {
    if (keyword) return `${t("noProducts")} “${keyword}”`;
    if (id) return `Sản phẩm danh mục: ${categoryName || "..."}`;
    return "";
  }, [keyword, id, categoryName, t]);

  return (
    <div className="flex flex-col max-w-7xl py-10 mx-auto mt-[80px] px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}


      {/* Filter / Sort */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-4"
      >
        <HorizontalFilter currentSort={sort} />
      </motion.div>

      {/* Products */}
      <div className="min-h-[40vh]">
        {loading && (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        )}

        {!loading && products.length === 0 && (
          <AnimatePresence>
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <h3 className="text-xl font-semibold text-gray-800">{t("noProducts")}</h3>
            </motion.div>
          </AnimatePresence>
        )}

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
                <ProductCard key={p.id} product={p} index={idx} onClick={() => viewProduct(p.id)} t={t} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <motion.button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-purple-200 rounded disabled:opacity-50"
            >
              {t("prevPage")}
            </motion.button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <motion.button
                key={p}
                onClick={() => setPage(p)}
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 rounded ${page === p ? "bg-purple-600 text-white" : "bg-purple-100"}`}
              >
                {p}
              </motion.button>
            ))}
            <motion.button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-purple-200 rounded disabled:opacity-50"
            >
              {t("nextPage")}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
