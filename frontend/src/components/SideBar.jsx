import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SideBar() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category/categories/");
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    }
  };

  const goToCategory = (id) => {
    navigate(`/category/${id}`);
  };

  return (
    <aside className="fixed top-[70px] left-0 h-screen w-64 bg-white shadow-lg p-4 border-r overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Danh mục sản phẩm</h2>
      <ul className="space-y-2">
        {categories.length === 0 ? (
          <li className="text-gray-500">Không có danh mục.</li>
        ) : (
          categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => goToCategory(cat.id)}
                className="w-full text-left px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition"
              >
                {cat.name}
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
