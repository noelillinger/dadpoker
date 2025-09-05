import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth.js'
import TableView from '../components/TableView.jsx'
import HistoryPanel from '../components/HistoryPanel.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useTranslation } from '../stores/i18n.js'

export default function Home() {
  const me = useAuthStore(s => s.me)
  const fetchMe = useAuthStore(s => s.fetchMe)
  const logout = useAuthStore(s => s.logout)
  const { t } = useTranslation()

  useEffect(() => {
    if (!me) fetchMe()
  }, [me, fetchMe])

  return (
    <div className="container">
      <header className="header">
        <a href="/dadpoker/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, fontSize: 20 }}>{t('appTitle')}</a>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>{t('user')}: {me?.username}</div>
          <button style={{ width: 'auto', marginTop: 0, padding: '8px 12px' }} onClick={logout}>{t('logout')}</button>
          {me?.role === 'admin' && (
            <a href="/dadpoker/admin" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>{t('admin')}</a>
          )}
          <LanguageToggle />
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


