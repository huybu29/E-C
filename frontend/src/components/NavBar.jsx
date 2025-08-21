import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import API from "../services/api";

export default function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [categories, setCategories] = useState([]);

  // Demo user
  const user = {
    username: "quanghuy",
    avatar: "https://i.pravatar.cc/40"
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim() !== "") {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
      setKeyword("");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category/categories/");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 
                    bg-gradient-to-r from-[#892CDC] via-[#52057B] to-[#000000] 
                    text-white shadow-md z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl  font-bold hover:text-purple-800 transition-colors">
          🛒 MyShop
        </Link>

        {/* Thanh Search */}
        <form onSubmit={handleSearch} className="flex text-[#52057B] items-center rounded-lg overflow-hidden shadow-sm">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className=" text-sm p-[5px] px-4 bg-[white] outline-none w-[500px] rounded-l-md"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#52057B] to-[#52057B] 
                       text-white py-[3px] px-4 hover:from-[#52057B] hover:to-[#000000] 
                       transition-colors rounded-r-md font-medium"
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
                className="px-3 py-2 rounded-md font-medium 
                           bg-gradient-to-r from-[#BC6FF1] to-[#52057B] 
                           hover:from-[#52057B] hover:to-[#000000] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-md font-medium 
                           bg-white text-[#52057B] border border-[#BC6FF1] 
                           hover:bg-gray-100 transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/cart"
                className="px-3 py-2 rounded-md font-medium 
                           hover:bg-[#52057B] transition-colors"
              >
                Cart
              </Link>
              
              <Link
                to="/order"
                className="px-3 py-2 rounded-md font-medium 
                           hover:bg-[#52057B] transition-colors"
              >
                Order
              </Link>

              {/* Avatar + Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md 
                             hover:bg-[#52057B] transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border border-white"
                  />
                  <span className="font-medium">{user.username}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${openMenu ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-[#52057B] shadow-lg rounded-lg border border-gray-200 overflow-hidden z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-white  hover:bg-[#BC6FF1]/10 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to="/seller/dashboard"
                      className="block px-4 py-2 text-white  hover:bg-[#BC6FF1]/10 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      Seller
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
