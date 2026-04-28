import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function AuthSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      navigate('/login')
      return
    }

    localStorage.setItem('token', token)

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))

      const user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      }

      localStorage.setItem('dormify_user', JSON.stringify(user))

      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'owner') {
        navigate('/owner/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (error) {
      navigate('/login')
    }
  }, [navigate, searchParams])

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5>Signing you in...</h5>
      </div>
    </div>
  )
}

export default AuthSuccess