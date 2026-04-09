import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockHousings, mockBookings, mockPayments, mockMaintenanceReports } from '../api/mockData'

// ==============================
// لوحة تحكم المالك
// ==============================
function OwnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('listings')
  const [showModal, setShowModal] = useState(false)
  const [newListing, setNewListing] = useState({
    title: '', city: '', area: '', price: '', rooms: '',
    bathrooms: '', description: '', wifi: false,
  })
  const [listings, setListings] = useState(mockHousings.slice(0, 3))

  const handleLogout = () => { logout(); navigate('/') }

  const handleAddListing = (e) => {
    e.preventDefault()
    // استبدل بـ api.post('/housings') عند ربط الباك ايند
    const newItem = {
      ...newListing,
      id: Date.now(),
      price: parseInt(newListing.price),
      rooms: parseInt(newListing.rooms),
      bathrooms: parseInt(newListing.bathrooms),
      image: `https://picsum.photos/600/400?random=${Date.now()}`,
      images: [`https://picsum.photos/600/400?random=${Date.now()}`],
      status: 'Available',
      owner: user?.name,
      rating: 0,
      reviews: 0,
    }
    setListings([...listings, newItem])
    setShowModal(false)
    setNewListing({ title: '', city: '', area: '', price: '', rooms: '', bathrooms: '', description: '', wifi: false })
  }

  const statusBadge = (status) => {
    if (status === 'Confirmed' || status === 'Available') return 'success'
    if (status === 'Pending')     return 'warning'
    if (status === 'Cancelled')   return 'danger'
    if (status === 'Paid')        return 'success'
    if (status === 'Resolved')    return 'success'
    if (status === 'In Progress') return 'warning'
    if (status === 'Open')        return 'danger'
    if (status === 'Booked')      return 'info'
    return 'secondary'
  }

  const navItems = [
    { key: 'listings',     icon: 'bi-houses',       label: 'My Listings' },
    { key: 'bookings',     icon: 'bi-calendar-check', label: 'Bookings' },
    { key: 'payments',     icon: 'bi-cash-stack',   label: 'Payments' },
    { key: 'maintenance',  icon: 'bi-tools',        label: 'Maintenance' },
    { key: 'settings',     icon: 'bi-gear',         label: 'Settings' },
  ]

  return (
    <div className="d-flex min-vh-100 bg-light">

      {/* ===== SIDEBAR ===== */}
      <div className="bg-white shadow-sm d-flex flex-column"
        style={{ width: '250px', minWidth: '250px', padding: '24px 16px' }}>
        <div className="mb-4 px-2">
          <h5 className="fw-bold text-primary mb-0">
            <i className="bi bi-house-heart-fill me-2"></i>Dormify
          </h5>
          <small className="text-muted">Owner Panel</small>
        </div>

        <div className="d-flex align-items-center gap-2 bg-light rounded-2 p-2 mb-4">
          <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '40px', height: '40px', fontSize: '12px', flexShrink: 0 }}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p className="mb-0 small fw-bold text-truncate">{user?.name}</p>
            <span className="badge bg-success-subtle text-success" style={{ fontSize: '10px' }}>Owner</span>
          </div>
        </div>

        <nav className="sidebar-nav flex-grow-1">
          {navItems.map((item) => (
            <button key={item.key}
              className={`nav-link w-100 text-start d-flex align-items-center gap-2 ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}>
              <i className={`bi ${item.icon}`}></i>{item.label}
            </button>
          ))}
        </nav>

        <button className="btn btn-outline-danger btn-sm mt-3 d-flex align-items-center gap-2"
          onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>Logout
        </button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">{navItems.find(n => n.key === activeTab)?.label}</h4>
            <small className="text-muted">Manage your properties</small>
          </div>
        </div>

        {/* ===== TAB: MY LISTINGS ===== */}
        {activeTab === 'listings' && (
          <>
            {/* إحصائيات */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Total Listings',  value: listings.length,   icon: 'bi-houses',       color: 'primary' },
                { label: 'Active Bookings', value: 12,                icon: 'bi-calendar-check', color: 'success' },
                { label: 'Total Revenue',   value: '$2,400',          icon: 'bi-cash-stack',   color: 'warning' },
              ].map((s) => (
                <div key={s.label} className="col-12 col-sm-4">
                  <div className="stat-card p-3 d-flex align-items-center gap-3">
                    <div className={`bg-${s.color} bg-opacity-10 rounded-2 p-2`}>
                      <i className={`bi ${s.icon} text-${s.color} fs-5`}></i>
                    </div>
                    <div>
                      <p className="text-muted small mb-0">{s.label}</p>
                      <h5 className="fw-bold mb-0">{s.value}</h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* زر إضافة + جدول */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <span className="fw-bold">My Properties</span>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                  <i className="bi bi-plus-lg me-1"></i>Add New Listing
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Housing Name</th><th>City</th><th>Price/night</th>
                        <th>Rooms</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((h) => (
                        <tr key={h.id}>
                          <td className="fw-medium">{h.title}</td>
                          <td className="text-muted">{h.city}</td>
                          <td className="text-primary fw-bold">${h.price}</td>
                          <td>{h.rooms}</td>
                          <td><span className={`badge bg-${statusBadge(h.status || 'Available')}`}>{h.status || 'Available'}</span></td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-outline-primary btn-sm">
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-outline-danger btn-sm"
                                onClick={() => setListings(listings.filter(l => l.id !== h.id))}>
                                <i className="bi bi-trash"></i>
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

        {/* ===== TAB: BOOKINGS ===== */}
        {activeTab === 'bookings' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th><th>Housing</th><th>Room Type</th>
                      <th>Check In</th><th>Check Out</th><th>Amount</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="fw-medium">{b.student}</td>
                        <td>{b.housingName}</td>
                        <td className="text-muted small">{b.roomType}</td>
                        <td className="text-muted small">{b.checkIn}</td>
                        <td className="text-muted small">{b.checkOut}</td>
                        <td className="fw-bold text-primary">${b.amount}</td>
                        <td><span className={`badge bg-${statusBadge(b.status)}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: PAYMENTS ===== */}
        {activeTab === 'payments' && (
          <>
            <div className="row g-3 mb-4">
              {[
                { label: 'Total Received', value: '$1,800', color: 'success' },
                { label: 'Pending',        value: '$200',   color: 'warning' },
                { label: 'This Month',     value: '$600',   color: 'primary' },
              ].map((s) => (
                <div key={s.label} className="col-12 col-sm-4">
                  <div className="stat-card p-3">
                    <p className="text-muted small mb-1">{s.label}</p>
                    <h4 className={`fw-bold text-${s.color} mb-0`}>{s.value}</h4>
                  </div>
                </div>
              ))}
            </div>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>Date</th><th>Student</th><th>Housing</th><th>Amount</th><th>Method</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {mockPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="text-muted small">{p.date}</td>
                          <td>Ahmad Student</td>
                          <td>{p.housing}</td>
                          <td className="fw-bold">${p.amount}</td>
                          <td>{p.method}</td>
                          <td><span className={`badge bg-${statusBadge(p.status)}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== TAB: MAINTENANCE ===== */}
        {activeTab === 'maintenance' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr><th>Title</th><th>Student</th><th>Housing</th><th>Type</th><th>Date</th><th>Status</th><th>Update</th></tr>
                  </thead>
                  <tbody>
                    {mockMaintenanceReports.map((r) => (
                      <tr key={r.id}>
                        <td className="fw-medium">{r.title}</td>
                        <td className="text-muted">{r.student}</td>
                        <td>{r.housing}</td>
                        <td><span className="badge bg-light text-dark border">{r.type}</span></td>
                        <td className="text-muted small">{r.date}</td>
                        <td><span className={`badge bg-${statusBadge(r.status)}`}>{r.status}</span></td>
                        <td>
                          <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: SETTINGS ===== */}
        {activeTab === 'settings' && (
          <div className="card border-0 shadow-sm p-4" style={{ maxWidth: '500px' }}>
            <h6 className="fw-bold mb-4">Account Settings</h6>
            <div className="mb-3">
              <label className="form-label small fw-medium">Full Name</label>
              <input type="text" className="form-control" defaultValue={user?.name} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Email</label>
              <input type="email" className="form-control" defaultValue={user?.email} />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-medium">Phone</label>
              <input type="text" className="form-control" placeholder="+970 59 000 0000" />
            </div>
            <button className="btn btn-primary">
              <i className="bi bi-check2 me-2"></i>Save Changes
            </button>
          </div>
        )}
      </div>

      {/* ===== MODAL: Add New Listing ===== */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Add New Listing</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form id="addListingForm" onSubmit={handleAddListing}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-medium">Housing Title *</label>
                      <input type="text" className="form-control" required
                        placeholder="e.g. Modern Apartment near University"
                        value={newListing.title}
                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-medium">Price / Night ($) *</label>
                      <input type="number" className="form-control" required
                        placeholder="e.g. 150"
                        value={newListing.price}
                        onChange={(e) => setNewListing({ ...newListing, price: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">City *</label>
                      <select className="form-select" required
                        value={newListing.city}
                        onChange={(e) => setNewListing({ ...newListing, city: e.target.value })}>
                        <option value="">Select City</option>
                        {['Ramallah', 'Nablus', 'Hebron', 'Jenin', 'Tulkarm'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Area / Neighborhood</label>
                      <input type="text" className="form-control"
                        placeholder="e.g. Al-Bireh"
                        value={newListing.area}
                        onChange={(e) => setNewListing({ ...newListing, area: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Number of Rooms *</label>
                      <input type="number" className="form-control" required min="1"
                        value={newListing.rooms}
                        onChange={(e) => setNewListing({ ...newListing, rooms: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Bathrooms *</label>
                      <input type="number" className="form-control" required min="1"
                        value={newListing.bathrooms}
                        onChange={(e) => setNewListing({ ...newListing, bathrooms: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Description</label>
                      <textarea className="form-control" rows="3"
                        placeholder="Describe your property..."
                        value={newListing.description}
                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium d-block">Upload Images</label>
                      <input type="file" className="form-control" accept="image/*" multiple />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="wifiCheck"
                          checked={newListing.wifi}
                          onChange={(e) => setNewListing({ ...newListing, wifi: e.target.checked })} />
                        <label className="form-check-label small" htmlFor="wifiCheck">
                          <i className="bi bi-wifi me-1"></i> WiFi Included
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" form="addListingForm" type="submit">
                  <i className="bi bi-plus-lg me-1"></i>Add Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerDashboard
