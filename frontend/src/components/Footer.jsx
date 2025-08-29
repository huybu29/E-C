
import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột 1: Thông tin */}
        <div>
          <h2 className="text-xl font-bold text-white mb-3">ShopName</h2>
          <p className="text-sm">
            Nơi cung cấp sản phẩm chất lượng với giá tốt nhất. 
            Luôn sẵn sàng phục vụ bạn 24/7.
          </p>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Liên kết</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white">Trang chủ</a></li>
            <li><a href="/products" className="hover:text-white">Sản phẩm</a></li>
            <li><a href="/about" className="hover:text-white">Giới thiệu</a></li>
            <li><a href="/contact" className="hover:text-white">Liên hệ</a></li>
          </ul>
        </div>

        {/* Cột 3: Mạng xã hội */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Kết nối</h3>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-500"><Facebook /></a>
            <a href="#" className="hover:text-pink-500"><Instagram /></a>
            <a href="#" className="hover:text-sky-500"><Twitter /></a>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} ShopName. All rights reserved.
      </div>
    </footer>
  );
}
