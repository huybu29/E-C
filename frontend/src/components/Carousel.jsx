// src/components/CarouselBanner.jsx
import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function CarouselBanner() {
  // Cấu hình carousel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true, // ✅ Hiệu ứng chuyển cảnh mờ
    cssEase: "linear",
  };

  const banners = [
    "/ád.jpg",
    "/omg.jpg",
    "/cherry-blossom-v0-6921bld180rd1.png",
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto mt-[80px] p-6">
      <div className="rounded-2xl shadow-lg overflow-hidden">
        <Slider {...sliderSettings}>
          {banners.map((banner, index) => (
            <div key={index}>
              <motion.img
                src={banner}
                alt={`Banner ${index + 1}`}
                className="w-full h-[500px] object-cover rounded-2xl"
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
