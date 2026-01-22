import { NavLink } from "react-router-dom";

const menu = [
  { label: "Dashboard", icon: "bi-grid", to: "/publisher/dashboard" },
  { label: "Profile", icon: "bi-person-circle", to: "/publisher/profile" },
  { label: "Events", icon: "bi-calendar-event", to: "/publisher/events" },
  { label: "Jobs", icon: "bi-briefcase", to: "/publisher/jobs" },
  { label: "Startup Funding Calls", icon: "bi-cash-stack", to: "/publisher/funding-calls" },
  { label: "Investor Programs", icon: "bi-graph-up", to: "/publisher/investor-programs" },
  { label: "Competitions", icon: "bi-trophy", to: "/publisher/competitions" },
  { label: "Workshops", icon: "bi-easel", to: "/publisher/workshops" },
];

export default function PublisherSidebar({ collapsed }) {
  return (
    <div className={`ventic-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="ventic-sidebar__brand">
        <div className="ventic-logo">U</div>
        {!collapsed && <div className="ventic-brand-text">Unlock</div>}
      </div>

      <div className="ventic-sidebar__menu">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `ventic-nav ${isActive ? "active" : ""}`}
          >
            <i className={`bi ${item.icon} ventic-nav__icon`} />
            {!collapsed && <span className="ventic-nav__text">{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
