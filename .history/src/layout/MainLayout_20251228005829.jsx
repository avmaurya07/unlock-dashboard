import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh", width: "100%" }}>
      <Sidebar />

      <div className="flex-grow-1 bg-light">
        <Topbar />

        <div className="p-4">
          <Outlet />  
        </div>
      </div>
    </div>
  );
}
