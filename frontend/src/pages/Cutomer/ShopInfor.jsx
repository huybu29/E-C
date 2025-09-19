import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const currencyVN = (v) => Number(v || 0).toLocaleString("vi-VN") + " VND";

export default function ShopPage() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sellerRes, productRes] = await Promise.all([
          API.get(`/account/seller/${id}/`),
          API.get(`product/public/seller/?seller_id=${id}`)
        ]);

        setSeller(sellerRes.data);
        setProducts(productRes.data?.results || productRes.data || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // === Skeleton card component ===
  const SkeletonCard = () => (
    <div className="rounded-2xl p-[2px] bg-gradient-to-br from-[#BC6FF1] via-[#52057B] to-black">
      <div className="bg-purple-200 rounded-2xl p-4 h-full">
        <div className="w-full h-48 rounded-xl mb-4 bg-purple-300 animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-purple-300 animate-pulse mb-3" />
        <div className="h-5 w-1/3 rounded bg-purple-300 animate-pulse mb-6" />
        <div className="h-10 w-full rounded bg-purple-300 animate-pulse" />
      </div>
    </div>
  );

  // === Product card component ===
  const ProductCard = ({ product, onClick, index }) => (
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

  // === Grid wrapper component ===
  const ProductGrid = ({ products, loading, onClick }) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      );
    }

    if (!loading && products.length === 0) {
      return (
        <div className="flex justify-center py-10">
          <p className="text-gray-600">Không có sản phẩm nào</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence>
          {products.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} onClick={() => onClick(p.id)} />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  if (!seller && !loading) {
    return (
      <div className="text-center mt-40">
        <p className="text-red-500 text-lg font-semibold">Không tìm thấy shop</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 lg:px-20 mt-28">
      {/* Header Shop */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between bg-white p-6 rounded-2xl shadow-lg mb-8 gap-4">
        <img
          src={seller?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller?.shop_name)}&background=52057B&color=fff&size=128&rounded=true`}
          alt={seller?.shop_name}
          className="w-24 h-24 rounded-full object-cover cursor-pointer"
          onClick={() => navigate(`/shop/${seller?.user}`)}
        />
        <div className="flex-1">
          <h2
            className="text-2xl font-bold cursor-pointer hover:text-purple-700"
            onClick={() => navigate(`/shop/${seller?.user}`)}
          >
            {seller?.shop_name}
          </h2>
          <p className="text-gray-600 mt-1">{seller?.description}</p>
          <div className="flex gap-6 mt-3 text-gray-600">
            <span>Sản phẩm đã bán: {seller?.total_sold || 0}</span>
            <span>
              Đánh giá trung bình: {seller?.avg_rating?.toFixed(1) || "Chưa có"} ★
            </span>
            <span>Sản phẩm đang bán: {seller?.total_products || 0}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/shop/${seller?.user}`)}
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-900 transition"
        >
          Xem Shop
        </button>
      </div>

      {/* Banner */}
      {seller?.banner && (
        <img
          src={seller.banner}
          alt="Banner"
          className="w-full h-40 md:h-56 object-cover rounded-xl mb-8 shadow-md"
        />
      )}

      {/* Sản phẩm */}
      <h3 className="text-xl font-bold text-white mb-4">Sản phẩm của cửa hàng</h3>
      <ProductGrid
        products={products}
        loading={loading}
        onClick={(pid) => navigate(`/product/${pid}`)}
      />
    </div>
  );
}
