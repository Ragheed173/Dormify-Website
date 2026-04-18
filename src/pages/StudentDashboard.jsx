import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosInstance";
import Sidebar from "../components/dashboard/Sidebar";

function StudentDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [profileRes, bookingsRes] = await Promise.all([
        api.get("/student/profile"),
        api.get("/student/bookings"),
      ]);

      const profileData = profileRes.data?.data || null;
      const bookingsData = bookingsRes.data?.data || [];

      setProfile(profileData);
      setProfileForm({
        name: profileData?.name || "",
        email: profileData?.email || "",
        phone: profileData?.phone || "",
      });
      setBookings(bookingsData);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setSuccess("");
      setError("");

      const res = await api.put("/student/profile", profileForm);
      const updatedProfile = res.data?.data;

      setProfile(updatedProfile);
      setProfileForm({
        name: updatedProfile?.name || "",
        email: updatedProfile?.email || "",
        phone: updatedProfile?.phone || "",
      });

      localStorage.setItem("dormify_user", JSON.stringify(updatedProfile));
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      setCancelLoadingId(bookingId);
      setSuccess("");
      setError("");

      await api.patch(`/student/bookings/${bookingId}/cancel`);
      await fetchStudentData();
      setSuccess("Booking cancelled successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelLoadingId(null);
    }
  };

  const statusBadgeClass = (status) => {
    const normalized = String(status).toLowerCase();

    if (normalized === "confirmed") return "success";
    if (normalized === "pending") return "warning";
    if (normalized === "cancelled") return "danger";
    if (normalized === "rejected") return "secondary";

    return "secondary";
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">Loading student dashboard...</div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 72px)" }}>
      <Sidebar user={profile || user} />

      <main
        className="flex-grow-1 p-3 p-md-4"
        style={{ background: "var(--bg-light)" }}
      >
        <div
          className="p-4 mb-4 text-white rounded"
          style={{ background: "var(--primary)" }}
        >
          <h4 className="fw-bold">
            👋 Welcome back, {profile?.name?.split(" ")?.[0] || "Student"}!
          </h4>
          <p className="small mb-0">Here's an overview of your account.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted small mb-1">My Name</p>
                <h5 className="fw-bold mb-0">{profile?.name || "-"}</h5>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted small mb-1">My Email</p>
                <h5 className="fw-bold mb-0">{profile?.email || "-"}</h5>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted small mb-1">My Bookings</p>
                <h5 className="fw-bold mb-0">{bookings.length}</h5>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-bold">My Profile</div>
              <div className="card-body">
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Saving..." : "Update Profile"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-bold">My Bookings</div>
              <div className="card-body p-0">
                {bookings.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    No bookings found
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Housing</th>
                          <th>Location</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={
                                    booking.Housing?.HousingImages?.[0]?.image_url ||
                                    "https://via.placeholder.com/60x60?text=No+Image"
                                  }
                                  alt={booking.Housing?.title || "Housing"}
                                  style={{
                                    width: "52px",
                                    height: "52px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                                <div>
                                  <div className="fw-medium">
                                    {booking.Housing?.title || "N/A"}
                                  </div>
                                  <small className="text-muted">
                                    ${booking.Housing?.price || 0}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>{booking.Housing?.location || "N/A"}</td>
                            <td>{booking.start_date || "-"}</td>
                            <td>{booking.end_date || "-"}</td>
                            <td>
                              <span
                                className={`badge bg-${statusBadgeClass(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                            </td>
                            <td>
                              {booking.status !== "cancelled" ? (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={cancelLoadingId === booking.id}
                                >
                                  {cancelLoadingId === booking.id
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </button>
                              ) : (
                                <span className="text-muted small">Cancelled</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;