import { useEffect, useState } from "react";
import API from "../../services/api";
import SellerPage from "./SellerPage"; 
import { Line, Doughnut } from "react-chartjs-2";
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
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("day"); // "day" | "week" | "month"

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
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-400">Đang tải...</p>;
  if (!stats)
    return <p className="text-center mt-10 text-red-400">Không có dữ liệu</p>;

  // Dữ liệu biểu đồ doanh thu tùy theo period
  let revenueSource = [];
  if (period === "day") revenueSource = stats.revenue_by_day;
  if (period === "week") revenueSource = stats.revenue_by_week;
  if (period === "month") revenueSource = stats.revenue_by_month;

  const revenueData = {
    labels: revenueSource.map((d) => d.date || d.week || d.month),
    datasets: [
      {
        label: "Doanh thu",
        data: revenueSource.map((d) => d.revenue),
        borderColor: "rgba(147,51,234,1)", // purple-600
        backgroundColor: "rgba(147,51,234,0.2)",
        tension: 0.4,
      },
    ],
  };

  const topProductsData = {
    labels: stats.top_products.map((p) => p.name),
    datasets: [
      {
        label: "Số lượng bán",
        data: stats.top_products.map((p) => p.quantity),
        backgroundColor: ["#3b82f6", "#f97316", "#10b981", "#f43f5e", "#8b5cf6"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#E5E7EB" } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: "#E5E7EB" }, grid: { color: "#374151" } },
      y: { ticks: { color: "#E5E7EB" }, grid: { color: "#374151" } },
    },
  };

  return (
    <SellerPage>
      <div className="flex-1 p-6 bg-gray-900 min-h-screen text-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-purple-400">Dashboard thống kê</h1>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-800 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-200">Doanh thu hôm nay</h2>
            <p className="text-xl font-bold text-green-400">
              {stats.revenue_by_day.at(-1)?.revenue ?? 0} ₫
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-200">Đơn hàng</h2>
            <p className="text-xl font-bold text-blue-400">
              {stats.orders_by_status.reduce((sum, o) => sum + o.count, 0)}
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-200">Sản phẩm bán chạy</h2>
            <p className="text-xl font-bold text-orange-400">{stats.top_products.length}</p>
          </div>
          <div className="p-4 bg-gray-800 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-200">Tổng sản phẩm</h2>
            <p className="text-xl font-bold text-purple-400">
              {stats.top_products.reduce((sum, p) => sum + p.quantity, 0)}
            </p>
          </div>
        </div>

        {/* Biểu đồ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-800 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-200">Doanh thu</h2>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-1 border border-gray-600"
              >
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
              </select>
            </div>
            <Line
              key={period}
              data={revenueData}
              options={chartOptions}
            />
          </div>

          <div className="p-4 bg-gray-800 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              Top sản phẩm bán chạy
            </h2>
            <Doughnut
              key={JSON.stringify(topProductsData)}
              data={topProductsData}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </SellerPage>
  );
}
