import { useEffect, useState } from 'react'
import api from '../utils/api.js'
import { useTranslation } from '../stores/i18n.js'

export default function HistoryPanel() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/history?limit=20')
      setItems(data.items || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{t('recentHands')}</h3>
        <button onClick={load} style={{ width: 120 }}>{t('refresh')}</button>
      </div>
      {loading && <div>Loading...</div>}
      <div style={{ marginTop: 8 }}>
        {items.map(it => (
          <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '8px 0', borderBottom: '1px solid #222' }}>
            <div>{new Date(it.ts).toLocaleString()}</div>
            <div>{it.difficulty}</div>
            <div style={{ color: it.delta >= 0 ? '#32d74b' : '#ff453a' }}>{(it.delta/100).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


