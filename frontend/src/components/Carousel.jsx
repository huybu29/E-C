import React, { useState } from "react";

const slidesData = [
  { id: 1, name: "LUNDEV", des: "Tinh ru anh di chay pho...", image: "/6214594.jpg" },
  { id: 2, name: "LUNDEV", des: "Tinh ru anh di chay pho...", image: "/6214594.jpg" },
  { id: 3, name: "LUNDEV", des: "Tinh ru anh di chay pho...", image: "/6214594.jpg" },
  { id: 4, name: "LUNDEV", des: "Tinh ru anh di chay pho...", image: "/6214594.jpg" },
  { id: 5, name: "LUNDEV", des: "Tinh ru anh di chay pho...", image: "/6214594.jpg" },
  { id: 6, name: "LUNDEV", des: "Tinh ru anh di chay pho...", image: "/6214594.jpg" },
];

export default function Slider() {
  const [slides, setSlides] = useState(slidesData);

  const nextSlide = () => {
    setSlides(prev => {
      const copy = [...prev];
      copy.push(copy.shift());
      return copy;
    });
  };

  const prevSlide = () => {
    setSlides(prev => {
      const copy = [...prev];
      copy.unshift(copy.pop());
      return copy;
    });
  };

  const handleSlideClick = (idx) => {
    if (idx === 0) prevSlide();
    else if (idx > 0) nextSlide();
  };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      <style>
        {`
          @keyframes fadeUp {
            0% {opacity:0; transform: translateY(50px); filter: blur(20px);}
            100% {opacity:1; transform: translateY(0); filter: blur(0);}
          }
          .fade-name {animation: fadeUp 0.8s forwards;}
          .fade-des {animation: fadeUp 0.8s 0.3s forwards;}
          .fade-btn {animation: fadeUp 0.8s 0.6s forwards;}
          .hover-scale:hover {transform: scale(1.05) translateY(-5px);}
        `}
      </style>

      <div className="relative w-full h-full bg-black">
        {slides.map((slide, idx) => {
          let left = 0, top = 0, width = "100%", height = "100%";
          let zIndex = 1, opacity = 1;
          let showContent = false;
          let boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
          let transform = "translate(0,0)";

          if (idx === 0) {
            // Slide chính full khung, nằm bên trái
            left = "0";
            width = "100%";
            height = "100%";
            zIndex = 1;
            showContent = true;
            boxShadow = "0 10px 20px rgba(0,0,0,0.4)";
          } else {
            
            width = "200px";
            height = "300px";
            const gap = 20; // khoảng cách giữa các slide
            left = `${1000 + (idx - 1) * (200 + gap)}px`; // 600px là width slide chính, + gap
            top = "50%";
            transform = "translateY(-50%)";
            zIndex = 10 - idx; // slide phụ trên cùng
            opacity = idx > 3 ? 0 : 0.9; // slide xa mờ hơn
            boxShadow = "0 8px 20px rgba(0,0,0,0.5)";
          }

          return (
            <div
              key={slide.id}
              onClick={() => handleSlideClick(idx)}
              className={`absolute rounded-2xl cursor-pointer transition-all duration-500 hover-scale`}
              style={{
                left,
                top,
                width,
                height,
                zIndex,
                opacity,
                transform,
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow,
              }}
            >
              {showContent && (
                <div className="absolute top-1/2 left-24 transform -translate-y-1/2 text-white">
                  <h2 className="text-4xl font-bold mb-4 fade-name">{slide.name}</h2>
                  <p className="mb-4 fade-des">{slide.des}</p>
                  <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 fade-btn">
                    See More
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-15 w-full flex justify-center gap-4 z-50">
        <button
          onClick={prevSlide}
          className="w-12 h-12 bg-black/30 border border-white text-white rounded-full hover:bg-black/50 hover:shadow-lg transition-all duration-300"
        >
          &lt;
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 bg-black/30 border border-white text-white rounded-full hover:bg-black/50 hover:shadow-lg transition-all duration-300"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
