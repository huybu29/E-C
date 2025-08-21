import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-6 mt-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <Link to="/" className="text-xl font-bold hover:text-blue-400">
            MyShop
          </Link>
        </div>
        <div className="flex gap-4 text-sm">
          <Link to="/about" className="hover:text-blue-400">
            About
          </Link>
          <Link to="/contact" className="hover:text-blue-400">
            Contact
          </Link>
          <Link to="/privacy" className="hover:text-blue-400">
            Privacy Policy
          </Link>
        </div>
        <div className="text-sm mt-4 md:mt-0">
          &copy; {new Date().getFullYear()} MyShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
