import DashboardCard from "../components/DashboardCard";
import MainLayout from "../layout/MainLayout";

export default function Dashboard() {
  return (
    <div style={{ width: "100%" }}>
      <h2 className="fw-bold mb-4">Dashboard</h2>

      <div className="d-flex gap-4 flex-wrap">
        <div className="card p-3 shadow-sm" style={{ width: "250px" }}>
          <h6>Events</h6>
          <h2 className="text-success">12</h2>
        </div>

        <div className="card p-3 shadow-sm" style={{ width: "250px" }}>
          <h6>Jobs</h6>
          <h2 className="text-danger">5</h2>
        </div>

        <div className="card p-3 shadow-sm" style={{ width: "250px" }}>
          <h6>Startup Funding Calls</h6>
          <h2 className="text-purple">7</h2>
        </div>

        <div className="card p-3 shadow-sm" style={{ width: "250px" }}>
          <h6>Investor Programs</h6>
          <h2 className="text-primary">3</h2>
        </div>
      </div>
    </div>
  );
}

