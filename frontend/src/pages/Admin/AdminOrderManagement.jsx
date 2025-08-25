import { useEffect, useState } from "react";
import api from "../../services/api";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/account/admin/orders/")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#333446]">Order Management</h1>
      <div className="bg-white rounded-lg shadow p-4 border border-[#B8CFCE]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#7F8CAA] text-white">
              <th className="p-3 border border-[#B8CFCE]">ID</th>
              <th className="p-3 border border-[#B8CFCE]">Customer</th>
              <th className="p-3 border border-[#B8CFCE]">Total</th>
              <th className="p-3 border border-[#B8CFCE]">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-[#EAEFEF]">
                <td className="p-3 border border-[#B8CFCE]">{o.id}</td>
                <td className="p-3 border border-[#B8CFCE]">{o.customer_name}</td>
                <td className="p-3 border border-[#B8CFCE]">${o.total_price}</td>
                <td className="p-3 border border-[#B8CFCE]">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
