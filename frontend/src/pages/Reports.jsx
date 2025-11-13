import { useState } from "react";
import axios from "axios";
import { Download, Filter, RefreshCcw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    source: "",
    priority: "",
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await axios.get(`${API_BASE}/report?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data);
    } catch (err) {
      console.error("❌ Load report:", err);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ["Name", "Email", "Phone", "Company", "Source", "Priority", "Status", "Assigned To"],
      ...report.leads.map((l) => [
        l.name, l.email, l.phone, l.company, l.source, l.priority, l.status,
        l.assignedTo?.name || "—",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "crm_report.csv";
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CRM Reports</h1>
        <div className="flex gap-2">
          <button onClick={loadReport} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded">
            <Filter size={16} /> Generate
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded">
            <Download size={16} /> CSV
          </button>
          <button onClick={() => setReport(null)} className="flex items-center gap-1 bg-gray-200 px-3 py-1.5 rounded">
            <RefreshCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded shadow">
        <div>
          <label className="text-sm font-semibold text-gray-600">Start Date</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">End Date</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Source</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          >
            <option value="">All</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Email Campaign">Email Campaign</option>
            <option value="Advertisement">Advertisement</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Priority</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      {report && (
        <>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-blue-100 p-4 rounded shadow">
              <h2 className="font-semibold text-gray-700">Total Leads</h2>
              <p className="text-3xl font-bold text-blue-700">{report.totalLeads}</p>
            </div>
            <div className="bg-green-100 p-4 rounded shadow">
              <h2 className="font-semibold text-gray-700">Total Customers</h2>
              <p className="text-3xl font-bold text-green-700">{report.totalCustomers}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded shadow">
              <h2 className="font-semibold text-gray-700">Conversion Rate</h2>
              <p className="text-3xl font-bold text-purple-700">{report.conversionRate}%</p>
            </div>
          </div>

          {/* Lead Table */}
          <div className="bg-white border rounded shadow mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b text-gray-700">
                <tr>
                  {["Name","Email","Company","Source","Priority","Status","Assigned To"].map((h)=>(
                    <th key={h} className="px-4 py-2 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.leads.map((l)=>(
                  <tr key={l._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{l.name}</td>
                    <td className="px-4 py-2">{l.email || "—"}</td>
                    <td className="px-4 py-2">{l.company || "—"}</td>
                    <td className="px-4 py-2">{l.source || "—"}</td>
                    <td className="px-4 py-2">{l.priority}</td>
                    <td className="px-4 py-2">{l.status}</td>
                    <td className="px-4 py-2">{l.assignedTo?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="text-center text-gray-500 italic py-10">
          Generate a report to view results
        </div>
      )}
    </div>
  );
}
