import React from "react";
import { useAuth } from "../../src/hooks/useAuth";

import Sidebar from "../../src/components/dashboard/Sidebar";
import StatsCards from "../../src/components/dashboard/StatsCards";
import RecentBookings from "../../src/components/dashboard/RecentBookings";

function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 72px)" }}>
      
      <Sidebar user={user} />

      <main className="flex-grow-1 p-3 p-md-4" style={{ background: "var(--bg-light)" }}>
        
        <div className="p-4 mb-4 text-white rounded" style={{ background: "var(--primary)" }}>
          <h4 className="fw-bold">
            👋 Welcome back, {user?.name?.split(" ")?.[0] || "Student"}!
          </h4>
          <p className="small mb-0">Here's an overview of your account.</p>
        </div>

        <StatsCards />
        <RecentBookings />

      </main>
    </div>
  );
}

export default StudentDashboard;