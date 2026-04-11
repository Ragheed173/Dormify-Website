import React from "react";

const STATS = [
  { icon: "📋", label: "Active Bookings", value: 1, color: "#dbeafe", iconColor: "#2563eb" },
  { icon: "⏳", label: "Pending Requests", value: 2, color: "#fef3c7", iconColor: "#d97706" },
  { icon: "🔧", label: "Maintenance Open", value: 1, color: "#fee2e2", iconColor: "#dc2626" },
  { icon: "⭐", label: "Reviews Given", value: 3, color: "#d1fae5", iconColor: "#16a34a" },
];

function StatsCards() {
  return (
    <div className="row gy-3 mb-4">
      {STATS.map(({ icon, label, value, color, iconColor }) => (
        <div key={label} className="col-6 col-xl-3">
          <div className="stat-card bg-white p-3 d-flex align-items-center gap-3">
            <div
              className="stat-icon d-flex align-items-center justify-content-center"
              style={{ background: color, color: iconColor, width: 40, height: 40, borderRadius: 8 }}
            >
              {icon}
            </div>
            <div>
              <div className="fw-bold fs-5">{value}</div>
              <div className="small text-muted">{label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;