import { useEffect, useState } from "react";
import axios from "axios";
import { Save, RefreshCcw, Key, User, Moon } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // 🧩 Load user info
  const loadProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setForm({ name: res.data.name, email: res.data.email });
    } catch (err) {
      console.error("❌ loadProfile error:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 🧩 Update profile
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("❌ updateProfile error:", err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/users/change-password`, passwordForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Password updated successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      console.error("❌ changePassword error:", err);
      alert(err.response?.data?.message || "Failed to change password");
    }
  };

  if (!user)
    return <div className="p-6 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex items-center justify-between my-4">
          <span className="text-lg font-medium">Dark Mode</span>
          <button
            onClick={() => {
              const t = localStorage.getItem("theme") === "dark" ? "light" : "dark";
              localStorage.setItem("theme", t);
              if (t === "dark") {
                document.documentElement.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
              }
            }}
            className="flex items-end px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            {localStorage.getItem("theme") === "dark" ? "Disable" : "Enable"}
          </button>
        </div>

        <button
          onClick={loadProfile}
          className="flex items-center gap-1 bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User size={18} /> Profile
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key size={18} /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Old Password</label>
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
              }
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Save size={16} /> Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Moon size={18} /> Preferences
        </h2>
        <p className="text-gray-600 text-sm">Dark mode coming soon.</p>
      </div>
    </div>
  );
}
