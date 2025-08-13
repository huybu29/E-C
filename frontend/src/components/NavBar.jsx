import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

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

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition"
        >
          🛒 MyShop
        </Link>

        {/* Thanh Search */}
        <form onSubmit={handleSearch} className="flex items-center border rounded-md overflow-hidden">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="px-3 py-1 outline-none w-64"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 hover:bg-blue-700 transition"
          >
            Tìm
          </button>
        </form>

        {/* Menu */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="px-3 py-1 rounded-md text-gray-700 font-medium hover:bg-blue-100 hover:text-blue-700 transition"
          >
            Home
          </Link>

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="px-3 py-1 rounded-md text-gray-700 font-medium hover:bg-blue-100 hover:text-blue-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
            <Link
            to="/seller/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition"
          >
            Seller
            </Link>
              <Link
                to="/checkout"
                className="px-3 py-1 rounded-md text-gray-700 font-medium hover:bg-blue-100 hover:text-blue-700 transition"
              >
                Check out
              </Link>
              <Link
                to="/cart"
                className="px-3 py-1 rounded-md text-gray-700 font-medium hover:bg-blue-100 hover:text-blue-700 transition"
              >
                Cart
              </Link>
              <Link
                to="/order"
                className="px-3 py-1 rounded-md text-gray-700 font-medium hover:bg-blue-100 hover:text-blue-700 transition"
              >
                Order
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md bg-red-500 text-white font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
