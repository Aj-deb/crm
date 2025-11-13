import { useEffect, useMemo, useState } from "react";
import {
  fetchUsers,
  fetchUserProfile,
  updateUserRoleStatus,
  deactivateUser,
} from "../api/users";
import { Plus, Eye, Power, X, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selUser, setSelUser] = useState(null);
  const [detail, setDetail] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  // Load all users
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) =>
      [r.name, r.email, r.role].join(" ").toLowerCase().includes(q.toLowerCase())
    );
  }, [rows, q]);

  // VIEW USER DETAILS
  const openDetail = async (user) => {
    setSelUser(user);
    setDetail(null);
    try {
      const d = await fetchUserProfile(user._id);
      setDetail(d);
    } catch (e) {
      console.error("Error loading profile", e);
      setDetail({ error: true });
    }
  };

  const closeDetail = () => {
    setSelUser(null);
    setDetail(null);
  };

  // ROLE CHANGE
  const changeRole = async (id, role) => {
    setSavingId(id);
    try {
      await updateUserRoleStatus(id, { role });
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, role } : r))
      );
    } finally {
      setSavingId(null);
    }
  };

  // ACTIVATE / DEACTIVATE USER
  const toggleActive = async (u) => {
    try {
      if (u.status === "inactive") {
        await updateUserRoleStatus(u._id, { status: "active" });
        setRows((prev) =>
          prev.map((r) =>
            r._id === u._id ? { ...r, status: "active" } : r
          )
        );
      } else {
        await deactivateUser(u._id);
        setRows((prev) =>
          prev.map((r) =>
            r._id === u._id ? { ...r, status: "inactive" } : r
          )
        );
      }
    } catch (err) {
      console.error("Status change failed", err);
    }
  };

  // ADD NEW USER
  const addUser = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to add user");
      } else {
        const data = await res.json();
        alert("✅ User created successfully!");
        setRows((prev) => [
          ...prev,
          {
            _id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: "active",
            metrics: { leadsAssigned: 0, leadsConverted: 0, customersOwned: 0, conversion: 0 },
          },
        ]);
        setShowAdd(false);
        setForm({ name: "", email: "", password: "", role: "" });
      }
    } catch (err) {
      alert("Error creating user: " + err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users..."
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-gray-700">
            <tr>
              {[
                "Name",
                "Email",
                "Role",
                "Leads",
                "Converted",
                "Conversion %",
                "Customers",
                "Last Active",
                "Status",
                "Actions",
              ].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold text-left">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-6">
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      disabled={savingId === u._id}
                      className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="sales">Sales</option>
                      <option value="support">Support</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">{u.metrics.leadsAssigned}</td>
                  <td className="px-4 py-3">{u.metrics.leadsConverted}</td>
                  <td className="px-4 py-3">{u.metrics.conversion}%</td>
                  <td className="px-4 py-3">{u.metrics.customersOwned}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button
                      onClick={() => openDetail(u)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      onClick={() => toggleActive(u)}
                      className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                    >
                      <Power size={16} />{" "}
                      {u.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* USER DETAIL DRAWER */}
      {selUser && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex justify-end"
          onClick={closeDetail}
        >
          <div
            className="bg-white w-[420px] h-full shadow-xl p-6 overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-lg">{selUser.name}</h2>
                <p className="text-sm text-gray-500">{selUser.email}</p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-700"
                onClick={closeDetail}
              >
                <X size={20} />
              </button>
            </div>

            {!detail ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-500" size={28} />
              </div>
            ) : detail.error ? (
              <p className="text-red-600">Failed to load user details.</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Stat label="Leads" value={selUser.metrics.leadsAssigned} />
                  <Stat label="Converted" value={selUser.metrics.leadsConverted} />
                  <Stat label="Customers" value={selUser.metrics.customersOwned} />
                </div>

                <Section title="Recent Leads">
                  {detail.recent.leads.length ? (
                    <ul className="space-y-2">
                      {detail.recent.leads.map((l) => (
                        <li
                          key={l._id}
                          className="p-2 border rounded text-sm flex justify-between"
                        >
                          <span>{l.name}</span>
                          <span className="text-xs text-gray-500">{l.status}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No leads found.</p>
                  )}
                </Section>

                <Section title="Recent Customers">
                  {detail.recent.customers.length ? (
                    <ul className="space-y-2">
                      {detail.recent.customers.map((c) => (
                        <li key={c._id} className="p-2 border rounded text-sm">
                          {c.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No customers found.</p>
                  )}
                </Section>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[420px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add New User</h2>
              <button onClick={() => setShowAdd(false)}>
                <X size={20} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <form onSubmit={addUser} className="space-y-4">
              <input
                required
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                required
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email Address"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="password"
                required
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                required
                name="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
              <button
                type="submit"
                disabled={adding}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
              >
                {adding ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border rounded p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}
