import { Routes, Route, Navigate } from "react-router-dom";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/leads";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      {/* 🟢 Public Routes */}
      <Route path="/" element={<Login />} />

      {/* 🔒 Protected Layout (includes Sidebar + Outlet) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout /> {/* ✅ Sidebar + Outlet container */}
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Leads */}
        <Route path="/leads" element={<Leads />} />

        {/* Customers */}
        <Route path="/customers" element={<Customers />} />

        {/* Analytics */}
        <Route path="/analytics" element={<Analytics />} />

        {/* Reports */}
        <Route path="/reports" element={<Reports />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />

        {/* User Management */}
        <Route path="/users" element={<UserManagement />} />
      </Route>

      {/* 🧭 Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
