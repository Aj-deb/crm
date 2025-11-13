import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, ArrowRightCircle, RefreshCcw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    assignedTo: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadLeads();
    loadUsers();
  }, []);

  const loadLeads = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data);
    } catch (err) {
      console.error("Load leads error", err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Load users error", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/leads`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Lead added");
      setLeads([...leads, res.data.lead]);
      setForm({ name: "", email: "", phone: "", company: "", source: "", assignedTo: "" });
    } catch {
      alert("❌ Failed to add");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this lead?")) return;
    await axios.delete(`${API_BASE}/leads/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeads(leads.filter((l) => l._id !== id));
  };

  const updateStatus = async (id, status) => {
    await axios.patch(
      `${API_BASE}/leads/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadLeads();
  };

  const convertLead = async (id) => {
    try {
      await axios.post(`${API_BASE}/leads/${id}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Converted to customer");
      loadLeads();
    } catch (err) {
      alert("❌ Conversion failed");
      console.log(err.response?.data);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button
          onClick={loadLeads}
          className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Add Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white border p-4 rounded-lg shadow-sm mb-6 grid grid-cols-6 gap-3"
      >
        <input placeholder="Name" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-3 py-2" />
        <input placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded px-3 py-2" />
        <input placeholder="Phone" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border rounded px-3 py-2" />
        <input placeholder="Company" value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })} className="border rounded px-3 py-2" />
        <select value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
          className="border rounded px-3 py-2">
          <option value="">Source...</option>
          <option>Manual</option><option>Website</option>
          <option>Social Media</option><option>Email Campaign</option>
          <option>Referral</option><option>Advertisement</option>
        </select>
        <select value={form.assignedTo}
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          className="border rounded px-3 py-2">
          <option value="">Assign To...</option>
          {users.filter(u=>u.role!=="admin"&&u.status==="active").map(u=>(
            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
          ))}
        </select>
        <div className="col-span-6">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg">Add Lead</button>
        </div>
      </form>

      {/* Leads Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-gray-700">
            <tr>
              {["Name","Email","Phone","Company","Source","Priority","Rating","Status","Assigned","Actions"]
                .map(h=><th key={h} className="px-4 py-2 text-left font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {leads.map(l=>(
              <tr key={l._id} className="hover:bg-gray-50 border-b">
                <td className="px-4 py-2">{l.name}</td>
                <td className="px-4 py-2">{l.email}</td>
                <td className="px-4 py-2">{l.phone}</td>
                <td className="px-4 py-2">{l.company}</td>
                <td className="px-4 py-2">{l.source}</td>
                <td className="px-4 py-2 font-medium">{l.priority}</td>
                <td className="px-4 py-2 font-medium">{l.rating}</td>
                <td className="px-4 py-2">
                  <select value={l.status}
                    onChange={(e)=>updateStatus(l._id,e.target.value)}
                    className="border rounded px-2 py-1">
                    {["New","Contacted","Qualified","Converted","Lost"].map(s=>
                      <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">{l.assignedTo?.name || "Auto"}</td>
                <td className="px-4 py-2 flex gap-3">
                  {l.status!=="Converted"&&
                    <button onClick={()=>convertLead(l._id)}
                      className="text-green-600 flex items-center gap-1">
                      <ArrowRightCircle size={16}/>Convert
                    </button>}
                  <button onClick={()=>handleDelete(l._id)}
                    className="text-red-600 flex items-center gap-1">
                    <Trash2 size={16}/>Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
