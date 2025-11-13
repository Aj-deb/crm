import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, RefreshCcw, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🧩 Load Customers
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (err) {
      console.error("❌ Failed to load customers:", err);
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // 🗑️ Delete Customer
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`${API_BASE}/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(customers.filter((c) => c._id !== id));
    } catch (err) {
      console.error("❌ Delete customer failed:", err);
      alert("Failed to delete customer");
    }
  };

  // 🔍 Filter Logic
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.assignedTo?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded-lg pl-8"
            />
            <Search
              size={16}
              className="absolute left-2 top-2.5 text-gray-400"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={loadCustomers}
            className="flex items-center gap-1 bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-700">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "Company",
                  "Source",
                  "Assigned To",
                  "Converted By",
                  "Created At",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-8 text-gray-500 italic"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50 transition border-b last:border-0"
                  >
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{c.email || "—"}</td>
                    <td className="px-4 py-3">{c.phone || "—"}</td>
                    <td className="px-4 py-3">{c.company || "—"}</td>
                    <td className="px-4 py-3">{c.source || "—"}</td>
                    <td className="px-4 py-3">
                      {c.assignedTo
                        ? `${c.assignedTo.name} (${c.assignedTo.role})`
                        : "Auto"}
                    </td>
                    <td className="px-4 py-3">
                      {c.convertedBy
                        ? `${c.convertedBy.name || "System"}`
                        : "System"}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
