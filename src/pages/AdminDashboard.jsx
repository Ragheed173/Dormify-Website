import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'

function AdminDashboard() {
  const { user, logout } = useAuth()

  const [activeSection, setActiveSection] = useState('overview')

  const [stats, setStats] = useState({
    usersCount: 0,
    housingsCount: 0,
    bookingsCount: 0,
  })

  const [users, setUsers] = useState([])
  const [housings, setHousings] = useState([])
  const [bookings, setBookings] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [editingHousingId, setEditingHousingId] = useState(null)
  const [housingForm, setHousingForm] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    gender_allowed: 'both',
    room_type: 'single',
    available_rooms: '',
    status: 'available',
  })

  const [editingUserId, setEditingUserId] = useState(null)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
  })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const [statsRes, usersRes, housingsRes, bookingsRes] = await Promise.all([
        api.get('/home/stats'),
        api.get('/admin/users'),
        api.get('/housings'),
        api.get('/admin/bookings'),
      ])

      setStats(
        statsRes.data?.data || {
          usersCount: 0,
          housingsCount: 0,
          bookingsCount: 0,
        }
      )

      setUsers(usersRes.data?.data || [])
      setHousings(housingsRes.data?.data || [])
      setBookings(bookingsRes.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const pendingBookingsCount = useMemo(() => {
    return bookings.filter((booking) => booking.status === 'pending').length
  }, [bookings])

  const confirmedRevenue = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === 'confirmed')
      .reduce((sum, booking) => sum + Number(booking.Housing?.price || 0), 0)
  }, [bookings])

  const handleHousingChange = (e) => {
    const { name, value } = e.target
    setHousingForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUserChange = (e) => {
    const { name, value } = e.target
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const startEditHousing = (housing) => {
    setEditingHousingId(housing.id)
    setHousingForm({
      title: housing.title || '',
      description: housing.description || '',
      location: housing.location || '',
      price: housing.price || '',
      gender_allowed: housing.gender_allowed || 'both',
      room_type: housing.room_type || 'single',
      available_rooms: housing.available_rooms || '',
      status: housing.status || 'available',
    })
    setSuccess('')
    setError('')
    setActiveSection('housing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEditHousing = () => {
    setEditingHousingId(null)
    setHousingForm({
      title: '',
      description: '',
      location: '',
      price: '',
      gender_allowed: 'both',
      room_type: 'single',
      available_rooms: '',
      status: 'available',
    })
  }

  const handleUpdateHousing = async (e) => {
    e.preventDefault()

    try {
      setError('')
      setSuccess('')

      await api.put(`/admin/housings/${editingHousingId}`, {
        title: housingForm.title,
        description: housingForm.description,
        location: housingForm.location,
        price: Number(housingForm.price),
        gender_allowed: housingForm.gender_allowed,
        room_type: housingForm.room_type,
        available_rooms: Number(housingForm.available_rooms),
        status: housingForm.status,
      })

      setSuccess('Housing updated successfully')
      cancelEditHousing()
      await fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update housing')
    }
  }

  const handleDeleteHousing = async (housingId) => {
    const confirmed = window.confirm('Are you sure you want to delete this housing?')
    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await api.delete(`/admin/housings/${housingId}`)
      setSuccess('Housing deleted successfully')
      await fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete housing')
    }
  }

  const startEditUser = (selectedUser) => {
    setEditingUserId(selectedUser.id)
    setUserForm({
      name: selectedUser.name || '',
      email: selectedUser.email || '',
      phone: selectedUser.phone || '',
      role: selectedUser.role || 'student',
    })
    setSuccess('')
    setError('')
    setActiveSection('users')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEditUser = () => {
    setEditingUserId(null)
    setUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'student',
    })
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()

    try {
      setError('')
      setSuccess('')

      await api.put(`/admin/users/${editingUserId}`, userForm)
      setSuccess('User updated successfully')
      cancelEditUser()
      await fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?')
    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await api.delete(`/admin/users/${userId}`)
      setSuccess('User deleted successfully')
      await fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleBookingStatusUpdate = async (bookingId, status) => {
    try {
      setError('')
      setSuccess('')

      await api.patch(`/admin/bookings/${bookingId}/status`, { status })
      setSuccess('Booking status updated successfully')
      await fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status')
    }
  }

  const statusBadgeClass = (status) => {
    const normalized = String(status).toLowerCase()

    if (normalized === 'confirmed') return 'success'
    if (normalized === 'pending') return 'warning'
    if (normalized === 'cancelled') return 'danger'
    if (normalized === 'rejected') return 'secondary'
    if (normalized === 'available') return 'success'
    if (normalized === 'unavailable') return 'danger'

    return 'secondary'
  }

  const renderOverview = () => (
    <>
      <div className="mb-4">
        <h1 className="fw-bold">Welcome back, {user?.name || 'Admin'}</h1>
        <p className="text-muted mb-0">
          Monitor the platform, manage users, bookings, and review housing data.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Total Users</div>
              <h2 className="fw-bold mb-0">{stats.usersCount}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Total Housings</div>
              <h2 className="fw-bold mb-0">{stats.housingsCount}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Total Bookings</div>
              <h2 className="fw-bold mb-0">{stats.bookingsCount}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Pending Bookings</div>
              <h2 className="fw-bold mb-0">{pendingBookingsCount}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold">Recent Bookings</div>
            <div className="card-body p-0">
              {bookings.length === 0 ? (
                <div className="text-center py-5 text-muted">No bookings found</div>
              ) : (
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
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.User?.name || 'N/A'}</td>
                          <td>{booking.Housing?.title || 'N/A'}</td>
                          <td>{booking.Housing?.location || 'N/A'}</td>
                          <td>${booking.Housing?.price || 0}</td>
                          <td>
                            <span className={`badge bg-${statusBadgeClass(booking.status)}`}>
                              {booking.status}
                            </span>
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

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold">Quick Analytics</div>
            <div className="card-body">
              <div className="mb-3 d-flex justify-content-between">
                <span>Confirmed Revenue</span>
                <strong>${confirmedRevenue}</strong>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Confirmed Bookings</span>
                <strong>{bookings.filter((b) => b.status === 'confirmed').length}</strong>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Rejected Bookings</span>
                <strong>{bookings.filter((b) => b.status === 'rejected').length}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Cancelled Bookings</span>
                <strong>{bookings.filter((b) => b.status === 'cancelled').length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const renderUsers = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white fw-bold">Manage Users</div>
      <div className="card-body">
        {editingUserId && (
          <form onSubmit={handleUpdateUser} className="mb-4">
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserChange}
                  placeholder="Name"
                />
              </div>

              <div className="col-md-3">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserChange}
                  placeholder="Email"
                />
              </div>

              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={userForm.phone}
                  onChange={handleUserChange}
                  placeholder="Phone"
                />
              </div>

              <div className="col-md-2">
                <select
                  className="form-select"
                  name="role"
                  value={userForm.role}
                  onChange={handleUserChange}
                >
                  <option value="student">Student</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="col-md-2 d-flex gap-2">
                <button className="btn btn-primary w-100" type="submit">
                  Save
                </button>
                <button
                  className="btn btn-outline-secondary w-100"
                  type="button"
                  onClick={cancelEditUser}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone || '-'}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        item.role === 'admin'
                          ? 'danger'
                          : item.role === 'owner'
                          ? 'warning'
                          : 'primary'
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => startEditUser(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteUser(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderHousing = () => (
    <>
      <div className="mb-3">
        <h1 className="fw-bold mb-1">Manage Housing</h1>
        <p className="text-muted mb-0">
          Admin can review, update, and delete existing housings. New housing is added by owners only.
        </p>
      </div>

      {editingHousingId && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-bold">Edit Housing</div>
          <div className="card-body">
            <form onSubmit={handleUpdateHousing}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={housingForm.title}
                    onChange={handleHousingChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={housingForm.location}
                    onChange={handleHousingChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="description"
                    value={housingForm.description}
                    onChange={handleHousingChange}
                  ></textarea>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={housingForm.price}
                    onChange={handleHousingChange}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Rooms</label>
                  <input
                    type="number"
                    className="form-control"
                    name="available_rooms"
                    value={housingForm.available_rooms}
                    onChange={handleHousingChange}
                    required
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    name="gender_allowed"
                    value={housingForm.gender_allowed}
                    onChange={handleHousingChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Room Type</label>
                  <select
                    className="form-select"
                    name="room_type"
                    value={housingForm.room_type}
                    onChange={handleHousingChange}
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={housingForm.status}
                    onChange={handleHousingChange}
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cancelEditHousing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-bold">Housing List</div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Rooms</th>
                  <th>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {housings.map((housing) => (
                  <tr key={housing.id}>
                    <td>{housing.title}</td>
                    <td>{housing.location}</td>
                    <td>${housing.price}</td>
                    <td>{housing.available_rooms}</td>
                    <td>
                      <span className={`badge bg-${statusBadgeClass(housing.status)}`}>
                        {housing.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEditHousing(housing)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteHousing(housing.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {housings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No housings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )


  const renderReports = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white fw-bold">Reports & Analytics</div>
      <div className="card-body">
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="text-muted small">Total Revenue</div>
              <h3 className="fw-bold text-success mb-0">${confirmedRevenue}</h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="text-muted small">Monthly Revenue</div>
              <h3 className="fw-bold text-primary mb-0">
                ${Math.round(confirmedRevenue / 6 || 0)}
              </h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="text-muted small">Avg Booking Value</div>
              <h3 className="fw-bold text-warning mb-0">
                $
                {bookings.length
                  ? Math.round(
                      bookings.reduce((sum, b) => sum + Number(b.Housing?.price || 0), 0) /
                        bookings.length
                    )
                  : 0}
              </h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="text-muted small">Conversion Rate</div>
              <h3 className="fw-bold text-info mb-0">
                {bookings.length
                  ? Math.round(
                      (bookings.filter((b) => b.status === 'confirmed').length / bookings.length) * 100
                    )
                  : 0}
                %
              </h3>
            </div>
          </div>
        </div>

        <h5 className="fw-bold mb-3">Bookings by City</h5>
        {['Ramallah', 'Nablus', 'Hebron', 'Jenin'].map((city) => {
          const cityBookings = bookings.filter(
            (booking) => booking.Housing?.location === city
          ).length
          const percentage = bookings.length
            ? Math.round((cityBookings / bookings.length) * 100)
            : 0

          return (
            <div key={city} className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span>{city}</span>
                <span>
                  {cityBookings} bookings ({percentage}%)
                </span>
              </div>
              <div className="progress" style={{ height: '12px' }}>
                <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white fw-bold">Platform Settings</div>
      <div className="card-body" style={{ maxWidth: '700px' }}>
        <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
          <div>
            <div className="fw-semibold">Allow New Registrations</div>
            <div className="small text-muted">Let new users register on the platform</div>
          </div>
          <div className="form-check form-switch m-0">
            <input className="form-check-input" type="checkbox" defaultChecked />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
          <div>
            <div className="fw-semibold">Owners Manage Listings</div>
            <div className="small text-muted">Only owners can add new housings</div>
          </div>
          <div className="form-check form-switch m-0">
            <input className="form-check-input" type="checkbox" checked readOnly />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center py-3">
          <div>
            <div className="fw-semibold">Maintenance Notifications</div>
            <div className="small text-muted">Email notifications for system alerts</div>
          </div>
          <div className="form-check form-switch m-0">
            <input className="form-check-input" type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      <aside
        className="text-white p-3 d-flex flex-column"
        style={{
          width: '280px',
          background: '#1f2430',
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        <div className="mb-4">
          <h3 className="fw-bold mb-0 text-primary">
            <i className="bi bi-house-heart-fill me-2"></i>Dormify
          </h3>
          <div className="text-white-50">Admin Control Panel</div>
        </div>

        <div className="bg-secondary bg-opacity-25 rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '44px', height: '44px', background: '#0d6efd' }}
          >
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <div className="fw-bold">{user?.name || 'Admin User'}</div>
            <span className="badge bg-primary">Administrator</span>
          </div>
        </div>

        <div className="nav flex-column gap-2">
          <button
            className={`btn text-start ${
              activeSection === 'overview'
                ? 'btn-primary'
                : 'btn-dark border-0 text-white-50'
            }`}
            onClick={() => setActiveSection('overview')}
          >
            <i className="bi bi-speedometer2 me-2"></i>Overview
          </button>

          <button
            className={`btn text-start ${
              activeSection === 'users'
                ? 'btn-primary'
                : 'btn-dark border-0 text-white-50'
            }`}
            onClick={() => setActiveSection('users')}
          >
            <i className="bi bi-people me-2"></i>Manage Users
          </button>

          <button
            className={`btn text-start ${
              activeSection === 'housing'
                ? 'btn-primary'
                : 'btn-dark border-0 text-white-50'
            }`}
            onClick={() => setActiveSection('housing')}
          >
            <i className="bi bi-house-door me-2"></i>Manage Housing
          </button>

          <button
            className={`btn text-start ${
              activeSection === 'reports'
                ? 'btn-primary'
                : 'btn-dark border-0 text-white-50'
            }`}
            onClick={() => setActiveSection('reports')}
          >
            <i className="bi bi-bar-chart-line me-2"></i>Reports & Analytics
          </button>

          <button
            className={`btn text-start ${
              activeSection === 'settings'
                ? 'btn-primary'
                : 'btn-dark border-0 text-white-50'
            }`}
            onClick={() => setActiveSection('settings')}
          >
            <i className="bi bi-gear me-2"></i>Settings
          </button>
        </div>

        <div className="mt-auto">
          <button className="btn btn-outline-light w-100" onClick={logout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow-1 p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-3">Loading admin dashboard...</p>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'housing' && renderHousing()}
            {activeSection === 'bookings' && renderBookings()}
            {activeSection === 'reports' && renderReports()}
            {activeSection === 'settings' && renderSettings()}
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard