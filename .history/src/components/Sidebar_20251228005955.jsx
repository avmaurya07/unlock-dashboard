import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar bg-white shadow-sm" style={{ width: "250px", minHeight: "100vh" }}>
      <div className="p-3 border-bottom">
        <h4 className="fw-bold">Unlock</h4>
      </div>

      <ul className="list-group list-group-flush mt-3">
        <Link to="/dashboard/publisher" className="list-group-item list-group-item-action">
          <i className="bi bi-speedometer2 me-2"></i> Dashboard
        </Link>

        <Link to="/dashboard/publisher/events" className="list-group-item list-group-item-action">
          <i className="bi bi-calendar-event me-2"></i> Events
        </Link>

        <Link to="/jobs" className="list-group-item list-group-item-action">
          <i className="bi bi-briefcase me-2"></i> Jobs
        </Link>

        <Link to="/funding-calls" className="list-group-item list-group-item-action">
          <i className="bi bi-cash-stack me-2"></i> Startup Funding Calls
        </Link>

        <Link to="/investor-programs" className="list-group-item list-group-item-action">
          <i className="bi bi-graph-up-arrow me-2"></i> Investor Programs
        </Link>

        <Link to="/competitions" className="list-group-item list-group-item-action">
          <i className="bi bi-trophy me-2"></i> Competitions
        </Link>

        <Link to="/workshops" className="list-group-item list-group-item-action">
          <i className="bi bi-easel me-2"></i> Workshops
        </Link>
      </ul>
    </div>
  );
}
