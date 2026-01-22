import { Outlet } from "react-router-dom";
import PublisherSidebar from "../components/publisher/PublisherSidebar";
import PublisherTopbar from "../components/publisher/PublisherTopbar";
import { useState } from "react";

export default function PublisherLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="ventic-shell">
      <PublisherSidebar collapsed={collapsed} />

      <div className="ventic-main">
        <PublisherTopbar onToggle={() => setCollapsed((v) => !v)} />
        <div className="ventic-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
