import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import SellerRegister from "../pages/Seller/SellerRegis";
import NotificationBell from "./NotifiBell";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const [user, setUser] = useState({
    id: null,
    username: "UserName",
    avatar: "https://i.pravatar.cc/40",
    is_staff: false,
    is_superuser: false,
  });

  const [isSeller, setIsSeller] = useState(false);
  const [isSellerApproved, setIsSellerApproved] = useState(false);

  // Update search keyword from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  // Fetch current user
  useEffect(() => {
    if (isLoggedIn) fetchCurrentUser();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && user.id) checkSellerStatus();
  }, [isLoggedIn, user.id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/account/me/");
      setUser(res.data);
    } catch {
      setUser((prev) => ({ ...prev }));
    }
  };

  const checkSellerStatus = async () => {
    try {
      const res = await API.get("/account/seller/");
      const seller = res.data.find((s) => Number(s.user) === Number(user.id));
      if (seller) {
        setIsSeller(true);
        setIsSellerApproved(seller.is_approved);
      } else {
        setIsSeller(false);
        setIsSellerApproved(false);
      }
    } catch {
      setIsSeller(false);
      setIsSellerApproved(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpenMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim() !== "") {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
      setKeyword("");
    }
  };

  const handleSellerClick = () => {
    if (!isSeller) setShowPromptModal(true);
    else if (isSeller && !isSellerApproved) setShowPendingModal(true);
    else navigate("/seller/dashboard");
    setOpenMenu(false);
  };

  const handleOpenRegisterModal = () => {
    setShowPromptModal(false);
    setShowRegisterModal(true);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenMenu(false);
  };

  const avatarUrl =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.username
    )}&background=52057B&color=fff&size=128&rounded=true`;

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0   bg-gradient-to-r from-[#892CDC] via-[#52057B] to-[#000000] text-white shadow-lg z-50 backdrop-blur-md "
      >
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold hover:text-purple-200 transition-transform transform hover:scale-105 motion-safe:animate-pulse"
          >
            🛒 MyShop
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex items-center  rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="text-sm p-[5px] px-4 text-black bg-white outline-none w-[400px] md:w-[500px] rounded-l-md transition-all focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#52057B] to-[#000000] text-white py-[3px] px-4 rounded-r-md font-medium hover:scale-105 hover:shadow-md transition-all"
            >
              {t("search")}
            </button>
          </form>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {/* Language switch */}
            <div className="flex gap-2">
              <button
                onClick={() => changeLanguage("vi")}
                className={`px-2 py-1 rounded ${
                  i18n.language === "vi"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-black"
                } hover:scale-105 transition-transform`}
              >
                🇻🇳
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-1 rounded ${
                  i18n.language === "en"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-black"
                } hover:scale-105 transition-transform`}
              >
                🇺🇸
              </button>
            </div>

            {!isLoggedIn ? (
              <Link
                to="/login"
                className="px-3 py-2 rounded-md font-medium bg-gradient-to-r from-[#BC6FF1] to-[#52057B] hover:from-[#52057B] hover:to-[#000000] transition-all hover:scale-105"
              >
                {t("login")}
              </Link>
            ) : (
              <>
                <Link
                  to="/cart"
                  className="px-3 py-2 rounded-md font-medium hover:bg-[#52057B]/80 transition-all hover:scale-105 flex items-center gap-1"
                >
                  {t("cart")}
                </Link>
                <Link
                  to="/order"
                  className="px-3 py-2 rounded-md font-medium hover:bg-[#52057B]/80 transition-all hover:scale-105 flex items-center gap-1"
                >
                  {t("orders")}
                </Link>

                {isLoggedIn && <NotificationBell user={user} />}

                {/* Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(!openMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#52057B]/80 transition-all"
                  >
                    <motion.img
                      whileHover={{ rotate: [0, 10, -10, 0], scale: 1.05 }}
                      src={avatarUrl}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border border-white shadow-sm"
                    />
                    <span className="font-medium">{user.username}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-44 bg-[#52057B] rounded-lg shadow-lg z-50 overflow-hidden"
                      >
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={{
                            visible: {
                              transition: { staggerChildren: 0.05 },
                            },
                          }}
                        >
                          <DropdownItem
                            text={t("profile")}
                            onClick={() => {
                              navigate("/profile");
                              setOpenMenu(false);
                            }}
                          />
                          <DropdownItem
                            text={t("sellerPage")}
                            onClick={handleSellerClick}
                          />
                          {(user.is_superuser || user.is_staff) && (
                            <DropdownItem
                              text={t("admin")}
                              onClick={() => {
                                navigate("/admin/stats");
                                setOpenMenu(false);
                              }}
                            />
                          )}
                          <DropdownItem
                            text={t("logout")}
                            onClick={handleLogout}
                            isDanger
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Modals */}
      {showPromptModal && (
        <Modal onClose={() => setShowPromptModal(false)}>
          <h3 className="text-lg font-bold mb-4">{t("seller.promptTitle")}</h3>
          <p className="mb-6">{t("seller.promptMessage")}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowPromptModal(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleOpenRegisterModal}
              className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
            >
              {t("seller.register")}
            </button>
          </div>
        </Modal>
      )}

      {showRegisterModal && (
        <Modal onClose={() => setShowRegisterModal(false)}>
          <h2 className="text-2xl font-bold mb-4 text-center">
            {t("seller.registerTitle")}
          </h2>
          <SellerRegister closeModal={() => setShowRegisterModal(false)} />
        </Modal>
      )}

      {showPendingModal && (
        <Modal onClose={() => setShowPendingModal(false)}>
          <h3 className="text-lg font-bold mb-4">{t("seller.pendingTitle")}</h3>
          <p className="mb-6">{t("seller.pendingMessage")}</p>
          <button
            onClick={() => setShowPendingModal(false)}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            {t("common.close")}
          </button>
        </Modal>
      )}
    </>
  );
}

// Dropdown Item Component with staggered effect
const DropdownItem = ({ text, onClick, isDanger }) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: isDanger ? "#f87171" : "#BC6FF1" }}
    className={`w-full text-left px-4 py-2 text-white hover:bg-purple-500 transition-colors`}
    onClick={onClick}
  >
    {text}
  </motion.button>
);

// Reusable Modal Component
const Modal = ({ children, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-auto"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          &times;
        </button>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);
