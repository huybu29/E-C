import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import SellerRegister from "../pages/Seller/SellerRegis";
export default function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [user, setUser] = useState({
    id: null,
    username: "UserName",
    avatar: "https://i.pravatar.cc/40",
    is_staff: false,
    is_superuser: false,
  });
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("keyword") || "";
    setKeyword(q);
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim() !== "") {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
      setKeyword("");
    }
  };
  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/account/me/");
      console.log(res.data)
      setUser(res.data);
    } catch {
      setUser((prev) => ({ ...prev }));
    }
  };
  const fetchSeller = async () => {
    try {
      const res = await API.get("/account/seller/");
      console.log(res.data)
      setUser(res.data);
    } catch {
      setUser((prev) => ({ ...prev }));
    }
  };
  const checkSellerStatus = async () => {
    try {
      const res = await API.get("/account/seller/");
      
      const sellers = res.data;
      const found = sellers.some((seller) => Number(seller.user) === Number(user.id));
      setIsSeller(found);
    } catch {
      setIsSeller(false);
    }
  };
   useEffect(() => {
    if (isLoggedIn) {
      fetchCurrentUser();
      fetchSeller()
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && user.id) checkSellerStatus();
  }, [isLoggedIn,user.id]);

  const handleSellerClick = () => {
    if (isSeller) navigate("/seller/dashboard");
    else setShowPromptModal(true);
    setOpenMenu(false);
  };

  const handleOpenRegisterModal = () => {
    setShowPromptModal(false);
    setShowRegisterModal(true);
  };

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#892CDC] via-[#52057B] to-[#000000] text-white shadow-lg z-50"
      >
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold hover:text-purple-200 transition"
          >
            🛒 MyShop
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex text-[#52057B] items-center rounded-lg overflow-hidden shadow-sm"
          >
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="text-sm p-[5px] px-4 bg-white outline-none w-[500px] rounded-l-md"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#52057B] to-[#52057B] text-white py-[3px] px-4 hover:from-[#52057B] hover:to-[#000000] transition-colors rounded-r-md font-medium"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md font-medium bg-gradient-to-r from-[#BC6FF1] to-[#52057B] hover:from-[#52057B] hover:to-[#000000] transition-all"
                >
                  Đăng nhập
                </Link>
                
              </>
            ) : (
              <>
                <Link
                  to="/cart"
                  className="px-3 py-2 rounded-md font-medium hover:bg-[#52057B] transition"
                >
                  Giỏ hàng
                </Link>
                <Link
                  to="/order"
                  className="px-3 py-2 rounded-md font-medium hover:bg-[#52057B] transition"
                >
                  Đơn hàng
                </Link>

                {/* Avatar + Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(!openMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#52057B] transition"
                  >
                    <motion.img
                      whileHover={{ rotate: 10 }}
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=52057B&color=fff&size=128&rounded=true`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border border-white"
                    />
                    <span className="font-medium">{user.username}</span>
                    <motion.svg
                      animate={{ rotate: openMenu ? 180 : 0 }}
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
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
                        <button
                          onClick={() => navigate("/profile")}
                          className="w-full text-left px-4 py-2 text-white hover:bg-[#BC6FF1]/10"
                        >
                          Hồ sơ
                        </button>
                        
                          <button
                            onClick={handleSellerClick}
                            className="w-full text-left px-4 py-2 text-white hover:bg-[#BC6FF1]/10"
                          >
                            Trang người bán
                          </button>
                        

                        {/* Admin */}
                        {(user.is_superuser ||user.is_staff) && (
                          <button
                            onClick={() => navigate("/admin/stats")}
                            className="w-full text-left px-4 py-2 text-white hover:bg-[#BC6FF1]/10"
                          >
                            Quản trị hệ thống
                          </button>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          Đăng xuất
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Prompt Modal */}
      <AnimatePresence>
        {showPromptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center"
            >
              <h3 className="text-lg font-bold mb-4">Bạn chưa phải người bán!</h3>
              <p className="mb-6">
                Để quản lý sản phẩm và đơn hàng, bạn cần đăng ký trở thành người bán.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleOpenRegisterModal}
                  className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                >
                  Đăng ký
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal đăng ký Seller */}
      <AnimatePresence>
        {showRegisterModal && (
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
                onClick={() => setShowRegisterModal(false)}
                
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Đăng ký làm Người bán
              </h2>
              <SellerRegister closeModal={() =>{ setShowRegisterModal(false); }}
               />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
