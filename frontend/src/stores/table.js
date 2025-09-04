import { create } from 'zustand'
import { useAuthStore } from './auth.js'

function wsBase() {
  const base = import.meta.env.VITE_API_BASE
  return base.replace('http', 'ws')
}

export const useTableStore = create((set, get) => ({
  tableId: 'default',
  ws: null,
  connected: false,
  state: null,
  wsError: null,
  async connect() {
    let url = `${wsBase()}/ws/table/${get().tableId}`
    // append token fallback if cookies blocked
    try {
      const access = await useAuthStore.getState().refresh()
      if (access) url += `?token=${encodeURIComponent(access)}`
    } catch {}
    const ws = new WebSocket(url)
    ws.onopen = () => {
      set({ connected: true, wsError: null })
      // join as current user for name display
      const me = useAuthStore.getState().me
      if (me?.username) {
        get().send({ type: 'JOIN_AS_USER', name: me.username })
      }
    }
    ws.onclose = () => {
      set({ connected: false, ws: null })
      // simple auto-reconnect after 2s
      setTimeout(() => {
        if (!get().ws) get().connect()
      }, 2000)
    }
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'TABLE_STATE') set({ state: msg })
      if (msg.type === 'HAND_RESULT') set({ lastResult: msg })
      if (msg.type === 'ERROR') set({ wsError: msg.message })
    }
    set({ ws })
  },
  send(data) {
    const ws = get().ws
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data))
  },
  createTable(opts) { get().send({ type: 'CREATE_TABLE', ...opts }) },
  join(name) { get().send({ type: 'JOIN_AS_USER', name }) },
  startHand() { get().send({ type: 'START_HAND' }) },
  userAction(action, amount) { get().send({ type: 'USER_ACTION', action, amount }) },
}))


