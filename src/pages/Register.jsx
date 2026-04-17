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
    confirm: '',
    phone: '',
    role: 'student',
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const e = {}

    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.password || form.password.length < 6) {
      e.password = 'Password must be at least 6 characters'
    }
    if (form.password !== form.confirm) {
      e.confirm = 'Passwords do not match'
    }

    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errs = validate()
    setErrors(errs)
    setSubmitError('')

    if (Object.keys(errs).length) return

    setLoading(true)

    const result = await register(
      form.name,
      form.email,
      form.password,
      form.phone,
      form.role
    )

    if (result.success) {
      if (result.role === 'admin') navigate('/admin/dashboard')
      else navigate('/student/dashboard')
    } else {
      setSubmitError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{ maxWidth: '480px', width: '100%', borderRadius: '16px' }}
      >
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <h3 className="fw-bold text-primary mb-1">
              <i className="bi bi-house-heart-fill me-2"></i>Dormify
            </h3>
          </Link>
          <p className="text-muted">Create your account</p>
        </div>

        {submitError && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-medium">Full Name</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={form.name}
              onChange={handleChange}
              placeholder="Ahmad Mohammad"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Email Address</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Phone</label>
            <input
              type="text"
              name="phone"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              value={form.phone}
              onChange={handleChange}
              placeholder="0599999999"
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Password</label>
            <input
              type="password"
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              className={`form-control ${errors.confirm ? 'is-invalid' : ''}`}
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
            {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
          </div>

          <input type="hidden" name="role" value="student" />

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus-fill me-2"></i>
                Create Account
              </>
            )}
          </button>
        </form>

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