export default function DashboardCard({ title, count, color }) {
  return (
    <div className="card-v" style={{ width: "250px" }}>
      <h6 className="fw-bold mb-2">{title}</h6>
      <h2 style={{ color, fontWeight: "700" }}>{count}</h2>
    </div>
  );
}
