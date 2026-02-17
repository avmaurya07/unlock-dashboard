export default function DashboardCard({ title, count, color, disabled }) {
  return (
    <div className={`dashboard-card ${disabled ? "disabled" : ""}`} style={{ ['--accent']: color }}>
      <div className="dashboard-card-body">
        <h6 className="fw-bold mb-1 dashboard-title">{title}</h6>
        <h2 className="dashboard-count">{count}</h2>
        {disabled && <div className="text-muted small">Requires active subscription</div>}
      </div>
    </div>
  );
}
