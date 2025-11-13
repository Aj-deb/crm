import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis,
  Legend
} from "recharts";
import { RefreshCcw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a855f7"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  const loadAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("❌ Failed to load analytics:", err);
      alert("Failed to load analytics");
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (!data) {
    return <div className="p-6 text-center text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CRM Analytics Dashboard</h1>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-1 bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-blue-100 p-4 rounded-xl shadow">
          <h2 className="text-gray-700 font-semibold">Total Leads</h2>
          <p className="text-3xl font-bold text-blue-700">{data.totalLeads}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl shadow">
          <h2 className="text-gray-700 font-semibold">Converted</h2>
          <p className="text-3xl font-bold text-green-700">{data.convertedLeads}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl shadow">
          <h2 className="text-gray-700 font-semibold">Pending</h2>
          <p className="text-3xl font-bold text-yellow-700">{data.pendingLeads}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl shadow">
          <h2 className="text-gray-700 font-semibold">Conversion Rate</h2>
          <p className="text-3xl font-bold text-purple-700">{data.conversionRate}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Lead Source Pie */}
        <div className="bg-white p-4 rounded-xl shadow border">
          <h3 className="text-lg font-semibold mb-3">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.sourceStats}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {data.sourceStats.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow border">
          <h3 className="text-lg font-semibold mb-3">Leads by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.priorityStats}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Performance Table */}
      <div className="bg-white border rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-3">User Performance</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-gray-700">
            <tr>
              {["Name", "Role", "Rating", "Leads", "Customers", "Conversion %"].map((h) => (
                <th key={h} className="px-4 py-2 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.userPerformance.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No sales user data yet.
                </td>
              </tr>
            ) : (
              data.userPerformance.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-gray-50 transition border-b last:border-0"
                >
                  <td className="px-4 py-2 font-medium">{u.name}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">{u.performanceRating.toFixed(1)}⭐</td>
                  <td className="px-4 py-2">{u.totalLeads}</td>
                  <td className="px-4 py-2">{u.totalCustomers}</td>
                  <td className="px-4 py-2">{u.conversionRate}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
