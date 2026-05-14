import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'
import { Link, useNavigate  } from 'react-router-dom'
import { validateProfileForm } from '../utils/validation'

function StudentDashboard() {
  const { user, logout } = useAuth()

  const [activeSection, setActiveSection] = useState('overview')

  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])

  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordEmailLoading, setPasswordEmailLoading] = useState(false)
  const [cancelLoadingId, setCancelLoadingId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError('')

      const [profileRes, bookingsRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/bookings'),
      ])

      const profileData = profileRes.data?.data || null
      const bookingsData = bookingsRes.data?.data || []

      setProfile(profileData)
      setProfileForm({
        name: profileData?.name || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
      })
      setBookings(bookingsData)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [])

  const confirmedBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === 'confirmed').length
  }, [bookings])

  const pendingBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === 'pending').length
  }, [bookings])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
const handleRequestPasswordEmail = async () => {
    try {
      setPasswordEmailLoading(true)
      setError('')
      setSuccess('')

      const res = await api.post('/auth/password/change-request')
      setSuccess(res.data?.message || 'Check your email for the confirmation link.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the confirmation email.')
    } finally {
      setPasswordEmailLoading(false)
    }
  }
  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    const validationError = validateProfileForm(profileForm)
    if (validationError) {
      setError(validationError)
      setSuccess('')
      return
    }

    try {
      setProfileLoading(true)
      setError('')
      setSuccess('')

      const res = await api.put('/student/profile', profileForm)
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

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking?')
    if (!confirmed) return

    try {
      setCancelLoadingId(bookingId)
      setError('')
      setSuccess('')

      await api.patch(`/student/bookings/${bookingId}/cancel`)
      setSuccess('Booking cancelled successfully')
      await fetchStudentData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelLoadingId(null)
    }
  }

  const statusBadgeClass = (status) => {
    const normalized = String(status).toLowerCase()

    if (normalized === 'confirmed') return 'success'
    if (normalized === 'pending') return 'warning'
    if (normalized === 'cancelled') return 'danger'
    if (normalized === 'rejected') return 'secondary'

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
        <h1 className="fw-bold">Welcome back, {profile?.name || user?.name || 'Student'}</h1>
        <p className="text-muted mb-0">
          Manage your profile and follow your bookings from one place.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">My Bookings</div>
              <h2 className="fw-bold mb-0">{bookings.length}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Pending</div>
              <h2 className="fw-bold mb-0">{pendingBookings}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Confirmed</div>
              <h2 className="fw-bold mb-0">{confirmedBookings}</h2>
            </div>
          </div>
        </div>
      </div>

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
                    <th>Housing</th>
                    <th>Location</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.Housing?.title || 'N/A'}</td>
                      <td>{booking.Housing?.location || 'N/A'}</td>
                      <td>{booking.start_date}</td>
                      <td>{booking.end_date}</td>
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
        <hr className="my-4" />

        <h6 className="fw-bold mb-3">Change password</h6>
        <p className="text-muted small mb-3">
          For your security, we send a confirmation link to your account email (
          <strong>{profile?.email || user?.email}</strong>). Open the link, then choose your new password. The link
          expires in one hour.
        </p>
        <p className="text-muted small mb-3" dir="rtl">
          لأمان حسابك، نرسل رابط تأكيد إلى بريدك المسجّل. افتح الرابط من الإيميل ثم اختر كلمة المرور الجديدة (صالح
          لمدة ساعة).
        </p>
        <button
          type="button"
          className="btn btn-outline-primary"
          disabled={passwordEmailLoading}
          onClick={handleRequestPasswordEmail}
        >
          {passwordEmailLoading ? 'Sending...' : 'Send confirmation email'}
        </button>
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white fw-bold">My Bookings</div>
      <div className="card-body p-0">
        {bookings.length === 0 ? (
          <div className="text-center py-5 text-muted">No bookings found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Housing</th>
                  <th>Location</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th style={{ width: '120px' }}>Action</th>
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
                            'https://via.placeholder.com/60x60?text=No+Image'
                          }
                          alt={booking.Housing?.title || 'Housing'}
                          style={{
                            width: '52px',
                            height: '52px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                        <div>
                          <div className="fw-medium">{booking.Housing?.title || 'N/A'}</div>
                          <small className="text-muted">${booking.Housing?.price || 0}</small>
                        </div>
                      </div>
                    </td>
                    <td>{booking.Housing?.location || 'N/A'}</td>
                    <td>
                      <div>{booking.start_date}</div>
                      <small className="text-muted">{booking.end_date}</small>
                    </td>
                    <td>
                      <span className={`badge bg-${statusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status !== 'cancelled' ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancelLoadingId === booking.id}
                        >
                          {cancelLoadingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-muted small">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No bookings found
                    </td>
                  </tr>
                )}
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
          <div className="text-white-50">Student Dashboard</div>
        </div>

        <div className="bg-secondary bg-opacity-25 rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '44px', height: '44px', background: '#0d6efd' }}
          >
            {profile?.name?.[0] || user?.name?.[0] || 'S'}
          </div>
          <div>
            <div className="fw-bold">{profile?.name || user?.name || 'Student User'}</div>
            <span className="badge bg-primary">Student</span>
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
            className={`btn text-start ${activeSection === 'bookings' ? 'btn-primary' : 'btn-dark border-0 text-white-50'}`}
            onClick={() => setActiveSection('bookings')}
          >
            <i className="bi bi-calendar-check me-2"></i>My Bookings
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
            <p className="text-muted mt-3">Loading student dashboard...</p>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'bookings' && renderBookings()}
          </>
        )}
      </main>
    </div>
  )
}

export default StudentDashboard
