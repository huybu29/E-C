import { useEffect, useState } from "react";
import API from "../../services/api";
import SellerPage from "./SellerPage";
import { Line, Doughnut } from "react-chartjs-2";
import { Loader2, Upload, X } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [mode, setMode] = useState("dashboard"); // dashboard | add | edit
  const [editProduct, setEditProduct] = useState(null); // dùng khi chỉnh sửa

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: null,
    is_active: true,
  });
  const [preview, setPreview] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/order/seller-stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Chuyển sang chế độ thêm / chỉnh sửa
  const handleEditProduct = (product = null) => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image: null, // không load ảnh cũ
        is_active: product.is_active,
      });
      setPreview(product.image_url || null);
      setEditProduct(product);
      setMode("edit");
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        image: null,
        is_active: true,
      });
      setPreview(null);
      setEditProduct(null);
      setMode("add");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setPreview(file ? URL.createObjectURL(file) : null);
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      if (editProduct) {
        await API.put(`/product/seller/${editProduct.id}/`, data);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await API.post("/product/seller/", data);
        alert("Thêm sản phẩm thành công!");
      }

      setMode("dashboard");
      fetchStats(); // refresh dashboard
    } catch (err) {
      console.error("Lỗi lưu sản phẩm:", err);
      alert("Không thể lưu sản phẩm");
    } finally {
      setLoadingForm(false);
    }
  };

  // Chart data
  const revenueData = {
    labels: stats?.revenue_by_day.map((d) => d.date) || [],
    datasets: [
      {
        label: "Doanh thu",
        data: stats?.revenue_by_day.map((d) => d.revenue) || [],
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4,
      },
    ],
  };

  const topProductsData = {
    labels: stats?.top_products.map((p) => p.name) || [],
    datasets: [
      {
        label: "Số lượng bán",
        data: stats?.top_products.map((p) => p.quantity) || [],
        backgroundColor: ["#3b82f6", "#f97316", "#10b981", "#f43f5e", "#8b5cf6"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" }, title: { display: false } },
  };

  return (
    <SellerPage>
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {mode === "dashboard" && (
          <>
            <h1 className="text-2xl font-bold mb-6">Dashboard thống kê</h1>
            <button
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
              onClick={() => handleEditProduct(null)}
            >
              Thêm sản phẩm mới
            </button>

            {loadingStats ? (
              <p>Đang tải...</p>
            ) : !stats ? (
              <p>Không có dữ liệu</p>
            ) : (
              <>
                {/* Thống kê nhanh */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-100 rounded shadow">
                    <h2 className="text-lg font-semibold">Doanh thu hôm nay</h2>
                    <p className="text-xl font-bold">
                      {stats.revenue_by_day.at(-1)?.revenue ?? 0} ₫
                    </p>
                  </div>
                  <div className="p-4 bg-purple-100 rounded shadow">
                    <h2 className="text-lg font-semibold">Đơn hàng</h2>
                    <p className="text-xl font-bold">
                      {stats.orders_by_status.reduce((sum, o) => sum + o.count, 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-100 rounded shadow">
                    <h2 className="text-lg font-semibold">Sản phẩm bán chạy</h2>
                    <p className="text-xl font-bold">{stats.top_products.length}</p>
                  </div>
                  <div className="p-4 bg-green-100 rounded shadow">
                    <h2 className="text-lg font-semibold">Tổng sản phẩm</h2>
                    <p className="text-xl font-bold">
                      {stats.top_products.reduce((sum, p) => sum + p.quantity, 0)}
                    </p>
                  </div>
                </div>

                {/* Biểu đồ */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Doanh thu 7 ngày gần nhất</h2>
                    <Line key={JSON.stringify(revenueData)} data={revenueData} options={chartOptions} />
                  </div>

                  <div className="p-4 bg-white rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Top sản phẩm bán chạy</h2>
                    <Doughnut key={JSON.stringify(topProductsData)} data={topProductsData} options={chartOptions} />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {(mode === "add" || mode === "edit") && (
          <div className="p-6 max-w-2xl mx-auto">
            <div className="bg-white shadow-xl rounded-2xl p-6 border">
              <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
                {mode === "add" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
              </h1>
              <form onSubmit={handleSubmitForm} className="space-y-5">
                {/* Các input giống như form AddProduct */}
                {/* Tên sản phẩm */}
                <div>
                  <label className="block font-semibold mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    name="name"
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Mô tả */}
                <div>
                  <label className="block font-semibold mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
                {/* Danh mục */}
                <div>
                  <label className="block font-semibold mb-1">Danh mục</label>
                  <input
                    type="text"
                    name="category"
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
                {/* Giá & Số lượng */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Giá</label>
                    <input
                      type="number"
                      name="price"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Số lượng</label>
                    <input
                      type="number"
                      name="stock"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {/* Upload hình ảnh */}
                <div>
                  <label className="block font-semibold mb-1">Hình ảnh</label>
                  <div className="flex items-center gap-4">
                    <input type="file" name="image" id="image" onChange={handleChange} className="hidden" />
                    <label
                      htmlFor="image"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer flex items-center gap-2 hover:bg-blue-500 transition"
                    >
                      <Upload size={18} /> Chọn ảnh
                    </label>
                    {preview && (
                      <div className="relative">
                        <img src={preview} alt="preview" className="h-20 w-20 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => setPreview(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Trạng thái */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5" />
                  <label className="font-semibold">Kích hoạt sản phẩm</label>
                </div>
                {/* Buttons */}
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => setMode("dashboard")} className="px-5 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-300 transition">
                    Hủy
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-500 transition" disabled={loadingForm}>
                    {loadingForm ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Đang lưu...
                      </>
                    ) : (
                      "Lưu sản phẩm"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SellerPage>
  );
}
