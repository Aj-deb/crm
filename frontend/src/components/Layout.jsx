import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-neutral-900">
      {/* Sidebar (always visible) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet /> {/* 👈 all pages (Dashboard, Leads, etc.) will render here */}
      </div>
    </div>
  );
}
