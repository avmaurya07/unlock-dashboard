export default function AdminTopbar({ onToggleSidebar }) {
  return (
    <div className="ventic-topbar">
      <button className="btn btn-light border" onClick={onToggleSidebar}>
        <i className="bi bi-list" />
      </button>

      <div className="ventic-topbar__right">
        <button className="btn btn-light border position-relative">
          <i className="bi bi-bell" />
          <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
            3
          </span>
        </button>

        <div className="dropdown">
          <button
            className="btn btn-light border dropdown-toggle d-flex align-items-center gap-2"
            data-bs-toggle="dropdown"
          >
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="rounded-circle"
              width="28"
              height="28"
            />
            <span className="d-none d-md-inline">Admin</span>
          </button>

          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item">Profile</button></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                className="dropdown-item text-danger"
                onClick={() => {
                  localStorage.removeItem("token");
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
