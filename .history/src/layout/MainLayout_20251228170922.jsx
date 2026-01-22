import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh", width: "100vw", overflowX: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "260px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column bg-light" style={{ width: "100%" }}>
        <Topbar />

        <div className="p-4" style={{ width: "100%", flexGrow: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
