// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/authStore";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart2,
  FolderOpen,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    if (user?.role) setRole(user.role.toLowerCase());
  }, [user]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/", { replace: true });
    window.location.reload(); // ensures ProtectedRoute re-checks instantly
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, roles: ["admin", "manager", "sales", "support", "viewer"] },
    { to: "/leads", label: "Leads", icon: <FolderOpen size={18} />, roles: ["admin", "manager", "sales"] },
    { to: "/customers", label: "Customers", icon: <Users size={18} />, roles: ["admin", "manager", "sales"] },
    { to: "/analytics", label: "Analytics", icon: <BarChart2 size={18} />, roles: ["admin", "manager"] },
    { to: "/reports", label: "Reports", icon: <FileText size={18} />, roles: ["admin", "manager", "support", "viewer"] },
    { to: "/settings", label: "Settings", icon: <Settings size={18} />, roles: ["admin", "manager", "sales"] },
    { to: "/users", label: "User Management", icon: <UserCog size={18} />, roles: ["admin"] },
  ];

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 w-full flex justify-between items-center bg-gray-900 text-white px-4 py-3 z-50 shadow-lg">
        <h2 className="text-lg font-bold">CRM Dashboard</h2>
        <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-gray-900 text-gray-100 shadow-lg flex flex-col justify-between transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div>
          <div className="hidden md:flex p-5 border-b border-gray-800 items-center justify-between">
            <h1 className="text-xl font-bold">CRM Dashboard</h1>
          </div>

          {user && (
            <div className="p-4 border-b border-gray-800 bg-gray-950/40">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{role || "sales"}</p>
            </div>
          )}

          <ul className="p-3 flex-1 overflow-y-auto space-y-1">
            {links
              .filter((link) => link.roles.includes(role || "sales"))
              .map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)} // ✅ closes sidebar only on mobile
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${location.pathname === link.to
                        ? "bg-blue-600 text-white shadow-md"
                        : "hover:bg-gray-800 text-gray-300"
                      }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        {user && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Background overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/40 md:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  );
}
