  // File: ProductCard.jsx
import React, { useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, Heart, CheckCircle } from "lucide-react";

const currencyVN = (v) => Number(v || 0).toLocaleString("vi-VN") + " VND";

function ProductCard({ product, onClick, index, t }) {
  const isDiscounted = product.final_price && product.final_price < product.price;
  const discountPercent = product.discount_percent;
  const controls = useAnimation();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan truyền lên thẻ cha
    setAddedToCart(true);
    controls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, type: "spring" }
    });
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000); // Đặt lại trạng thái sau 2 giây
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.9 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }} // Hiệu ứng Staggered được làm mượt hơn
      whileHover={{ scale: 1.05, rotate: 0.5, boxShadow: "0px 18px 30px rgba(0,0,0,0.4)" }}
      className="bg-gradient-to-br from-[#BC6FF1] via-[#52057B] to-[#000000] rounded-3xl p-[3px] cursor-pointer flex flex-col transform transition-all duration-300 ease-out"
      onClick={onClick}
    >
      <motion.div
        className="bg-purple-200 rounded-[22px] p-5 flex flex-col h-full"
        animate={controls}
      >
        {/* Placeholder cho ảnh */}
        <div className="relative overflow-hidden rounded-xl mb-4">
          <motion.div
            className="w-full h-48 bg-purple-400 rounded-xl"
            whileHover={{ scale: 1.05, backgroundColor: "#BC6FF1" }}
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
        
        <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-1 line-clamp-2 flex-1">
          {product.name}
        </h2>
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

export default ProductCard;