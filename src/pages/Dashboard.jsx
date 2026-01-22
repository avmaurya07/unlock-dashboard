import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {
  return (
    <div style={{ width: "100%" }}>
      <h2 className="fw-bold mb-4">Dashboard</h2>

      <div className="d-flex gap-4 flex-wrap">
        <DashboardCard title="Events" count={12} color="#1abc9c" />
        <DashboardCard title="Jobs" count={5} color="#e74c3c" />
        <DashboardCard title="Startup Funding Calls" count={7} color="#9b59b6" />
        <DashboardCard title="Investor Programs" count={3} color="#3498db" />
      </div>
    </div>
  );
}
