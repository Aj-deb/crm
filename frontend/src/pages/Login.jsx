import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { useAuth } from "../lib/authStore";
import { useUI } from "../lib/uiStore";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  // ✅ handle input change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // send login request
      const { data } = await api.post("/auth/login", form);

      const token = data.token;
      if (!token || typeof token !== "string" || token.length < 100) {
        console.error("🚫 Invalid token received:", token);
        showToast("Login failed: invalid token", "error");
        return;
      }

      // ✅ Save token directly to localStorage
      localStorage.setItem("token", token);

      // ✅ Sync Zustand auth store
      login(data.user, token);

      // ✅ Optional: verify storage
      console.log("✅ Token saved:", token.slice(0, 20) + "...");

      // ✅ Toast success
      showToast(`Welcome back, ${data.user.name}! 👋`, "success");

      // ✅ Redirect based on role
      if (data.user.role === "admin") navigate("/users");
      else if (["manager", "sales"].includes(data.user.role)) navigate("/customers");
      else navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      showToast(err.response?.data?.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-950 p-8 rounded-2xl shadow-lg w-96 border border-gray-200 dark:border-gray-800"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700 dark:text-blue-400">
          CRM Login
        </h1>

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold text-white transition-all ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
