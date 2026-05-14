import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axiosInstance'
import { validatePasswordChangeConfirm } from '../utils/validation'

function PasswordChangeConfirmPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const tokenFromUrl = useMemo(() => {
    const raw = searchParams.get('token')
    if (!raw) return ''
    try {
      return decodeURIComponent(raw).trim()
    } catch {
      return String(raw).trim()
    }
  }, [searchParams])

  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validatePasswordChangeConfirm({ newPassword, newPasswordConfirm })
    if (validationError) {
      setError(validationError)
      return
    }

    if (!tokenFromUrl || tokenFromUrl.length !== 64) {
      setError('Invalid or missing link. Open the link from your email, or request a new one from your dashboard.')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/auth/password/change-complete', {
        token: tokenFromUrl,
        newPassword,
      })
      setSuccess(res.data?.message || 'Password updated successfully.')
      setNewPassword('')
      setNewPasswordConfirm('')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{ maxWidth: '440px', width: '100%', borderRadius: '16px' }}
      >
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <h3 className="fw-bold text-primary mb-1">
              <i className="bi bi-house-heart-fill me-2"></i>Dormify
            </h3>
          </Link>
          <p className="text-muted mb-0">Set your new password</p>
          <p className="text-muted small mb-0" dir="rtl">
            اختر كلمة المرور الجديدة
          </p>
        </div>

        {!tokenFromUrl && (
          <div className="alert alert-warning">
            This page needs a valid link from your email. Request a new link from your student or owner dashboard.
          </div>
        )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            {success} Redirecting to sign in…
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-medium">New password</label>
            <input
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!tokenFromUrl || !!success}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Confirm new password</label>
            <input
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              disabled={!tokenFromUrl || !!success}
            />
          </div>

          <p className="text-muted small mb-3">
            At least 8 characters with one uppercase letter, one number, and one special character.
          </p>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mb-3"
            disabled={loading || !tokenFromUrl || !!success}
          >
            {loading ? 'Saving...' : 'Save new password'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-decoration-none small">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordChangeConfirmPage