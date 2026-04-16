import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardStats, setDashboardStats] = useState({
    usersCount: 0,
    housingsCount: 0,
    bookingsCount: 0,
    pendingBookingsCount: 0,
    confirmedBookingsCount: 0,
  });

  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenanceReports] = useState([]);
  const [housings, setHousings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("");
  const [reportFilter, setReportFilter] = useState("");

  const [housingForm, setHousingForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    gender_allowed: "both",
    room_type: "single",
    available_rooms: "",
    status: "available",
    image_urls: "",
  });

  const [housingLoading, setHousingLoading] = useState(false);
  const [housingError, setHousingError] = useState("");
  const [editingHousingId, setEditingHousingId] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        const [dashboardRes, usersRes, bookingsRes, housingsRes] =
          await Promise.all([
            api.get("/admin/dashboard"),
            api.get("/admin/users"),
            api.get("/admin/bookings"),
            api.get("/housings"),
          ]);

        setDashboardStats(dashboardRes.data.data || {});
        setUsers(usersRes.data.data || []);
        setBookings(bookingsRes.data.data || []);
        setHousings(housingsRes.data.data || housingsRes.data || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statusBadge = (status) => {
    const normalized = String(status).toLowerCase();

    if (
      ["confirmed", "available", "paid", "active", "resolved"].includes(
        normalized
      )
    ) {
      return "success";
    }

    if (["pending", "in progress", "under review"].includes(normalized)) {
      return "warning";
    }

    if (
      ["cancelled", "inactive", "open", "rejected", "unavailable"].includes(
        normalized
      )
    ) {
      return "danger";
    }

    if (["booked"].includes(normalized)) {
      return "info";
    }

    return "secondary";
  };

  const cityStats = [
    { city: "Ramallah", count: 145, pct: 42 },
    { city: "Nablus", count: 98, pct: 28 },
    { city: "Hebron", count: 62, pct: 18 },
    { city: "Jenin", count: 37, pct: 11 },
  ];

  const newHousingRequests = [
    {
      id: 1,
      name: "Mountain View Apartment",
      owner: "Nour Salem",
      city: "Ramallah",
      date: "2024-04-18",
    },
    {
      id: 2,
      name: "City Center Studio",
      owner: "Rami Hassan",
      city: "Nablus",
      date: "2024-04-19",
    },
    {
      id: 3,
      name: "Student Complex",
      owner: "Lara Khalil",
      city: "Hebron",
      date: "2024-04-20",
    },
  ];

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());

    const matchRole = userRole
      ? u.role?.toLowerCase() === userRole.toLowerCase()
      : true;

    return matchSearch && matchRole;
  });

  const filteredReports = reportFilter
    ? maintenanceReports.filter((r) => r.status === reportFilter)
    : maintenanceReports;

  const resetHousingForm = () => {
    setHousingForm({
      title: "",
      description: "",
      location: "",
      price: "",
      gender_allowed: "both",
      room_type: "single",
      available_rooms: "",
      status: "available",
      image_urls: "",
    });
    setEditingHousingId(null);
    setHousingError("");
  };

  const handleHousingChange = (e) => {
    const { name, value } = e.target;
    setHousingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchHousings = async () => {
    try {
      const res = await api.get("/housings");
      setHousings(res.data.data || res.data || []);
    } catch (err) {
      setHousingError(err.response?.data?.message || "Failed to fetch housings");
    }
  };

  const handleHousingSubmit = async (e) => {
    e.preventDefault();
    setHousingLoading(true);
    setHousingError("");

    try {
      const payload = {
        title: housingForm.title,
        description: housingForm.description,
        location: housingForm.location,
        price: Number(housingForm.price),
        gender_allowed: housingForm.gender_allowed,
        room_type: housingForm.room_type,
        available_rooms: Number(housingForm.available_rooms),
        status: housingForm.status,
        image_urls: housingForm.image_urls
          ? housingForm.image_urls
              .split(",")
              .map((url) => url.trim())
              .filter(Boolean)
          : [],
      };

      if (editingHousingId) {
        await api.put(`/admin/housings/${editingHousingId}`, payload);
      } else {
        await api.post("/admin/housings", payload);
      }

      await fetchHousings();
      resetHousingForm();
    } catch (err) {
      setHousingError(err.response?.data?.message || "Failed to save housing");
    } finally {
      setHousingLoading(false);
    }
  };

  const handleEditHousing = (housing) => {
    setEditingHousingId(housing.id);
    setHousingForm({
      title: housing.title || "",
      description: housing.description || "",
      location: housing.location || "",
      price: housing.price || "",
      gender_allowed: housing.gender_allowed || "both",
      room_type: housing.room_type || "single",
      available_rooms: housing.available_rooms || "",
      status: housing.status || "available",
      image_urls: Array.isArray(housing.HousingImages)
        ? housing.HousingImages.map((img) => img.image_url).join(", ")
        : "",
    });
    setActiveTab("housing");
    setHousingError("");
  };

  const handleDeleteHousing = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this housing?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/housings/${id}`);
      await fetchHousings();
    } catch (err) {
      setHousingError(err.response?.data?.message || "Failed to delete housing");
    }
  };

  const navItems = [
    { key: "overview", icon: "bi-speedometer2", label: "Overview" },
    { key: "users", icon: "bi-people", label: "Manage Users" },
    { key: "housing", icon: "bi-houses", label: "Manage Housing" },
    { key: "bookings", icon: "bi-calendar-check", label: "Manage Bookings" },
    { key: "maintenance", icon: "bi-tools", label: "Maintenance Reports" },
    {
      key: "analytics",
      icon: "bi-bar-chart-line",
      label: "Reports & Analytics",
    },
    { key: "settings", icon: "bi-gear", label: "Settings" },
  ];

  if (loading) {
    return <div className="container mt-4">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="container mt-4 text-danger">{error}</div>;
  }

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div
        className="bg-dark text-white d-flex flex-column"
        style={{ width: "260px", minWidth: "260px", padding: "24px 16px" }}
      >
        <div className="mb-4 px-2">
          <h5 className="fw-bold text-primary mb-0">
            <i className="bi bi-house-heart-fill me-2"></i>Dormify
          </h5>
          <small className="text-secondary">Admin Control Panel</small>
        </div>

        <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-2 p-2 mb-4">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: "40px",
              height: "40px",
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            AD
          </div>
          <div style={{ overflow: "hidden" }}>
            <p className="mb-0 small fw-bold text-white text-truncate">
              {user?.name || "Admin User"}
            </p>
            <span className="badge bg-primary" style={{ fontSize: "10px" }}>
              Administrator
            </span>
          </div>
        </div>

        <nav className="flex-grow-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`w-100 text-start d-flex align-items-center gap-2 border-0 rounded-2 mb-1 px-3 py-2 small fw-medium ${
                activeTab === item.key
                  ? "bg-primary text-white"
                  : "bg-transparent text-secondary"
              }`}
              onClick={() => setActiveTab(item.key)}
              style={{ transition: "all 0.2s" }}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="btn btn-outline-light mt-3 small"
        >
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>

      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="fw-bold mb-1">
              Welcome back, {user?.name || "Admin User"}
            </h3>
            <p className="text-muted mb-0 small">
              Manage users, housing, bookings, and monitor the platform.
            </p>
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="row g-4 mb-4">
              {[
                {
                  label: "Total Users",
                  value: dashboardStats.usersCount,
                  icon: "bi-people-fill",
                  color: "primary",
                },
                {
                  label: "Total Housings",
                  value: dashboardStats.housingsCount,
                  icon: "bi-house-fill",
                  color: "success",
                },
                {
                  label: "Total Bookings",
                  value: dashboardStats.bookingsCount,
                  icon: "bi-calendar-check-fill",
                  color: "warning",
                },
                {
                  label: "Pending Bookings",
                  value: dashboardStats.pendingBookingsCount,
                  icon: "bi-flag-fill",
                  color: "danger",
                },
              ].map((card) => (
                <div key={card.label} className="col-12 col-md-6 col-xl-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex align-items-center justify-content-between">
                      <div>
                        <p className="text-muted small mb-1">{card.label}</p>
                        <h3 className="fw-bold mb-0">{card.value}</h3>
                      </div>
                      <div
                        className={`bg-${card.color} bg-opacity-10 text-${card.color} rounded-circle d-flex align-items-center justify-content-center`}
                        style={{ width: "56px", height: "56px" }}
                      >
                        <i className={`bi ${card.icon} fs-4`}></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4 mb-4">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white fw-bold border-bottom">
                    <i className="bi bi-calendar-check me-2 text-primary"></i>
                    Recent Bookings
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Student</th>
                            <th>Housing</th>
                            <th>City</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.length > 0 ? (
                            bookings.map((b) => (
                              <tr key={b.id}>
                                <td className="fw-medium small">
                                  {b.User?.name || "N/A"}
                                </td>
                                <td className="small text-muted">
                                  {b.Housing?.title || "N/A"}
                                </td>
                                <td className="small">
                                  {b.Housing?.location || "N/A"}
                                </td>
                                <td className="fw-bold text-primary small">
                                  ${b.Housing?.price || 0}
                                </td>
                                <td>
                                  <span
                                    className={`badge bg-${statusBadge(
                                      b.status
                                    )}`}
                                  >
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="text-center py-4 text-muted"
                              >
                                No bookings found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white fw-bold border-bottom">
                    <i className="bi bi-bar-chart me-2 text-primary"></i>
                    Bookings by City
                  </div>
                  <div className="card-body">
                    {cityStats.map((c) => (
                      <div key={c.city} className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-medium">{c.city}</span>
                          <span className="text-muted">{c.count} bookings</span>
                        </div>
                        <div
                          className="progress"
                          style={{ height: "10px", borderRadius: "99px" }}
                        >
                          <div
                            className="progress-bar bg-primary"
                            style={{
                              width: `${c.pct}%`,
                              borderRadius: "99px",
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-bold border-bottom">
                <i className="bi bi-house-add me-2 text-warning"></i>New Housing
                Requests
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Owner</th>
                        <th>City</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newHousingRequests.map((req) => (
                        <tr key={req.id}>
                          <td className="fw-medium">{req.name}</td>
                          <td>{req.owner}</td>
                          <td className="text-muted">{req.city}</td>
                          <td className="small">{req.date}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-success btn-sm">
                                <i className="bi bi-check-lg me-1"></i>Approve
                              </button>
                              <button className="btn btn-outline-danger btn-sm">
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            <div className="d-flex gap-2 mb-3 flex-wrap">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: "280px" }}
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select
                className="form-select"
                style={{ maxWidth: "160px" }}
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="fw-medium">{u.name}</td>
                            <td className="text-muted">{u.email}</td>
                            <td>{u.phone || "-"}</td>
                            <td>
                              <span
                                className={`badge bg-${
                                  u.role === "admin" ? "danger" : "primary"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-4 text-muted"
                          >
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "housing" && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-bold border-bottom">
                  <i className="bi bi-house-add me-2 text-primary"></i>
                  {editingHousingId ? "Edit Housing" : "Add New Housing"}
                </div>
                <div className="card-body">
                  {housingError && (
                    <div className="alert alert-danger small">
                      {housingError}
                    </div>
                  )}

                  <form onSubmit={handleHousingSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={housingForm.title}
                        onChange={handleHousingChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows="3"
                        value={housingForm.description}
                        onChange={handleHousingChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        value={housingForm.location}
                        onChange={handleHousingChange}
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          name="price"
                          className="form-control"
                          value={housingForm.price}
                          onChange={handleHousingChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Available Rooms</label>
                        <input
                          type="number"
                          name="available_rooms"
                          className="form-control"
                          value={housingForm.available_rooms}
                          onChange={handleHousingChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Gender</label>
                        <select
                          name="gender_allowed"
                          className="form-select"
                          value={housingForm.gender_allowed}
                          onChange={handleHousingChange}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="both">Both</option>
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Room Type</label>
                        <select
                          name="room_type"
                          className="form-select"
                          value={housingForm.room_type}
                          onChange={handleHousingChange}
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="triple">Triple</option>
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Status</label>
                        <select
                          name="status"
                          className="form-select"
                          value={housingForm.status}
                          onChange={handleHousingChange}
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Image URLs</label>
                      <textarea
                        name="image_urls"
                        className="form-control"
                        rows="3"
                        placeholder="ضع الروابط مفصولة بفاصلة ,"
                        value={housingForm.image_urls}
                        onChange={handleHousingChange}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={housingLoading}
                      >
                        {housingLoading
                          ? "Saving..."
                          : editingHousingId
                          ? "Update Housing"
                          : "Add Housing"}
                      </button>

                      {editingHousingId && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={resetHousingForm}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-bold border-bottom">
                  <i className="bi bi-houses me-2 text-success"></i>
                  Housing List
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Title</th>
                          <th>Location</th>
                          <th>Price</th>
                          <th>Rooms</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {housings.length > 0 ? (
                          housings.map((housing) => (
                            <tr key={housing.id}>
                              <td className="fw-medium">{housing.title}</td>
                              <td>{housing.location}</td>
                              <td>${housing.price}</td>
                              <td>{housing.available_rooms}</td>
                              <td>
                                <span
                                  className={`badge bg-${statusBadge(
                                    housing.status
                                  )}`}
                                >
                                  {housing.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditHousing(housing)}
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      handleDeleteHousing(housing.id)
                                    }
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center py-4 text-muted"
                            >
                              No housing found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold border-bottom">
              <i className="bi bi-calendar-check me-2 text-primary"></i>
              Manage Bookings
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Housing</th>
                      <th>City</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length > 0 ? (
                      bookings.map((b) => (
                        <tr key={b.id}>
                          <td className="fw-medium">{b.User?.name || "N/A"}</td>
                          <td>{b.Housing?.title || "N/A"}</td>
                          <td className="text-muted">
                            {b.Housing?.location || "N/A"}
                          </td>
                          <td className="small">{b.start_date || "-"}</td>
                          <td className="small">{b.end_date || "-"}</td>
                          <td>
                            <span
                              className={`badge bg-${statusBadge(b.status)}`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-muted"
                        >
                          No bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <>
            <div className="mb-3 d-flex gap-2">
              <select
                className="form-select"
                style={{ maxWidth: "200px" }}
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Student</th>
                        <th>Housing</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.length > 0 ? (
                        filteredReports.map((r) => (
                          <tr key={r.id}>
                            <td className="fw-medium">{r.title}</td>
                            <td className="text-muted">{r.student}</td>
                            <td>{r.housing}</td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {r.type === "Plumbing"
                                  ? "🔧"
                                  : r.type === "Electrical"
                                  ? "⚡"
                                  : "📶"}{" "}
                                {r.type}
                              </span>
                            </td>
                            <td className="text-muted small">{r.date}</td>
                            <td>
                              <span
                                className={`badge bg-${statusBadge(r.status)}`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                style={{ width: "auto" }}
                              >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Resolved</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-4 text-muted"
                          >
                            No maintenance reports available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm p-4">
                <h6 className="fw-bold mb-4">
                  <i className="bi bi-bar-chart me-2 text-primary"></i>Platform
                  Statistics
                </h6>
                <div className="row g-3 mb-4">
                  {[
                    {
                      label: "Total Revenue",
                      value: "$48,200",
                      color: "success",
                    },
                    {
                      label: "Monthly Revenue",
                      value: "$6,400",
                      color: "primary",
                    },
                    {
                      label: "Avg Booking Value",
                      value: "$141",
                      color: "warning",
                    },
                    { label: "Conversion Rate", value: "68%", color: "info" },
                  ].map((s) => (
                    <div key={s.label} className="col-6 col-md-3">
                      <div className="bg-light rounded-2 p-3 text-center">
                        <p className="text-muted small mb-1">{s.label}</p>
                        <h4 className={`fw-bold text-${s.color} mb-0`}>
                          {s.value}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>

                <h6 className="fw-bold mb-3">Bookings by City</h6>
                {cityStats.map((c) => (
                  <div key={c.city} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-medium">{c.city}</span>
                      <span className="text-muted">
                        {c.count} bookings ({c.pct}%)
                      </span>
                    </div>
                    <div
                      className="progress"
                      style={{ height: "14px", borderRadius: "99px" }}
                    >
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${c.pct}%`, borderRadius: "99px" }}
                      >
                        {c.pct}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4">
                <h6 className="fw-bold mb-4">Platform Settings</h6>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="fw-medium mb-0 small">
                      Allow New Registrations
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                      Let new users register on the platform
                    </p>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      defaultChecked
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="fw-medium mb-0 small">
                      Auto-approve Listings
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                      Approve new housing without review
                    </p>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="fw-medium mb-0 small">
                      Maintenance Notifications
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                      Email notifications for new reports
                    </p>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;