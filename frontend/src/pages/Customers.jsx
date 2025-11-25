// frontend/src/pages/customers.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, RefreshCcw, Search, PlusCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [notesOpenFor, setNotesOpenFor] = useState(null);
  const [noteText, setNoteText] = useState("");

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const loadCustomers = async (opts = {}) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/customers", {
        params: {
          page: opts.page || page,
          limit: opts.limit || limit,
          search: opts.search !== undefined ? opts.search : search,
        },
      });

      setCustomers(res.data.customers || []);
      setMeta(res.data.meta || { total: 0, pages: 1 });
      setPage(res.data.meta?.page || page);
      setLimit(res.data.meta?.limit || limit);
    } catch (err) {
      console.error("❌ Failed to load customers:", err);
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers({ page: 1 });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadCustomers({ page: 1, search }), 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axiosInstance.delete(`/customers/${id}`);
      loadCustomers();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete");
    }
  };

  const handleAddNote = async (customerId) => {
    const text = noteText.trim();
    if (!text) return alert("Note cannot be empty");

    try {
      await axiosInstance.post(`/customers/${customerId}/notes`, { text });
      setNoteText("");
      setNotesOpenFor(null);
      loadCustomers();
    } catch (err) {
      console.error("❌ Add note failed:", err);
      alert("Failed to add note");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold">Customers</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded-lg pl-8"
            />
            <Search size={16} className="absolute left-2 top-2.5 text-gray-400" />
          </div>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              loadCustomers({ page: 1, limit: Number(e.target.value) });
            }}
            className="border rounded px-2 py-1"
          >
            {[10, 25, 50].map((l) => (
              <option key={l} value={l}>{l} / page</option>
            ))}
          </select>

          <button
            onClick={() => loadCustomers({ page: 1 })}
            className="flex items-center gap-1 bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b text-gray-700 dark:text-gray-200">
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
                    "Notes",
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
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500 italic">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b last:border-0"
                    >
                      <td className="px-4 py-3">{c.name}</td>
                      <td className="px-4 py-3">{c.email || "—"}</td>
                      <td className="px-4 py-3">{c.phone || "—"}</td>
                      <td className="px-4 py-3">{c.company || "—"}</td>
                      <td className="px-4 py-3">{c.source || "—"}</td>
                      <td className="px-4 py-3">
                        {c.assignedTo ? `${c.assignedTo.name} (${c.assignedTo.role})` : "Auto"}
                      </td>
                      <td className="px-4 py-3">
                        {c.convertedBy ? `${c.convertedBy.name}` : "System"}
                      </td>
                      <td className="px-4 py-3">{new Date(c.createdAt).toLocaleDateString()}</td>

                      {/* NOTES COLUMN */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setNotesOpenFor(notesOpenFor === c._id ? null : c._id)}
                          className="flex items-center justify-start gap-1 text-sm underline"
                        >
                          <PlusCircle size={14} /> Notes ({(c.notes || []).length})
                        </button>

                        {notesOpenFor === c._id && (
                          <div className="mt-2 p-2 border rounded bg-gray-50 dark:bg-gray-900 w-64">
                            <div className="space-y-2 max-h-40 overflow-auto">
                              {c.notes?.length ? (
                                c.notes.slice().reverse().map((n) => (
                                  <div key={n._id} className="text-sm">
                                    <div className="text-xs text-gray-500">
                                      {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                    <div>{n.text}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-500">No notes</div>
                              )}
                            </div>

                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full mt-2 border rounded p-2"
                              placeholder="Add note..."
                            />

                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAddNote(c._id)}
                                className="px-3 py-1 rounded bg-blue-600 text-white"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => { setNotesOpenFor(null); setNoteText(""); }}
                                className="px-3 py-1 rounded border"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
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

          <div className="flex items-center justify-between mt-4">
            <div>
              Showing page {meta.page || page} / {meta.pages || 1} • Total {meta.total || 0}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={(meta.page || page) <= 1}
                onClick={() => {
                  const p = Math.max(1, (meta.page || page) - 1);
                  setPage(p);
                  loadCustomers({ page: p });
                }}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={(meta.page || page) >= (meta.pages || 1)}
                onClick={() => {
                  const p = Math.min((meta.pages || 1), (meta.page || page) + 1);
                  setPage(p);
                  loadCustomers({ page: p });
                }}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
