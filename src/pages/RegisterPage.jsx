import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.name)               e.name = 'Name is required'
    if (!form.email)              e.email = 'Email is required'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const result = register(form.name, form.email, form.password, form.role)
    if (result.success) {
      if (result.role === 'owner') navigate('/owner/dashboard')
      else navigate('/student/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ maxWidth: '480px', width: '100%', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <h3 className="fw-bold text-primary mb-1">
              <i className="bi bi-house-heart-fill me-2"></i>Dormify
            </h3>
          </Link>
          <p className="text-muted">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-medium">Full Name</label>
            <input type="text" name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={form.name} onChange={handleChange} placeholder="Ahmad Mohammad" />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Email Address</label>
            <input type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={form.email} onChange={handleChange} placeholder="your@email.com" />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Password</label>
            <input type="password" name="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Confirm Password</label>
            <input type="password" name="confirm" className={`form-control ${errors.confirm ? 'is-invalid' : ''}`}
              value={form.confirm} onChange={handleChange} placeholder="Repeat your password" />
            {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label fw-medium">I am a...</label>
            <div className="row g-2">
              {[
                { value: 'student', icon: 'bi-mortarboard', label: 'Student' },
                { value: 'owner',   icon: 'bi-building',    label: 'Housing Owner' },
              ].map((r) => (
                <div key={r.value} className="col">
                  <div
                    className={`p-3 rounded-2 border text-center cursor-pointer ${form.role === r.value ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setForm({ ...form, role: r.value })}
                  >
                    <i className={`bi ${r.icon} fs-4 ${form.role === r.value ? 'text-primary' : 'text-muted'}`}></i>
                    <p className={`mb-0 small fw-medium mt-1 ${form.role === r.value ? 'text-primary' : 'text-muted'}`}>{r.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</>
            ) : (
              <><i className="bi bi-person-plus me-2"></i>Create Account</>
            )}
          </button>
        </form>

        <p className="text-center text-muted mt-3 mb-0 small">
          Already have an account?{' '}
          <Link to="/login" className="text-primary fw-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
