import { create } from 'zustand'
import api from '../utils/api.js'

export const useAuthStore = create((set, get) => ({
  me: null,
  loading: false,
  accessToken: null,
  async login({ username, password }) {
    await api.post('/auth/login', { username, password })
    try {
      const { data } = await api.post('/auth/refresh')
      if (data?.access) {
        try { sessionStorage.setItem('accessToken', data.access) } catch (e) {}
        set({ accessToken: data.access })
      }
    } catch (_) {}
  },
  async logout() {
    await api.post('/auth/logout')
    try { sessionStorage.removeItem('accessToken') } catch(_) {}
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
    const { data } = await api.post('/auth/refresh')
    // data: { access, me }
    set({ accessToken: data.access, me: data.me || get().me })
    return data.access
  },
}))


