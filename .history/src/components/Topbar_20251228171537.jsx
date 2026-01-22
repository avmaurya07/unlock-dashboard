export default function Topbar() {
  return (
    <nav className="topbar shadow-sm">
      <div></div>

      <div className="d-flex align-items-center gap-4">

        <div className="notification-wrapper position-relative">
          <i className="bi bi-bell fs-4"></i>
          <span className="badge bg-danger rounded-pill notif-badge">3</span>
        </div>

        <div className="dropdown">
          <button className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle" data-bs-toggle="dropdown">
            <img src="https://i.pravatar.cc/40" className="rounded-circle" />
            <span className="fw-semibold">Profile</span>
          </button>

          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item">Settings</button></li>
            <li><button className="dropdown-item">Logout</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
