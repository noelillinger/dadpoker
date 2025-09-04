import { create } from 'zustand'

export const useToast = create((set) => ({
  items: [],
  push(message, kind = 'info') {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ items: [...s.items, { id, message, kind }] }))
    setTimeout(() => set((s) => ({ items: s.items.filter(t => t.id !== id) })), 3000)
  },
  clear() { set({ items: [] }) },
}))


