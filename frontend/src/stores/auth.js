import { create } from 'zustand'
import api from '../utils/api.js'

export const useAuthStore = create((set, get) => ({
  me: null,
  loading: false,
  accessToken: null,
  async login({ username, password }) {
    const { data } = await api.post('/auth/login', { username, password })
    try {
      if (data?.access) {
        sessionStorage.setItem('accessToken', data.access)
        set({ accessToken: data.access, me: data.me })
      }
      if (data?.refresh) sessionStorage.setItem('refreshToken', data.refresh)
    } catch (_) {}
  },
  async logout() {
    await api.post('/auth/logout')
    try { sessionStorage.removeItem('accessToken') } catch(_) {}
    try { sessionStorage.removeItem('refreshToken') } catch(_) {}
    set({ me: null, accessToken: null })
  },
  async fetchMe() {
    set({ loading: true })
    try {
      const { data } = await api.get('/me')
      set({ me: data })
    } finally {
      set({ loading: false })
    }
  },
  async refresh() {
    const rt = sessionStorage.getItem('refreshToken')
    const headers = rt ? { Authorization: `Bearer ${rt}` } : undefined
    const { data } = await api.post('/auth/refresh', undefined, { headers })
    // data: { access, me }
    try {
      if (data?.access) sessionStorage.setItem('accessToken', data.access)
      if (data?.refresh) sessionStorage.setItem('refreshToken', data.refresh)
    } catch (_) {}
    set({ accessToken: data.access, me: data.me || get().me })
    return data.access
  },
}))


