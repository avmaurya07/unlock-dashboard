import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", icon: "bi-speedometer2", path: "/dashboard/publisher" },
    { name: "Events", icon: "bi-calendar-event", path: "/dashboard/publisher/events" },
    { name: "Jobs", icon: "bi-briefcase", path: "/dashboard/publisher/jobs" },
    { name: "Startup Funding Calls", icon: "bi-cash-stack", path: "/dashboard/publisher/funding-calls" },
    { name: "Investor Programs", icon: "bi-graph-up-arrow", path: "/dashboard/publisher/investor-programs" },
    { name: "Competitions", icon: "bi-trophy", path: "/dashboard/publisher/competitions" },
    { name: "Workshops", icon: "bi-easel", path: "/dashboard/publisher/workshops" }
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">Unlock</div>

      <ul className="sidebar-menu list-unstyled">
        {menu.map((item) => (
          <li key={item.name}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) =>
                "sidebar-link " + (isActive ? "active" : "")
              }
            >
              <i className={`bi ${item.icon} me-3`}></i>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
