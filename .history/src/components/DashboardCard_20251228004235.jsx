export default function DashboardCard({ title, count, color }) {
  return (
    <div className="card shadow-sm p-3">
      <h6 className="fw-bold">{title}</h6>
      <h2 className="fw-bold" style={{ color }}>{count}</h2>
    </div>
  );
}
