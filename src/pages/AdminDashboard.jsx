import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockHousings, mockBookings, mockMaintenanceReports, mockUsers } from '../api/mockData'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [userSearch, setUserSearch] = useState('')
  const [userRole, setUserRole] = useState('')
  const [reportFilter, setReportFilter] = useState('')

  const handleLogout = () => { logout(); navigate('/') }

  const statusBadge = (status) => {
    if (['Confirmed', 'Available', 'Paid', 'Active', 'Resolved'].includes(status)) return 'success'
    if (['Pending', 'In Progress', 'Under Review'].includes(status)) return 'warning'
    if (['Cancelled', 'Inactive', 'Open'].includes(status)) return 'danger'
    if (['Booked'].includes(status)) return 'info'
    return 'secondary'
  }

  const cityStats = [
    { city: 'Ramallah', count: 145, pct: 42 },
    { city: 'Nablus',   count: 98,  pct: 28 },
    { city: 'Hebron',   count: 62,  pct: 18 },
    { city: 'Jenin',    count: 37,  pct: 11 },
  ]

  const newHousingRequests = [
    { id: 1, name: 'Mountain View Apartment', owner: 'Nour Salem',   city: 'Ramallah', date: '2024-04-18' },
    { id: 2, name: 'City Center Studio',      owner: 'Rami Hassan',  city: 'Nablus',   date: '2024-04-19' },
    { id: 3, name: 'Student Complex',         owner: 'Lara Khalil',  city: 'Hebron',   date: '2024-04-20' },
  ]

  const filteredUsers = mockUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchRole   = userRole ? u.role.toLowerCase() === userRole.toLowerCase() : true
    return matchSearch && matchRole
  })

  const filteredReports = reportFilter
    ? mockMaintenanceReports.filter((r) => r.status === reportFilter)
    : mockMaintenanceReports

  const navItems = [
    { key: 'overview',     icon: 'bi-speedometer2',    label: 'Overview' },
    { key: 'users',        icon: 'bi-people',           label: 'Manage Users' },
    { key: 'housing',      icon: 'bi-houses',           label: 'Manage Housing' },
    { key: 'bookings',     icon: 'bi-calendar-check',   label: 'Manage Bookings' },
    { key: 'maintenance',  icon: 'bi-tools',            label: 'Maintenance Reports' },
    { key: 'analytics',    icon: 'bi-bar-chart-line',   label: 'Reports & Analytics' },
    { key: 'settings',     icon: 'bi-gear',             label: 'Settings' },
  ]

  return (
    <div className="d-flex min-vh-100 bg-light">

      <div className="bg-dark text-white d-flex flex-column"
        style={{ width: '260px', minWidth: '260px', padding: '24px 16px' }}>
        <div className="mb-4 px-2">
          <h5 className="fw-bold text-primary mb-0">
            <i className="bi bi-house-heart-fill me-2"></i>Dormify
          </h5>
          <small className="text-secondary">Admin Control Panel</small>
        </div>

        <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-2 p-2 mb-4">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '40px', height: '40px', fontSize: '12px', flexShrink: 0 }}>
            AD
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p className="mb-0 small fw-bold text-white text-truncate">{user?.name}</p>
            <span className="badge bg-primary" style={{ fontSize: '10px' }}>Administrator</span>
          </div>
        </div>

        <nav className="flex-grow-1">
          {navItems.map((item) => (
            <button key={item.key}
              className={`w-100 text-start d-flex align-items-center gap-2 border-0 rounded-2 mb-1 px-3 py-2 small fw-medium
                ${activeTab === item.key
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-secondary'}`}
              onClick={() => setActiveTab(item.key)}
              style={{ transition: 'all 0.2s' }}
            >
              <i className={`bi ${item.icon}`}></i>{item.label}
            </button>
          ))}
        </nav>

        <button className="btn btn-outline-danger btn-sm mt-3 d-flex align-items-center gap-2"
          onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>Logout
        </button>
      </div>

      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>

        <div className="mb-4">
          <h4 className="fw-bold mb-0">{navItems.find(n => n.key === activeTab)?.label}</h4>
          <small className="text-muted">Dormify Admin Panel — Full Control</small>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="row g-3 mb-4">
              {[
                { label: 'Total Users',      value: '1,240', icon: 'bi-people-fill',     color: 'primary', change: '+12%' },
                { label: 'Available Units',  value: '87',    icon: 'bi-house-fill',       color: 'success', change: '+5' },
                { label: 'Active Bookings',  value: '342',   icon: 'bi-calendar-check-fill', color: 'warning', change: '+28' },
                { label: 'Pending Reports',  value: '15',    icon: 'bi-flag-fill',        color: 'danger',  change: '-3' },
              ].map((s) => (
                <div key={s.label} className="col-6 col-xl-3">
                  <div className="card border-0 shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="text-muted small mb-1">{s.label}</p>
                        <h3 className="fw-bold mb-0">{s.value}</h3>
                        <small className={`text-${s.color}`}>{s.change} this month</small>
                      </div>
                      <div className={`bg-${s.color} bg-opacity-10 rounded-2 p-2`}>
                        <i className={`bi ${s.icon} text-${s.color} fs-4`}></i>
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
                    <i className="bi bi-clock-history me-2 text-primary"></i>Recent Bookings
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Student</th><th>Housing</th><th>City</th>
                            <th>Amount</th><th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockBookings.map((b) => (
                            <tr key={b.id}>
                              <td className="fw-medium small">{b.student}</td>
                              <td className="small text-muted">{b.housingName}</td>
                              <td className="small">{b.city}</td>
                              <td className="fw-bold text-primary small">${b.amount}</td>
                              <td>
                                <span className={`badge bg-${statusBadge(b.status)}`}>{b.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white fw-bold border-bottom">
                    <i className="bi bi-bar-chart me-2 text-primary"></i>Bookings by City
                  </div>
                  <div className="card-body">
                    {cityStats.map((c) => (
                      <div key={c.city} className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-medium">{c.city}</span>
                          <span className="text-muted">{c.count} bookings</span>
                        </div>
                        <div className="progress" style={{ height: '10px', borderRadius: '99px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${c.pct}%`, borderRadius: '99px' }}
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
                <i className="bi bi-house-add me-2 text-warning"></i>New Housing Requests
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>Housing Name</th><th>Owner</th><th>City</th><th>Date Added</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {newHousingRequests.map((r) => (
                        <tr key={r.id}>
                          <td className="fw-medium">{r.name}</td>
                          <td className="text-muted">{r.owner}</td>
                          <td>{r.city}</td>
                          <td className="text-muted small">{r.date}</td>
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

        {activeTab === 'users' && (
          <>
            <div className="d-flex gap-2 mb-3 flex-wrap">
              <input type="text" className="form-control" style={{ maxWidth: '280px' }}
                placeholder="Search by name or email..."
                value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              <select className="form-select" style={{ maxWidth: '160px' }}
                value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn btn-primary ms-auto">
                <i className="bi bi-person-plus me-1"></i>Add User
              </button>
            </div>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="fw-medium">{u.name}</td>
                          <td className="text-muted small">{u.email}</td>
                          <td>
                            <span className={`badge bg-${u.role === 'Admin' ? 'danger' : u.role === 'Owner' ? 'success' : 'primary'} bg-opacity-10 text-${u.role === 'Admin' ? 'danger' : u.role === 'Owner' ? 'success' : 'primary'} border`}>
                              {u.role}
                            </span>
                          </td>
                          <td><span className={`badge bg-${statusBadge(u.status)}`}>{u.status}</span></td>
                          <td className="text-muted small">{u.joined}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-outline-primary btn-sm"><i className="bi bi-pencil"></i></button>
                              <button className="btn btn-outline-danger btn-sm"><i className="bi bi-trash"></i></button>
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

        {activeTab === 'housing' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold border-bottom d-flex justify-content-between">
              <span>All Housing Units</span>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-plus-lg me-1"></i>Add Listing
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr><th>Housing Name</th><th>Owner</th><th>City</th><th>Price/night</th><th>Rooms</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {mockHousings.map((h) => (
                      <tr key={h.id}>
                        <td className="fw-medium">{h.title}</td>
                        <td className="text-muted">{h.owner}</td>
                        <td>{h.city}</td>
                        <td className="text-primary fw-bold">${h.price}</td>
                        <td>{h.rooms}</td>
                        <td><span className="badge bg-success">Available</span></td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-outline-primary btn-sm"><i className="bi bi-eye"></i></button>
                            <button className="btn btn-outline-warning btn-sm"><i className="bi bi-pencil"></i></button>
                            <button className="btn btn-outline-danger btn-sm"><i className="bi bi-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr><th>Student</th><th>Housing</th><th>City</th><th>Room Type</th><th>Check In</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {mockBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="fw-medium">{b.student}</td>
                        <td>{b.housingName}</td>
                        <td className="text-muted">{b.city}</td>
                        <td className="small">{b.roomType}</td>
                        <td className="text-muted small">{b.checkIn}</td>
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

        {activeTab === 'maintenance' && (
          <>
            <div className="mb-3 d-flex gap-2">
              <select className="form-select" style={{ maxWidth: '200px' }}
                value={reportFilter} onChange={(e) => setReportFilter(e.target.value)}>
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
                      <tr><th>Title</th><th>Student</th><th>Housing</th><th>Type</th><th>Date</th><th>Status</th><th>Update</th></tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((r) => (
                        <tr key={r.id}>
                          <td className="fw-medium">{r.title}</td>
                          <td className="text-muted">{r.student}</td>
                          <td>{r.housing}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {r.type === 'Plumbing' ? '🔧' : r.type === 'Electrical' ? '⚡' : '📶'} {r.type}
                            </span>
                          </td>
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
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm p-4">
                <h6 className="fw-bold mb-4"><i className="bi bi-bar-chart me-2 text-primary"></i>Platform Statistics</h6>
                <div className="row g-3 mb-4">
                  {[
                    { label: 'Total Revenue',     value: '$48,200', color: 'success' },
                    { label: 'Monthly Revenue',   value: '$6,400',  color: 'primary' },
                    { label: 'Avg Booking Value', value: '$141',    color: 'warning' },
                    { label: 'Conversion Rate',   value: '68%',     color: 'info' },
                  ].map((s) => (
                    <div key={s.label} className="col-6 col-md-3">
                      <div className="bg-light rounded-2 p-3 text-center">
                        <p className="text-muted small mb-1">{s.label}</p>
                        <h4 className={`fw-bold text-${s.color} mb-0`}>{s.value}</h4>
                      </div>
                    </div>
                  ))}
                </div>
                <h6 className="fw-bold mb-3">Bookings by City</h6>
                {cityStats.map((c) => (
                  <div key={c.city} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-medium">{c.city}</span>
                      <span className="text-muted">{c.count} bookings ({c.pct}%)</span>
                    </div>
                    <div className="progress" style={{ height: '14px', borderRadius: '99px' }}>
                      <div className="progress-bar bg-primary" style={{ width: `${c.pct}%`, borderRadius: '99px' }}>
                        {c.pct}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4">
                <h6 className="fw-bold mb-4">Admin Account Settings</h6>
                <div className="mb-3">
                  <label className="form-label small fw-medium">Full Name</label>
                  <input type="text" className="form-control" defaultValue={user?.name} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-medium">Email</label>
                  <input type="email" className="form-control" defaultValue={user?.email} />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-medium">New Password</label>
                  <input type="password" className="form-control" placeholder="Leave blank to keep current" />
                </div>
                <button className="btn btn-primary">
                  <i className="bi bi-check2 me-2"></i>Save Changes
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4">
                <h6 className="fw-bold mb-4">Platform Settings</h6>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="fw-medium mb-0 small">Allow New Registrations</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Let new users register on the platform</p>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="fw-medium mb-0 small">Auto-approve Listings</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Approve new housing without review</p>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="fw-medium mb-0 small">Maintenance Notifications</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Email notifications for new reports</p>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard
