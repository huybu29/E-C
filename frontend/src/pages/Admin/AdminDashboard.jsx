import { act, useState } from "react";
import { Users, ShoppingCart, Package, BarChart } from "lucide-react";
import UserManagement from "./AdminUserManagement";
import OrderManagement from "./AdminOrderManagement";
import ProductManagement from "./AdminProductManagement";
import StatsPage from "./AdminStatPage";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("users");

  const menu = [
    { key: "users", label: "Users", icon: <Users size={20} /> },
    { key: "orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { key: "products", label: "Products", icon: <Package size={20} /> },
    { key: "stats", label: "Statistics", icon: <BarChart size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#EAEFEF]">
      {/* Sidebar */}
      <div className="w-64 bg-[#333446] text-white p-5 shadow-lg">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <ul className="space-y-2">
          {menu.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setActivePage(item.key)}
                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition ${
                  activePage === item.key
                    ? "bg-[#7F8CAA] text-white"
                    : "hover:bg-[#7F8CAA]/50"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activePage === "users" && <UserManagement />}
        {activePage === "orders" && <OrderManagement />}
        {activePage === "products" && <ProductManagement />}
        {activePage === "stats" && <StatsPage />}
        {activePage === "userDetail" && <UserDetail />}
      </div>
    </div>
  );
}
