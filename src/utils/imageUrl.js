const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${SERVER_ORIGIN}${url}`
  return url
}