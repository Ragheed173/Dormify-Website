import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ==============================
// مكوّن حماية المسارات
// يتحقق من تسجيل الدخول والصلاحية قبل عرض الصفحة
// ==============================
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()

  // إذا مش مسجّل دخول → روّح على صفحة اللوقين
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // إذا الدور مش مسموح → روّح على الهوم
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
