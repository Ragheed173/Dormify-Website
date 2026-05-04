import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isStrongPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required')
      setLoading(false)
      return
    }

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!isStrongPassword(form.password)) {
      setError(
        'Password must be at least 8 characters and include at least one letter and one number'
      )
      setLoading(false)
      return
    }

    const result = await register(
      form.name,
      form.email,
      form.password,
      form.phone,
      form.role
    )

    if (result.success) {
      if (result.role === 'admin') navigate('/admin/dashboard')
      else if (result.role === 'owner') navigate('/owner/dashboard')
      else navigate('/student/dashboard')
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{ maxWidth: '520px', width: '100%', borderRadius: '16px' }}
      >
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <h3 className="fw-bold text-primary mb-1">
              <i className="bi bi-house-heart-fill me-2"></i>Dormify
            </h3>
          </Link>
          <p className="text-muted">Create a new account</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-medium">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Phone Number</label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="059xxxxxxx"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Account Type</label>
            <select
              className="form-select"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <div className="mb-2">
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

          <div className="small text-muted mb-4">
            Password must be at least 8 characters and include at least one letter and one number.
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center my-3">
          <span className="text-muted">or</span>
        </div>

        <a
          href="http://localhost:5000/api/auth/google"
          className="btn btn-outline-danger w-100 py-2 fw-bold"
        >
          <i className="bi bi-google me-2"></i>
          Register with Google
        </a>

        <p className="text-center text-muted mt-3 mb-0 small">
          Already have an account?{' '}
          <Link to="/login" className="text-primary fw-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage