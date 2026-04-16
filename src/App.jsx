import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage               from './pages/HomePage'
import ListingsPage           from './pages/ListingsPage'
import HousingDetailPage      from './pages/HousingDetailPage'
import LoginPage              from './pages/Login'
import RegisterPage           from './pages/Register'
import BookingConfirmationPage from './pages/BookingConfirmationPage'
import StudentDashboard       from './pages/StudentDashboard'
import OwnerDashboard         from './pages/OwnerDashboard'
import AdminDashboard         from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/listings"   element={<ListingsPage />} />
        <Route path="/housing/:id" element={<HousingDetailPage />} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />

        <Route
          path="/booking/confirm/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <p className="lead">Page not found</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
