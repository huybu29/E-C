// src/pages/admin/SystemStatsEnhanced.jsx
import { useEffect, useState } from "react";
import AdminPage from "./AdminPage";
import api from "../../services/api";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function SystemStatsEnhanced() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    orderStatus: [],
    productCategories: [],
    userGrowth: [],
    revenuePerDay: [],
  });

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

  const fetchStats = async () => {
    try {
      const res = await api.get("/account/admin/stats/");
      setStats({
        totalUsers: res.data.total_users,
        totalSellers: res.data.total_sellers,
        totalProducts: res.data.total_products,
        totalOrders: res.data.total_orders,
        revenue: res.data.revenue,
        orderStatus: res.data.orderStatus || [],
        productCategories: res.data.productCategories || [],
        userGrowth: res.data.userGrowth || [],
        revenuePerDay: res.data.revenuePerDay || [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#3B0A4F] p-2 rounded shadow text-white border border-[#4E1883]">
          <p className="font-bold">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
              ></span>
              {p.name}:{" "}
              {p.dataKey === "total"
                ? Number(p.value).toLocaleString("vi-VN")
                : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Top cards
  const topCards = [
    { label: "Total Users", value: stats.totalUsers, color: "#82ca9d" },
    { label: "Total Sellers", value: stats.totalSellers, color: "#8884d8" },
    { label: "Total Products", value: stats.totalProducts, color: "#ffc658" },
    { label: "Total Orders", value: stats.totalOrders, color: "#ff8042" },
    {
      label: "Revenue (VND)",
      value: stats.revenue.toLocaleString("vi-VN"),
      color: "#00C49F",
    },
  ];

  return (
    <AdminPage>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-purple-400">
          System Dashboard
        </h1>

        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {topCards.map((card) => (
            <div
              key={card.label}
              className="bg-[#2A083B] rounded-lg shadow-xl p-6 border border-[#4E1883] text-white hover:scale-105 transition-transform"
            >
              <p className="text-gray-400">{card.label}</p>
              <p className="text-3xl font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie chart: Order status */}
          <div className="bg-[#2A083B] rounded-lg shadow-xl p-6 border border-[#4E1883] text-white">
            <h2 className="text-xl font-bold mb-4 text-purple-400">
              Order Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.orderStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={(entry) => `${entry.status} (${entry.count})`}
                  isAnimationActive
                >
                  {stats.orderStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart: Products per category */}
          <div className="bg-[#2A083B] rounded-lg shadow-xl p-6 border border-[#4E1883] text-white">
            <h2 className="text-xl font-bold mb-4 text-purple-400">
              Products per Category
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.productCategories}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4E1883" />
                <XAxis dataKey="category_name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#82ca9d"
                  isAnimationActive
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart: User growth (daily) */}
          <div className="bg-[#2A083B] rounded-lg shadow-xl p-6 border border-[#4E1883] text-white md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-purple-400">
              User Growth (Daily)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.userGrowth}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4E1883" />
                <XAxis dataKey="day" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#ffc658"
                  isAnimationActive
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart: Revenue per day */}
          <div className="bg-[#2A083B] rounded-lg shadow-xl p-6 border border-[#4E1883] text-white md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-purple-400">
              Revenue per Day (VND)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={stats.revenuePerDay}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4E1883" />
                <XAxis dataKey="day" stroke="#fff" />
                <YAxis
                  stroke="#fff"
                  tickFormatter={(value) => value.toLocaleString("vi-VN")}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Revenue"
                  stroke="#00C49F"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
