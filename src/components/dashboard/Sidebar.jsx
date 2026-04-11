import React from "react";
import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/dashboard", icon: "📊", label: "Overview" },
  { to: "/dashboard/bookings", icon: "📋", label: "My Bookings" },
  { to: "/dashboard/maintenance", icon: "🔧", label: "Maintenance Requests" },
  { to: "/housing", icon: "🏠", label: "Browse Housing" },
];

function Sidebar({ user }) {
  return (
    <aside className="sidebar d-none d-md-flex flex-column" style={{ width: 240 }}>
      <div className="px-3 mb-3 text-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mx-auto mb-2"
          style={{ width: 52, height: 52, background: "var(--primary)" }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <p className="text-white fw-semibold mb-0 small">{user?.name || "User"}</p>
        <p className="small mb-0 text-white-50">Student</p>
      </div>

      <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <nav>
        {NAV_LINKS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              "nav-link d-flex align-items-center " + (isActive ? "active" : "")
            }
          >
            <span className="me-2">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;