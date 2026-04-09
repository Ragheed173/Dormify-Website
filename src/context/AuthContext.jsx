import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = [
  { name: 'Admin User',    email: 'admin@dormify.com',   password: 'admin123',   role: 'admin' },
  { name: 'Ahmad Student', email: 'student@dormify.com', password: 'student123', role: 'student' },
  { name: 'Khalid Owner',  email: 'owner@dormify.com',   password: 'owner123',   role: 'owner' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('dormify_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (email, password) => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )
    if (found) {
      const userData = { name: found.name, email: found.email, role: found.role }
      setUser(userData)
      localStorage.setItem('dormify_user', JSON.stringify(userData))
      localStorage.setItem('token', 'mock-jwt-token-' + found.role)
      return { success: true, role: found.role }
    }
    return { success: false, message: 'Invalid email or password' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dormify_user')
    localStorage.removeItem('token')
  }

  const register = (name, email, password, role) => {
    const userData = { name, email, role }
    setUser(userData)
    localStorage.setItem('dormify_user', JSON.stringify(userData))
    localStorage.setItem('token', 'mock-jwt-token-' + role)
    return { success: true, role }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
