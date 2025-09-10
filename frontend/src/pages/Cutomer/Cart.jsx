import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Trash2, PlusCircle, MinusCircle, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 50]); // Layer 1 moves slower
  const y2 = useTransform(scrollY, [0, 500], [0, 100]); // Layer 2 moves faster

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart/cart-items/");
        setCartItems(res.data);
        setSelectedItems(res.data.map((item) => item.id));
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (id, change) => {
    try {
      const newQty = Math.max(
        1,
        cartItems.find((item) => item.id === id).quantity + change
      );
      await api.patch(`/cart/cart-items/${id}/`, { quantity: newQty });
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/cart-items/${id}/`);
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const totalPrice = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading)
    return (
      <p className="text-center text-purple-500 mt-6 animate-pulse text-xl">
        {t("loadingCart")}
      </p>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative max-w-6xl mx-auto p-6 my-[100px] min-h-screen"
    >
      {/* === Parallax Background Layers === */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-0 left-1/4 w-32 h-32 bg-purple-200 rounded-full opacity-30 pointer-events-none z-0"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-20 right-1/3 w-48 h-48 bg-pink-200 rounded-full opacity-20 pointer-events-none z-0"
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute bottom-10 left-1/3 w-40 h-40 bg-indigo-200 rounded-full opacity-25 pointer-events-none z-0"
      />
      

      {/* === Main Content === */}
      <div className="relative z-10 bg-gradient-to-br from-purple-50 via-white to-purple-100 rounded-3xl shadow-xl p-6">
        <h1 className="text-4xl font-extrabold mb-10 text-purple-700 text-center drop-shadow-md flex items-center justify-center gap-2">
          <ShoppingCart className="animate-bounce" size={40} />
          {t("cartTitle")}
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[80px] font-bold text-purple-500 mb-6 animate-pulse">
              {t("emptyCartMsg")}
            </p>
            <motion.button
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-extrabold rounded-2xl shadow-lg text-3xl transition-all"
            >
              {t("shopNow")}
            </motion.button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                checked={selectedItems.length === cartItems.length}
                onChange={toggleSelectAll}
                className="w-6 h-6 accent-purple-600"
              />
              <span className="text-gray-700 font-medium">{t("selectAll")}</span>
            </div>

            <div className="space-y-6">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    className="flex items-center bg-white rounded-3xl border border-purple-100 shadow-sm p-5 hover:shadow-lg transition-all relative"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-6 h-6 mr-4 accent-purple-600"
                    />
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-xl border border-purple-200 shadow-sm"
                    />
                    <div className="flex-1 ml-5">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {item.product.name}
                      </h2>
                      <p className="text-purple-600 font-bold mt-1 text-lg">
                        {item.product.price.toLocaleString()} đ
                      </p>
                      <div className="flex items-center mt-3 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition"
                        >
                          <MinusCircle size={20} />
                        </motion.button>
                        <span className="px-4 py-1 border-t border-b text-gray-700 text-lg font-medium">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition"
                        >
                          <PlusCircle size={20} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-lg">
                        {(item.product.price * item.quantity).toLocaleString()} đ
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.2, color: "#ff3b3b" }}
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 mt-2 text-red-400 text-sm hover:underline"
                      >
                        <Trash2 size={16} />
                        {t("delete")}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 bg-white rounded-3xl shadow-xl p-6 flex justify-between items-center border-t-4 border-purple-400"
            >
              <p className="text-xl font-semibold text-gray-700">
                {t("total", { count: selectedItems.length })}
              </p>
              <p className="text-3xl font-extrabold text-purple-600">
                {totalPrice.toLocaleString()} đ
              </p>
            </motion.div>

            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.07, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                disabled={selectedItems.length === 0}
                className={`px-10 py-4 font-bold rounded-2xl shadow-lg transition-all ${
                  selectedItems.length === 0
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
                }`}
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      selectedItems: cartItems.filter((item) =>
                        selectedItems.includes(item.id)
                      ),
                    },
                  })
                }
                
              >
                {t("checkout")}
                
              </motion.button>
              
            </div>
          </>
        )}
        
      </div>
      
    </motion.div>
  );
}
