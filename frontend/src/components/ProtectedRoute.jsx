import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = localStorage.getItem("token");
      console.log("🔍 Checking token:", token?.slice(0, 30));

      if (!token) {
        console.warn("⚠️ No token found.");
        setAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          console.log("✅ Auth verified");
          setAuthenticated(true);
        } else {
          console.warn("⚠️ Auth not verified, status:", res.status);
          setAuthenticated(false);
        }
      } catch (err) {
        console.error("❌ Auth check failed:", err.response?.data || err.message);
        localStorage.removeItem("token");
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    }, 200); // wait 200ms for token to sync

    return () => clearTimeout(timer);
  }, []);

  if (checking) return <div>Checking authentication...</div>;
  if (!authenticated) return <Navigate to="/" replace />;
  return children;
}
