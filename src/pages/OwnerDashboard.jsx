import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'
import { Link, useNavigate } from 'react-router-dom'

function OwnerDashboard() {
  const { user, logout } = useAuth()

  const [activeSection, setActiveSection] = useState('overview')

  const [profile, setProfile] = useState(null)
  const [housings, setHousings] = useState([])
  const [bookings, setBookings] = useState([])

  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [housingLoading, setHousingLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)
  const [bookingActionId, setBookingActionId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const emptyHousingForm = {
    title: '',
    description: '',
    location: '',
    price: '',
    gender_allowed: 'both',
    room_type: 'single',
    available_rooms: '',
    status: 'available',
    image_urls: '',
  }

  const [housingForm, setHousingForm] = useState(emptyHousingForm)
  const [editingHousingId, setEditingHousingId] = useState(null)

  const fetchOwnerData = async () => {
    try {
      setLoading(true)
      setError('')

      const [profileRes, housingsRes, bookingsRes] = await Promise.all([
        api.get('/owner/profile'),
        api.get('/owner/housings'),
        api.get('/owner/bookings'),
      ])

      const ownerProfile = profileRes.data?.data || null
      const ownerHousings = housingsRes.data?.data || []
      const ownerBookings = bookingsRes.data?.data || []

      setProfile(ownerProfile)
      setProfileForm({
        name: ownerProfile?.name || '',
        email: ownerProfile?.email || '',
        phone: ownerProfile?.phone || '',
      })

      setHousings(ownerHousings)
      setBookings(ownerBookings)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load owner dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwnerData()
  }, [])

  const totalRevenue = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === 'confirmed')
      .reduce((sum, booking) => sum + Number(booking.Housing?.price || 0), 0)
  }, [bookings])

  const pendingBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === 'pending').length
  }, [bookings])

  const confirmedBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === 'confirmed').length
  }, [bookings])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleHousingChange = (e) => {
    const { name, value } = e.target
    setHousingForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    try {
      setProfileLoading(true)
      setError('')
      setSuccess('')

      const res = await api.put('/owner/profile', profileForm)
      const updatedProfile = res.data?.data || null

      setProfile(updatedProfile)
      setProfileForm({
        name: updatedProfile?.name || '',
        email: updatedProfile?.email || '',
        phone: updatedProfile?.phone || '',
      })

      localStorage.setItem('dormify_user', JSON.stringify(updatedProfile))
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const resetHousingForm = () => {
    setHousingForm(emptyHousingForm)
    setEditingHousingId(null)
  }

  const handleHousingSubmit = async (e) => {
    e.preventDefault()

    try {
      setHousingLoading(true)
      setError('')
      setSuccess('')

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
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      }

      if (editingHousingId) {
        await api.put(`/owner/housings/${editingHousingId}`, payload)
        setSuccess('Housing updated successfully')
      } else {
        await api.post('/owner/housings', payload)
        setSuccess('Housing created successfully')
      }

      resetHousingForm()
      await fetchOwnerData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save housing')
    } finally {
      setHousingLoading(false)
    }
  }

  const handleEditHousing = (housing) => {
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
      image_urls: (housing.HousingImages || [])
        .map((img) => img.image_url)
        .join('\n'),
    })

    setActiveSection('housings')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteHousing = async (housingId) => {
    const confirmed = window.confirm('Are you sure you want to delete this housing?')
    if (!confirmed) return

    try {
      setDeleteLoadingId(housingId)
      setError('')
      setSuccess('')

      await api.delete(`/owner/housings/${housingId}`)
      setSuccess('Housing deleted successfully')
      await fetchOwnerData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete housing')
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const handleBookingStatusUpdate = async (bookingId, status) => {
    try {
      setBookingActionId(bookingId)
      setError('')
      setSuccess('')

      await api.patch(`/owner/bookings/${bookingId}/status`, { status })
      setSuccess('Booking status updated successfully')
      await fetchOwnerData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status')
    } finally {
      setBookingActionId(null)
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

  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const renderOverview = () => (
    <>
      <div className="mb-4">
        <h1 className="fw-bold">Welcome back, {profile?.name || user?.name || 'Owner'}</h1>
        <p className="text-muted mb-0">
          Manage your profile, housings, and booking requests from one place.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">My Housings</div>
              <h2 className="fw-bold mb-0">{housings.length}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">All Booking Requests</div>
              <h2 className="fw-bold mb-0">{bookings.length}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Pending Requests</div>
              <h2 className="fw-bold mb-0">{pendingBookings}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Confirmed Revenue</div>
              <h2 className="fw-bold mb-0">${totalRevenue}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold">Recent Requests</div>
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
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.User?.name || 'N/A'}</td>
                          <td>{booking.Housing?.title || 'N/A'}</td>
                          <td>{booking.Housing?.location || 'N/A'}</td>
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
            <div className="card-header bg-white fw-bold">Quick Stats</div>
            <div className="card-body">
              <div className="mb-3 d-flex justify-content-between">
                <span>Total Pending Requests</span>
                <strong>{pendingBookings}</strong>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Total Confirmed Bookings</span>
                <strong>{confirmedBookings}</strong>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Available Housings</span>
                <strong>{housings.filter((h) => h.status === 'available').length}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Unavailable Housings</span>
                <strong>{housings.filter((h) => h.status === 'unavailable').length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const renderProfile = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white fw-bold">My Profile</div>
      <div className="card-body" style={{ maxWidth: '700px' }}>
        <form onSubmit={handleProfileUpdate}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={profileForm.name}
                onChange={handleProfileChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={profileForm.email}
                onChange={handleProfileChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Phone</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={profileForm.phone}
                onChange={handleProfileChange}
              />
            </div>

            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  const renderHousings = () => (
    <>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-bold">
          {editingHousingId ? 'Edit Housing' : 'Add New Housing'}
        </div>
        <div className="card-body">
          <form onSubmit={handleHousingSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
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

              <div className="col-md-6">
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

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={housingForm.description}
                  onChange={handleHousingChange}
                ></textarea>
              </div>

              <div className="col-md-3">
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

              <div className="col-md-3">
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

              <div className="col-md-2">
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

              <div className="col-md-2">
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

              <div className="col-md-2">
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

              <div className="col-12">
                <label className="form-label">Image URLs</label>
                <textarea
                  name="image_urls"
                  className="form-control"
                  rows="4"
                  placeholder="One image URL per line"
                  value={housingForm.image_urls}
                  onChange={handleHousingChange}
                ></textarea>
              </div>

              <div className="col-12 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={housingLoading}
                >
                  {housingLoading
                    ? 'Saving...'
                    : editingHousingId
                      ? 'Update Housing'
                      : 'Add Housing'}
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
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-bold">My Housings</div>
        <div className="card-body">
          {housings.length === 0 ? (
            <div className="text-center text-muted py-4">No housings found</div>
          ) : (
            <div className="row g-4">
              {housings.map((housing) => (
                <div key={housing.id} className="col-12 col-md-6">
                  <div className="card border shadow-sm h-100">
                    <img
                      src={
                        housing.HousingImages?.[0]?.image_url ||
                        'https://via.placeholder.com/600x300?text=No+Image'
                      }
                      alt={housing.title}
                      className="w-100"
                      style={{
                        height: '200px',
                        objectFit: 'cover',
                        borderTopLeftRadius: '0.375rem',
                        borderTopRightRadius: '0.375rem',
                      }}
                    />

                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h5 className="fw-bold mb-0">{housing.title}</h5>
                        <span className={`badge bg-${statusBadgeClass(housing.status)}`}>
                          {housing.status}
                        </span>
                      </div>

                      <p className="text-muted small mb-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        {housing.location}
                      </p>

                      <div className="d-flex flex-wrap gap-2 mb-3 small">
                        <span className="badge text-bg-light border">${housing.price}</span>
                        <span className="badge text-bg-light border text-capitalize">
                          {housing.room_type}
                        </span>
                        <span className="badge text-bg-light border text-capitalize">
                          {housing.gender_allowed}
                        </span>
                        <span className="badge text-bg-light border">
                          {housing.available_rooms} rooms
                        </span>
                      </div>

                      <p className="text-muted small mb-3">
                        {housing.description?.length > 80
                          ? `${housing.description.slice(0, 80)}...`
                          : housing.description}
                      </p>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditHousing(housing)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteHousing(housing.id)}
                          disabled={deleteLoadingId === housing.id}
                        >
                          {deleteLoadingId === housing.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )

  const renderBookings = () => (
  <div className="card border-0 shadow-sm">
    <div className="card-header bg-white fw-bold">Booking Requests</div>
    <div className="card-body p-0">
      {!Array.isArray(bookings) || bookings.length === 0 ? (
        <div className="text-center py-5 text-muted">No bookings found</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Student</th>
                <th>Housing</th>
                <th>Location</th>
                <th>Dates</th>
                <th>Status</th>
                <th style={{ width: '180px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const studentName = booking?.User?.name || 'N/A'
                const studentEmail = booking?.User?.email || ''
                const housingTitle = booking?.Housing?.title || 'N/A'
                const housingLocation = booking?.Housing?.location || 'N/A'
                const startDate = booking?.start_date || '-'
                const endDate = booking?.end_date || '-'
                const bookingStatus = booking?.status || 'pending'

                return (
                  <tr key={booking?.id || Math.random()}>
                    <td>
                      <div className="fw-medium">{studentName}</div>
                      <small className="text-muted">{studentEmail}</small>
                    </td>
                    <td>{housingTitle}</td>
                    <td>{housingLocation}</td>
                    <td>
                      <div>{startDate}</div>
                      <small className="text-muted">{endDate}</small>
                    </td>
                    <td>
                      <span className={`badge bg-${statusBadgeClass(bookingStatus)}`}>
                        {bookingStatus}
                      </span>
                    </td>
                    <td>
                      {bookingStatus === 'pending' ? (
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                            disabled={bookingActionId === booking.id}
                          >
                            Confirm
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleBookingStatusUpdate(booking.id, 'rejected')}
                            disabled={bookingActionId === booking.id}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small">No action needed</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
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
          <div className="text-white-50">Owner Dashboard</div>
        </div>

        <div className="bg-secondary bg-opacity-25 rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '44px', height: '44px', background: '#0d6efd' }}
          >
            {profile?.name?.[0] || user?.name?.[0] || 'O'}
          </div>
          <div>
            <div className="fw-bold">{profile?.name || user?.name || 'Owner User'}</div>
            <span className="badge bg-primary">Owner</span>
          </div>
        </div>

        <div className="nav flex-column gap-2">
          <button
            className={`btn text-start ${activeSection === 'overview' ? 'btn-primary' : 'btn-dark border-0 text-white-50'}`}
            onClick={() => setActiveSection('overview')}
          >
            <i className="bi bi-speedometer2 me-2"></i>Overview
          </button>

          <button
            className={`btn text-start ${activeSection === 'profile' ? 'btn-primary' : 'btn-dark border-0 text-white-50'}`}
            onClick={() => setActiveSection('profile')}
          >
            <i className="bi bi-person me-2"></i>My Profile
          </button>

          <button
            className={`btn text-start ${activeSection === 'housings' ? 'btn-primary' : 'btn-dark border-0 text-white-50'}`}
            onClick={() => setActiveSection('housings')}
          >
            <i className="bi bi-house-door me-2"></i>My Housings
          </button>

          <button
            className={`btn text-start ${activeSection === 'bookings' ? 'btn-primary' : 'btn-dark border-0 text-white-50'}`}
            onClick={() => setActiveSection('bookings')}
          >
            <i className="bi bi-calendar-check me-2"></i>Booking Requests
          </button>
        </div>

        <div className="mt-auto">
          <button className="btn btn-outline-light w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-end mb-3">
          <Link to="/" className="btn btn-outline-primary">
            <i className="bi bi-house-door ms-2"></i>
            HOMEPAGE
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-3">Loading owner dashboard...</p>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'housings' && renderHousings()}
            {activeSection === 'bookings' && renderBookings()}
          </>
        )}
      </main>
    </div>
  )
}

export default OwnerDashboard