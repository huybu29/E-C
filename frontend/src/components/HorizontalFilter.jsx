import React from "react";
import { useNavigate } from "react-router-dom";

export default function HorizontalFilter({ currentSort }) {
  const navigate = useNavigate();

  const handleSort = (value) => {
    const query = new URLSearchParams(location.search);
    query.set("sort", value);
    query.set("page", "1"); // reset page về 1 khi đổi sort
    navigate(`?${query.toString()}`);
  };

  const filters = [
    { label: "Liên quan", value: "relevance" },
    { label: "Bán chạy", value: "-bestselling" },
    { label: "Mới nhất", value: "-created_at" },
    { label: "Giá: Thấp → Cao", value: "price" },
    { label: "Giá: Cao → Thấp", value: "-price" },
  ];

  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <span className="font-semibold">Sắp xếp theo:</span>
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => handleSort(f.value)}
          className={`px-3 py-1 rounded border ${
            currentSort === f.value
              ? "bg-blue-700 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
