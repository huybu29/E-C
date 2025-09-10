import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function HorizontalFilter({ currentSort }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSort = (value) => {
    const query = new URLSearchParams(location.search);
    query.set("sort", value);
    query.set("page", "1");
    navigate(`?${query.toString()}`);
  };

  const filters = [
    { label: t("filters.relevance"), value: "relevance" },
    { label: t("filters.bestselling"), value: "-bestselling" },
    { label: t("filters.newest"), value: "-created_at" },
    { label: t("filters.priceAsc"), value: "price" },
    { label: t("filters.priceDesc"), value: "-price" },
  ];

  return (
    <div className="flex items-center gap-3 mb-6 flex-nowrap overflow-x-auto scrollbar-hide py-2">
      <span className="font-semibold text-white shrink-0">{t("sortBy")}:</span>
      {filters.map((f) => {
        const isActive = currentSort === f.value;
        return (
          <motion.button
            key={f.value}
            onClick={() => handleSort(f.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl border whitespace-nowrap transition font-medium
              ${isActive
                ? "bg-gradient-to-r from-[#BC6FF1] to-[#52057B] text-white border-[#52057B] shadow-lg"
                : "bg-white text-[#52057B] border-[#BC6FF1] hover:bg-[#BC6FF1]/10"
              }`}
          >
            {f.label}
          </motion.button>
        );
      })}
    </div>
  );
}
