import { logout } from "../../utils/auth";

export default function PublisherTopbar({ onToggle }) {
  return (
    <div className="ventic-topbar">
      <button className="btn btn-light ventic-icon-btn" onClick={onToggle}>
        <i className="bi bi-list" />
      </button>

      <div className="ventic-topbar__right">
        <button className="btn btn-light ventic-icon-btn position-relative">
          <i className="bi bi-bell" />
          <span className="badge bg-danger ventic-badge">3</span>
        </button>

        <div className="dropdown">
          <button
            className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="rounded-circle"
              width="32"
              height="32"
            />
            <span className="fw-semibold">Profile</span>
          </button>

          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item">My Profile</button></li>
            <li>
              <button
                className="dropdown-item text-danger"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
