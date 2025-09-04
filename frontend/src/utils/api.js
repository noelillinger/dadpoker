import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + '/api/v1',
  withCredentials: true,
})

let refreshing = null

api.interceptors.request.use((config) => {
  try {
    const token = sessionStorage.getItem('accessToken')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {}
  return config
})

api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config
    const url = (original && original.url) || ''
    // Do not try refresh for login/refresh endpoints
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return Promise.reject(error)
    }
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true
      try {
        if (!refreshing) {
          refreshing = api.post('/auth/refresh')
        }
        const { data } = await refreshing
        refreshing = null
        try { if (data?.access) sessionStorage.setItem('accessToken', data.access) } catch(e) {}
        return api(original)
      } catch (e) {
        refreshing = null
        try { sessionStorage.removeItem('accessToken') } catch(_) {}
        window.location.href = '/dadpoker/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(error)
  }
)

export default api


