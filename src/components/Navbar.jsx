import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'admin')   return '/admin/dashboard'
    if (user.role === 'owner')   return '/owner/dashboard'
    if (user.role === 'student') return '/student/dashboard'
    return '/'
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 text-primary" to="/">
          <i className="bi bi-house-heart-fill me-2"></i>
          Dormify
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/listings">Search</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium" href="#how-it-works">How it Works</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium" href="#about">About</a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Link>
                <span className="text-muted small">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn btn-danger btn-sm">
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
