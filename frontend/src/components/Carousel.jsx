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
    autoplaySpeed: 2000,
    fade: true, 
    cssEase: "linear",
    arrows: false, 
  };

  // Banner gợi ý (ảnh đẹp, phù hợp e-commerce)
  const banners = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600", // Sneaker
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600", // Fashion
    
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600", // Headphones
  ];

  return (
    <div className="max-w-screen mx-auto mt-[80px] px-4">
      <div className="rounded-2xl shadow-xl ">
        <Slider {...sliderSettings}>
          {banners.map((banner, index) => (
            <div key={index}>
              <motion.img
                src={banner}
                alt={`Banner ${index + 1}`}
                className="w-full h-[400px] object-cover rounded-2xl"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
