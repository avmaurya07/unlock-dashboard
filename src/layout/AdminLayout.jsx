import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="ventic-shell">
      <AdminSidebar collapsed={collapsed} />

      <div className="ventic-main">
        <AdminTopbar onToggleSidebar={() => setCollapsed((v) => !v)} />

        <div className="ventic-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
