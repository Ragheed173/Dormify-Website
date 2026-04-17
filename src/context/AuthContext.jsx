import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('dormify_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('dormify_user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })

      const token = res.data.token
      const userData = res.data.user

      localStorage.setItem('token', token)
      localStorage.setItem('dormify_user', JSON.stringify(userData))
      setUser(userData)

      return {
        success: true,
        role: userData.role,
        user: userData,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (name, email, password, phone, role = 'student') => {
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        role,
      })

      const token = res.data.token
      const userData = res.data.user

      localStorage.setItem('token', token)
      localStorage.setItem('dormify_user', JSON.stringify(userData))
      setUser(userData)

      return {
        success: true,
        role: userData.role,
        user: userData,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Register failed',
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dormify_user')
    localStorage.removeItem('token')
  }
  

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
