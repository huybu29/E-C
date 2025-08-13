import { useEffect, useState } from "react";
import API from "../../services/api";
import SellerPage from "./SellerPage"; // Component có sidebar
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

  if (loading) return <p>Đang tải...</p>;
  if (!stats) return <p>Không có dữ liệu</p>;

  const revenueData = {
    labels: stats.revenue_by_day.map((d) => d.date),
    datasets: [
      {
        label: "Doanh thu",
        data: stats.revenue_by_day.map((d) => d.revenue),
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.2)",
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
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <SellerPage>
      {/* Main content bên phải sidebar */}
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Dashboard thống kê</h1>

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
            <h2 className="text-xl font-semibold mb-4">
              Doanh thu 7 ngày gần nhất
            </h2>
            <Line
              key={JSON.stringify(revenueData)}
              data={revenueData}
              options={chartOptions}
            />
          </div>

          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Top sản phẩm bán chạy</h2>
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
        