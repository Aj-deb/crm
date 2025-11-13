import { useEffect, useState } from "react";
import axios from "axios";
import { RefreshCcw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Load Dashboard Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!stats)
    return (
      <div className="p-6 text-center text-gray-500">
        {loading ? "Loading Dashboard..." : "No data available"}
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <button
          onClick={loadData}
          className="flex items-center gap-1 bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Total Leads</h2>
          <p className="text-3xl font-bold text-blue-700">
            {stats.totalLeads ?? 0}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Converted Leads</h2>
          <p className="text-3xl font-bold text-green-700">
            {stats.convertedLeads ?? 0}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Total Customers</h2>
          <p className="text-3xl font-bold text-yellow-700">
            {stats.totalCustomers ?? 0}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Conversion Rate</h2>
          <p className="text-3xl font-bold text-purple-700">
            {stats.conversionRate}%
          </p>
        </div>
      </div>

      {/* Recent Leads & Customers */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Recent Leads</h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLeads.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-3 text-gray-500">
                    No recent leads.
                  </td>
                </tr>
              ) : (
                stats.recentLeads.map((lead) => (
                  <tr key={lead._id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{lead.name}</td>
                    <td className="px-3 py-2">{lead.status}</td>
                    <td className="px-3 py-2">{lead.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Recent Customers</h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Company</th>
                <th className="px-3 py-2 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCustomers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-3 text-gray-500">
                    No recent customers.
                  </td>
                </tr>
              ) : (
                stats.recentCustomers.map((cust) => (
                  <tr key={cust._id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{cust.name}</td>
                    <td className="px-3 py-2">{cust.company || "—"}</td>
                    <td className="px-3 py-2">{cust.source || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
