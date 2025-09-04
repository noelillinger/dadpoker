import { useEffect, useState } from 'react'
import { useTableStore } from '../stores/table.js'
import { useAuthStore } from '../stores/auth.js'
import '../styles/table.css'
import { useI18n } from '../stores/i18n.js'

export default function TableView() {
  const { state, connect, createTable, startHand, userAction, connected, wsError } = useTableStore()
  const me = useAuthStore(s => s.me)
  const t = useI18n(s => s.t)
  const [players, setPlayers] = useState(4)
  const [difficulty, setDifficulty] = useState('easy')
  const [sb, setSb] = useState(50)
  const [bb, setBb] = useState(100)
  const [bet, setBet] = useState(50)

  useEffect(() => { connect() }, [])

  const onCreate = () => createTable({ players, difficulty, small_blind: sb, big_blind: bb })

  return (
    <div className="card">
      <div className="table-controls">
        <div>
          <label>{t('players')}</label>
          <input type="number" min="2" max="6" value={players} onChange={e => setPlayers(parseInt(e.target.value||'4'))} />
        </div>
        <div>
          <label>{t('difficulty')}</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label>{t('smallBlind')}</label>
          <input type="number" min="10" value={sb} onChange={e => setSb(parseInt(e.target.value||'50'))} />
        </div>
        <div>
          <label>{t('bigBlind')}</label>
          <input type="number" min="20" value={bb} onChange={e => setBb(parseInt(e.target.value||'100'))} />
        </div>
        <button disabled={!connected} onClick={onCreate}>{t('create')}</button>
        <button disabled={!connected} onClick={startHand}>{t('startHand')}</button>
      </div>

      <div className="table-board">
        <div>{t('pot')}: {(state?.pot ?? 0) / 100}</div>
        <div>{t('board')}: {state?.board?.join(' ')}</div>
      </div>

      <div className="table-players">
        {state?.players?.map(p => (
          <div key={p.id} className="card">
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div>Stack: {p.stack / 100}</div>
            <div>Bet: {p.bet / 100}</div>
            <div>{p.folded ? 'Folded' : 'Active'}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <label>{t('betAmount')}</label>
        <input type="number" value={bet} onChange={e => setBet(parseInt(e.target.value||'50'))} />
        <div className="table-actions">
          <button disabled={!connected} onClick={() => userAction('fold')}>{t('fold')}</button>
          <button disabled={!connected} onClick={() => userAction('check')}>{t('check')}</button>
          <button disabled={!connected} onClick={() => userAction('call')}>{t('call')}</button>
          <button disabled={!connected} onClick={() => userAction('bet', bet)}>{t('bet')}</button>
          <button disabled={!connected} onClick={() => userAction('raise', bet)}>{t('raise')}</button>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
        WS: {connected ? 'Connected' : 'Disconnected'} {wsError ? `(error: ${wsError})` : ''}
        {!connected && <button style={{ marginLeft: 8 }} onClick={() => connect()}>Reconnect</button>}
      </div>
    </div>
  )
}


