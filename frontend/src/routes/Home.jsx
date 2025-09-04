import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth.js'
import TableView from '../components/TableView.jsx'
import HistoryPanel from '../components/HistoryPanel.jsx'

export default function Home() {
  const me = useAuthStore(s => s.me)
  const fetchMe = useAuthStore(s => s.fetchMe)

  useEffect(() => {
    if (!me) fetchMe()
  }, [me, fetchMe])

  return (
    <div className="container">
      <header className="header">
        <div>Balance: ${(me?.balance ?? 0) / 100}</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>User: {me?.username}</div>
          {me?.role === 'admin' && (
            <a href="/dadpoker/admin" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Admin</a>
          )}
        </div>
      </header>
      <main>
        <TableView />
        <div style={{ marginTop: 16 }}>
          <HistoryPanel />
        </div>
      </main>
    </div>
  )
}


