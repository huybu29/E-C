import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

import { ShoppingCart, Star, Heart, CheckCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import API from "../../services/api";
import HorizontalFilter from "../../components/HorizontalFilter";

// ===== Helper =====
const currencyVN = (v) => Number(v || 0).toLocaleString("vi-VN") + " VND";

// ===== Skeleton Card =====
function SkeletonCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl p-[3px] bg-gradient-to-br from-[#BC6FF1] via-[#52057B] to-black"
    >
      <div className="bg-purple-200 rounded-[22px] p-5 h-full">
        <div className="w-full h-48 rounded-xl mb-4 bg-purple-300 animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-purple-300 animate-pulse mb-3" />
        <div className="h-5 w-1/3 rounded bg-purple-300 animate-pulse mb-6" />
        <div className="h-10 w-full rounded bg-purple-300 animate-pulse" />
      </div>
    </motion.div>
  );
}

// ===== Product Card =====
function ProductCard({ product, onClick, index, t }) {
  const isDiscounted = product.final_price && product.final_price < product.price;
  const discountPercent = product.discount_percent;
  const controls = useAnimation();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setAddedToCart(true);
    controls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, type: "spring" }
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.9 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05, rotate: 0.5, boxShadow: "0px 18px 30px rgba(0,0,0,0.4)" }}
      className="bg-gradient-to-br from-[#BC6FF1] via-[#52057B] to-[#000000] rounded-3xl p-[3px] cursor-pointer flex flex-col transform transition-all duration-300 ease-out"
      onClick={onClick}
    >
      <motion.div className="bg-purple-200 rounded-[22px] p-5 flex flex-col h-full" animate={controls}>
        <div className="relative overflow-hidden rounded-xl mb-4">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-48 bg-purple-400 rounded-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
          <AnimatePresence>
            {isDiscounted && (
              <motion.span
                className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                -{discountPercent ? discountPercent + "%" : "SALE"}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.div className="absolute bottom-2 right-2 flex gap-2" initial={{ opacity: 0, y: 10 }} whileHover={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <motion.div whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <Heart className="w-6 h-6 text-pink-500 cursor-pointer" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.3 }} transition={{ duration: 0.3 }} onClick={handleAddToCart}>
              <ShoppingCart className="w-6 h-6 text-green-500 cursor-pointer" />
            </motion.div>
          </motion.div>
        </div>

        <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-1 line-clamp-2 flex-1">{product.name}</h2>
        <p className="text-sm text-gray-500 mb-2">{product.shop_name || t("shopUnknown")}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              {isDiscounted ? (
                <motion.div key="discounted" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                  <p className="text-red-600 font-bold text-lg">{currencyVN(product.final_price)}</p>
                  <p className="text-gray-500 line-through text-sm">{currencyVN(product.price)}</p>
                </motion.div>
              ) : (
                <motion.div key="normal" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                  <p className="text-[#52057B] font-bold text-lg">{currencyVN(product.price)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <motion.div whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <Star className="w-4 h-4 text-yellow-400" />
            </motion.div>
            <span>{product.average_rating || "0.0"}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.button
            key={addedToCart ? "added" : "view"}
            onClick={onClick}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-auto bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white py-2 rounded-xl hover:from-[#52057B] hover:to-[#000000] font-medium flex items-center justify-center gap-2"
          >
            {addedToCart ? (
              <>
                <CheckCircle className="w-5 h-5 text-white" />
                Đã thêm
              </>
            ) : (
              <>
                {t("viewDetails")}
                <ShoppingCart className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ===== HomePage =====
export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isIntroView, setIsIntroView] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [searchParams] = useSearchParams();
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

  const mockProducts = useMemo(() => [
    { id: 1, name: "Sản phẩm A", price: 500000, shop_name: "Shop 1", average_rating: 4.5, image: "https://images.unsplash.com/photo-1542840939-550978939b4b?q=80&w=2940&auto=format&fit=crop" },
    { id: 2, name: "Sản phẩm B", price: 300000, final_price: 250000, discount_percent: 16, shop_name: "Shop 2", average_rating: 4.8, image: "https://images.unsplash.com/photo-1542840939-550978939b4b?q=80&w=2940&auto=format&fit=crop" },
    { id: 3, name: "Sản phẩm C", price: 800000, shop_name: "Shop 3", average_rating: 4.2, image: "https://images.unsplash.com/photo-1542840939-550978939b4b?q=80&w=2940&auto=format&fit=crop" },
    { id: 4, name: "Sản phẩm D", price: 650000, final_price: 600000, discount_percent: 7, shop_name: "Shop 4", average_rating: 4.1, image: "https://images.unsplash.com/photo-1542840939-550978939b4b?q=80&w=2940&auto=format&fit=crop" },
    { id: 5, name: "Sản phẩm E", price: 420000, shop_name: "Shop 5", average_rating: 4.7, image: "https://images.unsplash.com/photo-1542840939-550978939b4b?q=80&w=2940&auto=format&fit=crop" },
  ], []);

  const [activeProduct, setActiveProduct] = useState(mockProducts[0]);

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
      setTotalPages(Math.ceil((res.data?.count || approvedProducts.length) / pageSize));
    } catch (err) {
      console.error(err);
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
  const handleThumbnailClick = (product) => setActiveProduct(product);

  useEffect(() => {
    if (!isIntroView) {
      fetchProducts();
      if (id) fetchCategoryName(id);
    }
  }, [isIntroView, keyword, categories, minPrice, maxPrice, rating, sort, id, page]);

  return (
    <AnimatePresence mode="wait">
      {isIntroView ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="h-screen overflow-y-scroll snap-y snap-mandatory"
        >
          {/* Section 1 */}
          <section className="h-screen snap-start relative bg-gradient-to-r from-purple-500 to-pink-500 flex flex-col items-center justify-center text-white p-8">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Nghệ thuật của sự tối giản</h1>
            <p className="text-lg md:text-xl max-w-2xl text-center drop-shadow-lg">
              Nơi mỗi chi tiết được chăm chút tỉ mỉ, tạo nên sự hoàn hảo.
            </p>
            <motion.button
              onClick={() => setIsIntroView(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="mt-10 px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold shadow-xl flex items-center gap-2"
            >
              <ShoppingCart size={24} /> Bắt Đầu Mua Sắm
            </motion.button>
          </section>

          {/* Section 2 */}
          <section className="h-screen snap-start relative bg-black flex flex-col items-center justify-center overflow-hidden">
            <motion.div key={activeProduct.id} className="w-full h-full relative cursor-pointer">
              <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-5xl md:text-6xl font-bold text-white mb-2">{activeProduct.name}</h3>
                <p className="text-3xl md:text-4xl text-white font-light">{currencyVN(activeProduct.price)}</p>
              </div>
            </motion.div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 overflow-x-auto px-4">
              {mockProducts.map((p) => (
                <motion.div
                  key={p.id}
                  onClick={() => handleThumbnailClick(p)}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl cursor-pointer overflow-hidden transition-all duration-300 transform ${
                    activeProduct.id === p.id ? "ring-4 ring-purple-500 scale-110 shadow-lg" : "opacity-70 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </section>

          
        </motion.div>
      ) : (
        <motion.div
          key="products"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col max-w-7xl py-10 mx-auto mt-[80px] px-4 sm:px-6 lg:px-8"
        >
          <motion.button
            onClick={() => setIsIntroView(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 mb-8 text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium"
          >
            <ArrowLeft size={20} />
            <span className="text-lg">Quay lại trang giới thiệu</span>
          </motion.button>

          <div className="mb-4">
            <HorizontalFilter currentSort={sort} />
          </div>

          <div className="min-h-[40vh]">
            {loading && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                initial="hidden"
                animate="show"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} index={i} />
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
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
              >
                <AnimatePresence>
                  {products.map((p, idx) => (
                    <ProductCard key={p.id} product={p} index={idx} onClick={() => viewProduct(p.id)} t={t} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );


}
