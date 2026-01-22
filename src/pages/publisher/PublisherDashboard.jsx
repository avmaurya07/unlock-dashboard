import DashboardCard from "../../components/DashboardCard";

export default function PublisherDashboard() {
  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      <div className="row g-4">
        <div className="col-md-3">
          <DashboardCard title="Events" count="12" color="#1dbf73" />
        </div>
        <div className="col-md-3">
          <DashboardCard title="Jobs" count="5" color="#ff5b5b" />
        </div>
        <div className="col-md-3">
          <DashboardCard title="Startup Funding Calls" count="7" color="#7c4dff" />
        </div>
        <div className="col-md-3">
          <DashboardCard title="Investor Programs" count="3" color="#2d8cff" />
        </div>
      </div>
    </div>
  );
}
