import DashboardCard from "../components/DashboardCard";
import MainLayout from "../layout/MainLayout";

export default function Dashboard() {
  return (
    <div>
      <h3 className="fw-bold mb-4">Dashboard</h3>

      <div className="row g-4">
        <div className="col-md-3">
          <DashboardCard title="Events" count="12" color="#1abc9c" />
        </div>

        <div className="col-md-3">
          <DashboardCard title="Jobs" count="5" color="#e74c3c" />
        </div>

        <div className="col-md-3">
          <DashboardCard title="Startup Funding Calls" count="7" color="#9b59b6" />
        </div>

        <div className="col-md-3">
          <DashboardCard title="Investor Programs" count="3" color="#3498db" />
        </div>
      </div>
    </div>
  );
}
