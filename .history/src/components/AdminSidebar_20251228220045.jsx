import { NavLink } from "react-router-dom";

const menu = [
  { label: "Dashboard", icon: "bi-grid", to: "/admin/dashboard/admin" },
  { label: "Pending Listings", icon: "bi-hourglass-split", to: "/admin/listings/pending" },
  { label: "All Listings", icon: "bi-card-list", to: "/admin/listings" },
  { label: "Publishers", icon: "bi-buildings", to: "/admin/publishers" },
  { label: "Users", icon: "bi-people", to: "/admin/users" },
  { label: "Subscriptions", icon: "bi-credit-card", to: "/admin/subscriptions" },
];

export default function AdminSidebar({ collapsed }) {
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
            className={({ isActive }) =>
              `ventic-nav ${isActive ? "active" : ""}`
            }
          >
            <i className={`bi ${item.icon} ventic-nav__icon`} />
            {!collapsed && <span className="ventic-nav__text">{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
