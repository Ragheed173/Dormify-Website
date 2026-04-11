import React from "react";
import { Link } from "react-router-dom";

const RECENT_BOOKINGS = [
  {
    id: "b1",
    title: "Sunny Studio near Campus",
    location: "Cairo, Egypt",
    checkIn: "2024-09-01",
    checkOut: "2025-06-30",
    status: "confirmed",
    price: 350,
  },
];

function RecentBookings() {
  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <div className="dormify-card p-4 bg-white rounded">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Recent Bookings</h5>
        <Link to="/dashboard/bookings" className="small">View all →</Link>
      </div>

      {RECENT_BOOKINGS.length === 0 ? (
        <div className="text-center py-4">
          <div className="fs-3 mb-2">📭</div>
          <p className="text-muted small mb-2">No bookings yet.</p>
          <Link to="/housing" className="btn btn-sm btn-primary">Browse Housing</Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle small">
            <thead className="table-light">
              <tr>
                <th>Accommodation</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_BOOKINGS.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="fw-semibold">{b.title}</div>
                    <div className="text-muted">{b.location}</div>
                  </td>
                  <td>{formatDate(b.checkIn)}</td>
                  <td>{formatDate(b.checkOut)}</td>
                  <td>
                    <span className={`badge ${b.status === "confirmed" ? "bg-success" : "bg-warning"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>${b.price}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentBookings;