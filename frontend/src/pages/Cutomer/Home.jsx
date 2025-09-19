import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ShoppingCart, ArrowLeft, Star, Heart, CheckCircle } from "lucide-react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../services/api";
import HorizontalFilter from "../../components/HorizontalFilter";
import Slider from "../../components/Carousel";

gsap.registerPlugin(ScrollToPlugin);

// ===== Helper =====
const currencyVN = (v) => Number(v || 0).toLocaleString("vi-VN") + " VND";

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

          <motion.div
            className="absolute bottom-2 right-2 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
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

// ===== Pagination =====
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`px-3 py-2 rounded-lg ${
          page === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-purple-500 text-white hover:bg-purple-600"
        }`}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 rounded-lg ${
            p === page ? "bg-purple-700 text-white font-bold" : "bg-gray-100 text-gray-700 hover:bg-purple-200"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`px-3 py-2 rounded-lg ${
          page === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-purple-500 text-white hover:bg-purple-600"
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default function HomePage() {
  const [isIntroView, setIsIntroView] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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
  const sort = searchParams.get("sort") || "newest";
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const introContainerRef = useRef(null);

  // mock data
 

  const [activeProduct, setActiveProduct] = useState(null);

  // 🔹 Khi load trang, check localStorage intro
  useEffect(() => {
    const introShown = localStorage.getItem("introShown");
    if (introShown === "true") {
      setIsIntroView(false);
    }
  }, []);

  const handleStartShopping = () => {
    localStorage.setItem("introShown", "true");
    setIsIntroView(false);
  };

  const handleBackToIntro = () => {
    localStorage.removeItem("introShown");
    setIsIntroView(true);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: keyword || undefined,
        categories: categories || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        rating: rating || undefined,
        sort,
        page,
        page_size: pageSize
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  // smooth scroll GSAP cho intro
  useEffect(() => {
    
    if (
      location.pathname.startsWith("/search") ||
      location.pathname.startsWith("/product") ||
      location.pathname === "/cart" ||
      location.pathname === "/checkout" ||
      location.pathname === "/profile" ||
      location.pathname.startsWith("/order") ||
      location.pathname.startsWith("/shop")
    ) {
      setIsIntroView(false);
    }

    if (!isIntroView) {
      fetchProducts();
      if (id) fetchCategoryName(id);
      return;
    }

    const container = introContainerRef.current;
    if (!container) return;

    gsap.set(container, { scrollTop: 0 });
    const sections = container.querySelectorAll("section");
    let isScrolling = false;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrolling) return;

      const direction = e.deltaY > 0 ? "down" : "up";
      const currentScroll = container.scrollTop;
      let targetIndex = -1;

      if (direction === "down") {
        for (let i = 0; i < sections.length; i++) {
          if (sections[i].offsetTop > currentScroll + 10) {
            targetIndex = i;
            break;
          }
        }
      } else {
        for (let i = sections.length - 1; i >= 0; i--) {
          if (sections[i].offsetTop < currentScroll - 10) {
            targetIndex = i;
            break;
          }
        }
      }

      if (targetIndex !== -1) {
        isScrolling = true;
        gsap.to(container, {
          scrollTo: { y: sections[targetIndex], offsetY: 0 },
          duration: 1.2,
          ease: "power2.inOut",
          onComplete: () => {
            isScrolling = false;
          }
        });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    document.body.style.overflow = "hidden";

    return () => {
      container.removeEventListener("wheel", handleWheel);
      document.body.style.overflow = "";
      gsap.killTweensOf(container);
    };
  }, [isIntroView, keyword, categories, minPrice, maxPrice, rating, sort, id, page]);

  return (
    <div className="relative w-full">
      {/* Intro view */}
      <motion.div
        ref={introContainerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: isIntroView ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className={`intro-container h-screen overflow-hidden snap-y snap-mandatory absolute inset-0 ${
          isIntroView ? "block" : "hidden"
        }`}
      >
        {/* Section 1 */}
        <section className="h-screen flex flex-col items-center justify-center snap-start relative overflow-hidden">
  {/* Video nền */}
  <video
     autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="\PixVerse_V5_Image_Text_1080P_Seamless_infinite.mp4" />
    Trình duyệt của bạn không hỗ trợ video.
  </video>

  {/* Overlay làm tối background để chữ nổi bật */}
  <div className="absolute inset-0 bg-black/50"></div>

  {/* Nội dung */}
  <div className="relative z-10 text-center text-white">
  {/* Hiệu ứng chữ với gradient + shadow */}
  <motion.h1
    initial={{ y: 80, opacity: 0, scale: 0.8 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
  >
    Welcome to Our Shop
  </motion.h1>

  {/* Sub-text chạy fade-in delay */}
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.8 }}
    className="text-lg md:text-2xl mb-8 text-gray-200"
  >
    Trải nghiệm mua sắm tuyệt vời cùng chúng tôi ✨
  </motion.p>

  {/* Nút CTA */}
  
</div>
</section>

       <section className="h-screen snap-start relative bg-black overflow-hidden">
  <Slider />
</section>


        {/* Section 3 */}
                  <section className="h-screen snap-start relative bg-black text-white flex flex-col items-center justify-center p-8" 
                  style={{ backgroundImage: 'url("/12_asfasw112.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <h2 className="text-5xl md:text-6xl font-bold mb-4">Sáng Tạo Từ Trái Tim</h2>
                    <p className="text-xl md:text-2xl max-w-xl text-center">
                      Mỗi sản phẩm là một tác phẩm nghệ thuật, được chế tác thủ công với tất cả đam mê và sự tỉ mỉ.
                    </p>
                  </section>
        
                  {/* Section 4 */}
                  <section className="h-screen snap-start relative bg-gradient-to-l from-[#BC6FF1] to-[#52057B] text-white flex flex-col items-center justify-center p-8 "
                  style={{ backgroundImage: 'url("/3672201.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <h2 className="text-5xl font-bold mb-4">Chương Mới: Khám Phá</h2>
                    <p className="text-xl mb-8 opacity-80 text-center">Hãy bắt đầu hành trình mua sắm của bạn.</p>
                    <motion.button
                  onClick={() => setIsIntroView(false)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 25px rgba(168, 85, 247, 0.7)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-full text-xl font-bold shadow-2xl flex items-center gap-3 tracking-wide"
                >
                  <ShoppingCart size={26} /> Bắt Đầu Mua Sắm
                </motion.button>
                  </section>
      </motion.div>

      {/* Main view */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isIntroView ? 0 : 1 }}
        transition={{ duration: 0.6 }}
        className={`${isIntroView ? "hidden" : "block"} w-full min-h-screen px-4 py-6`}
      >
        {/* Back button */}
        <motion.button
          onClick={() => setIsIntroView(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 left-6 z-50 px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Trang giới thiệu
        </motion.button>

        {/* Filters */}
        <HorizontalFilter currentSort={sort} />

        
        

        {/* Products */}
        {loading ? (
          <div className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} index={idx} />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <HorizontalFilter currentSort={sort} />
            {products.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-center mt-20 text-lg"
              >
                {t("noProductsFound")}
              </motion.p>
            ) : (
              <>
                <motion.div
                  layout
                  className="grid   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                >
                  {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} onClick={() => viewProduct(product.id)} index={idx} t={t} />
                  ))}
                </motion.div>
                {/* Pagination */}
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
