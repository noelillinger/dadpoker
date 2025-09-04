import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + '/api/v1',
  withCredentials: true,
})

let refreshing = null

api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true
      try {
        if (!refreshing) {
          refreshing = api.post('/auth/refresh')
        }
        await refreshing
        refreshing = null
        return api(original)
      } catch (e) {
        refreshing = null
        window.location.href = '/dadpoker/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(error)
  }
)

export default api


