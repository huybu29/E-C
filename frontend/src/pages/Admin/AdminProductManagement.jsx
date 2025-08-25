import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);

  const fetchProducts = () => {
    api.get("/account/admin/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApprove = (id) => {
    api.post(`/account/admin/products/${id}/approve/`)
      .then(() => fetchProducts())
      .catch((err) => console.error(err));
  };

  const handleReject = (id) => {
    api.post(`/account/admin/products/${id}/reject/`)
      .then(() => fetchProducts())
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#333446]">Product Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-[#B8CFCE] rounded-lg shadow p-4 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-[#333446]">{p.name}</h2>
            <p className="text-sm text-gray-600">Price: ${p.price}</p>
            <p className="text-sm text-gray-600">Stock: {p.stock}</p>
            <p className="text-sm text-gray-600">Status: {p.status}</p>

            {p.status === "pending" && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleApprove(p.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(p.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
