import axios from 'axios'

// ==============================
// إعداد Axios للاتصال بالـ Backend
// سيتم استخدام هذا الملف عند ربط Express.js + MongoDB
// ==============================
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// إضافة JWT Token لكل طلب تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// التعامل مع أخطاء الاستجابة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dormify_user')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
