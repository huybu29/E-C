import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../services/api";
import { AuthContext } from "../../services/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactStars from "react-stars";
import { useTranslation } from "react-i18next";
import { ShoppingCart, ArrowRight } from "lucide-react";

function SellerInfo({ seller }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!seller) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-4 my-8"
    >
      <motion.img
        src={seller.logo || "https://via.placeholder.com/80"}
        alt={seller.shop_name}
        className="w-20 h-20 rounded-full object-cover cursor-pointer"
        onClick={() => navigate(`/shop/${seller.id}`)}
        whileHover={{ scale: 1.1 }}
      />
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h3
            className="text-xl font-bold cursor-pointer hover:text-purple-600 transition-colors"
            onClick={() => navigate(`/shop/${seller.id}`)}
          >
            {seller.shop_name}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-gray-600">
            <span>{t("soldProducts")}: {seller.total_sold || 0}</span>
            <span>{t("averageRating")}: {seller.average_rating ? seller.average_rating.toFixed(1) : t("all")} ★</span>
          </div>
        </div>
        <motion.button
          onClick={() => navigate(`/shop/${seller.id}`)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium mt-2 md:mt-0 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          {t("viewShop")} <ArrowRight size={16}/>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [filterStars, setFilterStars] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    API.get(`/product/${id}/`)
      .then(res => {
        setProduct(res.data);
        setMainImage(res.data.image);
        return API.get(`/account/seller/${res.data.seller}/`);
      })
      .then(res => setSeller(res.data))
      .catch(err => console.error(err));

    API.get(`/product/reviews/?product=${id}`)
      .then(res =>{ setReviews(res.data)
        console.log(res.data)
      })
      
      .catch(err => console.error(err));
  }, [id]);

  const handleNotLoggedIn = () => {
    alert(t("loginRequired"));
    navigate("/login");
  };

  const addToCart = (qty) => {
    if (!isLoggedIn) return handleNotLoggedIn();
    API.post("/cart/cart-items/", { product_id: product.id, quantity: qty })
      .then(() => {
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2000);
      })
      .catch(err => console.error(err));
  };

  const buyNow = (qty) => {
    if (!isLoggedIn) return handleNotLoggedIn();
    API.post("/cart/cart-items/", { product_id: product.id, quantity: qty })
      .then(() => navigate("/cart"))
      .catch(err => console.error(err));
  };

  if (!product)
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 text-lg mt-20">
        {t("loading")}
      </motion.div>
    );

  const filteredReviews = filterStars > 0 ? reviews.filter(r => Math.round(r.rating) === filterStars) : reviews;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto my-12 px-4 py-10 bg-gradient-to-b from-purple-900 via-[#52057B] to-black rounded-3xl shadow-2xl"
      >
        {/* Hero & Gallery */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-10 rounded-2xl shadow-xl"
        >
          <motion.div className="flex flex-col items-center gap-4">
            <motion.img
              src={mainImage || "https://via.placeholder.com/400"}
              alt={product.name}
              className="w-full h-auto rounded-2xl shadow-lg cursor-pointer"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
            {/* Gallery thumbnails */}
            <div className="flex gap-3 mt-2">
              {[product.image, ...(product.images || [])].map((img, i) => (
                <motion.img
                  key={i}
                  src={img}
                  alt={`thumb-${i}`}
                  className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${mainImage === img ? "border-purple-600" : "border-gray-200"}`}
                  onClick={() => setMainImage(img)}
                  whileHover={{ scale: 1.1 }}
                />
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-[#52057B] mb-4">{product.name}</h1>
            <p className="text-2xl text-[#BC6FF1] font-semibold mb-4">{Number(product.price).toLocaleString("vi-VN")}₫</p>
            <p className="text-gray-700 mb-6 text-lg">{product.description}</p>

            <div className="flex items-center mb-6 gap-4">
              <label className="text-gray-800 font-medium">{t("quantity")}:</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <motion.button type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 bg-red-200 text-gray-700 font-bold"
                  whileHover={{ scale: 1.15, rotate: -10 }}
                >−</motion.button>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center focus:ring-2 focus:ring-[#BC6FF1] focus:outline-none"/>
                <motion.button type="button"
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="px-3 py-1 bg-green-200 text-gray-700 font-bold"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                >+</motion.button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addToCart(quantity)} className="flex-1 bg-gradient-to-r from-[#BC6FF1] to-[#52057B] hover:from-[#52057B] hover:to-[#000000] text-white px-6 py-3 rounded-xl shadow-lg font-medium transition flex items-center justify-center gap-2">
                <ShoppingCart size={18}/> {t("addToCart")}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => buyNow(quantity)} className="flex-1 bg-gradient-to-r from-[#52057B] to-[#000000] hover:from-[#000000] hover:to-[#52057B] text-white px-6 py-3 rounded-xl shadow-lg font-medium transition">
                {t("buyNow")}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Seller info */}
        <SellerInfo seller={seller} />

        {/* Reviews */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-10 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-[#52057B] mb-4">{t("productReviews")}</h2>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="font-semibold text-[#52057B]">{t("filterStars")}:</span>
            {[0,5,4,3,2,1].map(star => (
              <motion.button key={star} whileHover={{ scale: 1.1 }} onClick={() => setFilterStars(star)} className={`px-3 py-1 rounded-full border transition ${filterStars===star?"bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white border-[#52057B]":"bg-white text-[#52057B] border-[#BC6FF1] hover:bg-[#BC6FF1]/10"}`}>
                {star===0?t("all"):`${star} ★`}
              </motion.button>
            ))}
          </div>

          {filteredReviews.length===0 ? (
            <p className="text-gray-500">{t("noReviews")}</p>
          ) : (
            <motion.div layout className="space-y-4">
              {filteredReviews.map((review,i)=>(
                <motion.div key={review.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className="p-4 border rounded-lg hover:shadow-md transition bg-[#BC6FF1]/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img src={review.user.avatar_url} alt={review.username} className="w-10 h-10 rounded-full object-cover"/>
                      <div>
                        <span className="font-semibold text-[#52057B]">{review.user.username}</span>
                        <p className="text-gray-500 text-sm">{new Date(review.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <ReactStars count={5} size={20} value={review.rating} edit={false} color2="#ffd700"/>
                  </div>
                  {review.comment && <p className="text-gray-700 mt-2">{review.comment}</p>}
                  {review.image && <img src={review.image} alt="Review" className="w-50 h-auto rounded-lg mt-2"/>}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Add to cart modal */}
        {showModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed top-5 right-5 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {t("addedToCart")}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
