export default function StatsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#333446]">Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#B8CFCE] p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-[#333446]">Total Users</h2>
          <p className="text-2xl">120</p>
        </div>
        <div className="bg-[#B8CFCE] p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-[#333446]">Total Orders</h2>
          <p className="text-2xl">350</p>
        </div>
        <div className="bg-[#B8CFCE] p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-[#333446]">Revenue</h2>
          <p className="text-2xl">$12,400</p>
        </div>
      </div>
    </div>
  );
}
