// src/pages/admin/CategoryManagement.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminPage from "./AdminPage";

export default function CategoryManagement() {
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchCategories = () => {
    api.get("/category/categories/")
      .then((res) => {
        setAllCategories(res.data);
        setCategories(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = allCategories;
    if (search) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setCategories(filtered);
  }, [search, allCategories]);

  // =================== Add Category ===================
  const handleAddCategory = () => {
    setName("");
    setDescription("");
    setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    try {
      await api.post("/category/categories/", {
        name,
        description,
      });
      setAddModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Thêm danh mục thất bại");
    }
  };

  // =================== Edit Category ===================
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/category/categories/${editingCategory.id}/`, {
        name,
        description
      });
      setEditModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    }
  };

  // =================== Delete Category ===================
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/category/categories/${id}/`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Xóa danh mục thất bại");
    }
  };

  return (
    <AdminPage>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#FF7ED4]">Category Management</h1>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Add Category
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded bg-[#3B0A4F] text-white border border-[#4E1883] flex-1"
          />
        </div>

        {/* Category Table */}
        <div className="bg-[#2A083B] rounded-lg shadow-xl p-4 border border-[#4E1883] overflow-x-auto">
          <table className="w-full text-left border-collapse text-white">
            <thead>
              <tr className="bg-[#3B0A4F] text-white">
                <th className="p-3 border border-[#4E1883]">ID</th>
                <th className="p-3 border border-[#4E1883]">Name</th>
                <th className="p-3 border border-[#4E1883]">Description</th>
                <th className="p-3 border border-[#4E1883]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-[#4E1883] transition">
                  <td className="p-3 border border-[#4E1883] font-semibold">{c.id}</td>
                  <td className="p-3 border border-[#4E1883]">{c.name}</td>
                  <td className="p-3 border border-[#4E1883]">{c.description || "-"}</td>
                  <td className="p-3 border border-[#4E1883] flex gap-2">
                    <button
                      onClick={() => handleEditCategory(c)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-400">
                    Không có danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center text-black bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl  font-bold mb-4">Edit Category</h2>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 flex text-black items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Add Category</h2>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAdd}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminPage>
  );
}
