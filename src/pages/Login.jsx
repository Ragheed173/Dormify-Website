import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = login(form.email, form.password)

    if (result.success) {
      if (result.role === 'admin')   navigate('/admin/dashboard')
      else if (result.role === 'owner')   navigate('/owner/dashboard')
      else navigate('/student/dashboard')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ maxWidth: '440px', width: '100%', borderRadius: '16px' }}>
        {/* الهيدر */}
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <h3 className="fw-bold text-primary mb-1">
              <i className="bi bi-house-heart-fill me-2"></i>Dormify
            </h3>
          </Link>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="alert alert-info small mb-3">
          <strong>Demo accounts:</strong><br />
          student@dormify.com / student123<br />
          owner@dormify.com / owner123<br />
          admin@dormify.com / admin123
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-medium">Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-medium">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
            ) : (
              <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
            )}
          </button>
        </form>

        <p className="text-center text-muted mt-3 mb-0 small">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary fw-medium">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage