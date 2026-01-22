export default function Topbar() {
  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-4 d-flex justify-content-between">
      <div></div>

      <div className="d-flex align-items-center gap-4">

        <i className="bi bi-bell fs-4 position-relative">
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3
          </span>
        </i>

        <div className="dropdown">
          <button className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
            <img
              src="https://i.pravatar.cc/40"
              className="rounded-circle me-2"
              alt="profile"
            />
            Profile
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
