import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockBookings, mockPayments, mockMaintenanceReports } from '../api/mockData'

function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')
  const [reportForm, setReportForm] = useState({ title: '', description: '', type: 'Plumbing' })
  const [reportSent, setReportSent] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const handleReportSubmit = (e) => {
    e.preventDefault()
    setReportSent(true)
    setReportForm({ title: '', description: '', type: 'Plumbing' })
    setTimeout(() => setReportSent(false), 3000)
  }

  const statusBadge = (status) => {
    if (status === 'Confirmed')   return 'success'
    if (status === 'Pending')     return 'warning'
    if (status === 'Cancelled')   return 'danger'
    if (status === 'Paid')        return 'success'
    if (status === 'Resolved')    return 'success'
    if (status === 'In Progress') return 'warning'
    if (status === 'Open')        return 'danger'
    return 'secondary'
  }

  const navItems = [
    { key: 'bookings',     icon: 'bi-calendar-check', label: 'My Bookings' },
    { key: 'payments',     icon: 'bi-credit-card',    label: 'Payments' },
    { key: 'maintenance',  icon: 'bi-tools',          label: 'Maintenance' },
    { key: 'settings',     icon: 'bi-gear',           label: 'Settings' },
  ]

  return (
    <div className="d-flex min-vh-100 bg-light">

      <div className="bg-white shadow-sm d-flex flex-column"
        style={{ width: '250px', minWidth: '250px', padding: '24px 16px' }}>

        <div className="mb-4 px-2">
          <h5 className="fw-bold text-primary mb-0">
            <i className="bi bi-house-heart-fill me-2"></i>Dormify
          </h5>
          <small className="text-muted">Student Panel</small>
        </div>

        <div className="d-flex align-items-center gap-2 bg-light rounded-2 p-2 mb-4">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '40px', height: '40px', fontSize: '12px', flexShrink: 0 }}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p className="mb-0 small fw-bold text-truncate">{user?.name}</p>
            <p className="mb-0 small text-muted text-truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav flex-grow-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-link w-100 text-start d-flex align-items-center gap-2 ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="btn btn-outline-danger btn-sm mt-3 d-flex align-items-center gap-2"
          onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>Logout
        </button>
      </div>

      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">
              {navItems.find(n => n.key === activeTab)?.label}
            </h4>
            <small className="text-muted">Welcome back, {user?.name?.split(' ')[0]}!</small>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/listings')}>
            <i className="bi bi-search me-1"></i>Find Housing
          </button>
        </div>

        {activeTab === 'bookings' && (
          <>
            <div className="row g-3 mb-4">
              {[
                { label: 'Total Bookings', value: mockBookings.length, icon: 'bi-calendar-check', color: 'primary' },
                { label: 'Confirmed',      value: mockBookings.filter(b => b.status === 'Confirmed').length, icon: 'bi-check-circle', color: 'success' },
                { label: 'Pending',        value: mockBookings.filter(b => b.status === 'Pending').length,   icon: 'bi-clock',        color: 'warning' },
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

            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Housing</th>
                        <th>City</th>
                        <th>Room Type</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockBookings.map((b) => (
                        <tr key={b.id}>
                          <td className="fw-medium">{b.housingName}</td>
                          <td className="text-muted">{b.city}</td>
                          <td>{b.roomType}</td>
                          <td className="text-muted small">{b.checkIn}</td>
                          <td className="text-muted small">{b.checkOut}</td>
                          <td className="fw-bold text-primary">${b.amount}</td>
                          <td>
                            <span className={`badge bg-${statusBadge(b.status)}`}>{b.status}</span>
                          </td>
                          <td>
                            <button className="btn btn-outline-primary btn-sm">
                              <i className="bi bi-eye me-1"></i>View
                            </button>
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

        {activeTab === 'payments' && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-4">
                <div className="stat-card p-3">
                  <p className="text-muted small mb-1">Total Paid</p>
                  <h4 className="fw-bold text-success mb-0">
                    ${mockPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)}
                  </h4>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="stat-card p-3">
                  <p className="text-muted small mb-1">Pending</p>
                  <h4 className="fw-bold text-warning mb-0">
                    ${mockPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)}
                  </h4>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="stat-card p-3">
                  <p className="text-muted small mb-1">Total Transactions</p>
                  <h4 className="fw-bold mb-0">{mockPayments.length}</h4>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Housing</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="text-muted small">{p.date}</td>
                          <td className="fw-medium">{p.housing}</td>
                          <td>
                            <i className={`bi ${p.method === 'Online' ? 'bi-credit-card' : 'bi-cash-stack'} me-1`}></i>
                            {p.method}
                          </td>
                          <td className="fw-bold">${p.amount}</td>
                          <td>
                            <span className={`badge bg-${statusBadge(p.status)}`}>{p.status}</span>
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

        {activeTab === 'maintenance' && (
          <>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white fw-bold border-bottom">
                <i className="bi bi-tools me-2 text-primary"></i>Send Maintenance Report
              </div>
              <div className="card-body">
                {reportSent && (
                  <div className="alert alert-success d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill"></i>
                    Report sent successfully! We'll get back to you soon.
                  </div>
                )}
                <form onSubmit={handleReportSubmit}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-medium">Report Title</label>
                      <input type="text" className="form-control" required
                        placeholder="e.g. Water leak in bathroom"
                        value={reportForm.title}
                        onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-medium">Problem Type</label>
                      <select className="form-select"
                        value={reportForm.type}
                        onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}>
                        <option value="Plumbing">🔧 Plumbing</option>
                        <option value="Electrical">⚡ Electrical</option>
                        <option value="Network">📶 Network / WiFi</option>
                        <option value="Other">📋 Other</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Description</label>
                      <textarea className="form-control" rows="3" required
                        placeholder="Describe the problem in detail..."
                        value={reportForm.description}
                        onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Attach Image (optional)</label>
                      <input type="file" className="form-control" accept="image/*" />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-send me-2"></i>Send Report
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-bold border-bottom">
                Previous Reports
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Housing</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockMaintenanceReports.map((r) => (
                        <tr key={r.id}>
                          <td className="fw-medium">{r.title}</td>
                          <td className="text-muted">{r.housing}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {r.type === 'Plumbing' ? '🔧' : r.type === 'Electrical' ? '⚡' : '📶'} {r.type}
                            </span>
                          </td>
                          <td className="text-muted small">{r.date}</td>
                          <td>
                            <span className={`badge bg-${statusBadge(r.status)}`}>{r.status}</span>
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
            <div className="mb-3">
              <label className="form-label small fw-medium">Phone</label>
              <input type="text" className="form-control" placeholder="+970 59 000 0000" />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-medium">New Password</label>
              <input type="password" className="form-control" placeholder="Leave blank to keep current" />
            </div>
            <button className="btn btn-primary">
              <i className="bi bi-check2 me-2"></i>Save Changes
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default StudentDashboard
