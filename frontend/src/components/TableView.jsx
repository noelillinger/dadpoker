import { useEffect, useMemo, useState } from 'react'
import { useTableStore } from '../stores/table.js'
import { useAuthStore } from '../stores/auth.js'
import '../styles/table.css'
import { useTranslation } from '../stores/i18n.js'

function formatChips(cents) {
  const n = Math.max(0, Math.floor((cents || 0) / 100))
  return n.toLocaleString()
}

function parseCard(code) {
  if (!code || typeof code !== 'string') return null
  const rank = code.slice(0, -1)
  const suit = code.slice(-1)
  const suitMap = { c: '♣', d: '♦', h: '♥', s: '♠' }
  const color = suit === 'd' || suit === 'h' ? 'red' : 'black'
  return { rank: rank.toUpperCase(), suit: suitMap[suit] || '', color }
}

function Card({ code, size = 'md' }) {
  const c = parseCard(code)
  if (!c) return <div className={`card-face ${size} back`} />
  return (
    <div className={`card-face ${size}`} aria-label={`${c.rank} ${c.suit}`} role="img">
      <div className={`rank ${c.color}`}>{c.rank}</div>
      <div className={`suit ${c.color}`}>{c.suit}</div>
    </div>
  )
}

export default function TableView() {
  const { state, connect, createTable, startHand, userAction, connected, wsError, lastResult } = useTableStore()
  const me = useAuthStore(s => s.me)
  const { t } = useTranslation()

  const [players, setPlayers] = useState(4)
  const [difficulty, setDifficulty] = useState('easy')
  const [sb, setSb] = useState(50)
  const [bb, setBb] = useState(100)
  const [wager, setWager] = useState(50)

  useEffect(() => { connect() }, [])

  const onCreate = () => createTable({ players, difficulty, small_blind: sb, big_blind: bb })

  const youId = state?.you?.id
  const toActId = state?.toAct
  const isYourTurn = youId && toActId && youId === toActId
  const legal = state?.youLegal || { canAct: false }
  const minBet = legal?.minBet ?? 0
  const maxBet = legal?.maxBet ?? 0

  // place seats in a circle based on index
  const seats = useMemo(() => {
    const list = state?.players || []
    const n = list.length || 1
    return list.map((p, idx) => {
      const angle = (idx / n) * 2 * Math.PI
      const x = 40 * Math.cos(angle)
      const y = 40 * Math.sin(angle)
      return { p, idx, x, y }
    })
  }, [state?.players])

  const youHole = state?.you?.hole || []

  return (
    <div className="poker-layout">
      <div className="table-controls">
        <div>
          <label>{t('players')}</label>
          <input aria-label={t('players')} type="number" min="2" max="6" value={players} onChange={e => setPlayers(parseInt(e.target.value||'4'))} />
        </div>
        <div>
          <label>{t('difficulty')}</label>
          <select aria-label={t('difficulty')} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label>{t('smallBlind')}</label>
          <input aria-label={t('smallBlind')} type="number" min="10" value={sb} onChange={e => setSb(parseInt(e.target.value||'50'))} />
        </div>
        <div>
          <label>{t('bigBlind')}</label>
          <input aria-label={t('bigBlind')} type="number" min="20" value={bb} onChange={e => setBb(parseInt(e.target.value||'100'))} />
        </div>
        <button className="btn" disabled={!connected} onClick={onCreate}>{t('create')}</button>
        <button className="btn" disabled={!connected} onClick={startHand}>{t('startHand')}</button>
      </div>

      <div className="poker-table" role="region" aria-label="Poker table">
        <div className="center-info">
          <div className="pot" aria-live="polite">{t('pot')}: {formatChips(state?.pot)}</div>
          <div className="street">{state?.street}</div>
          <div className="board-cards">
            {(state?.board || []).map((c, i) => (
              <Card key={i} code={c} size="lg" />
            ))}
          </div>
        </div>

        {seats.map(({ p, idx, x, y }) => {
          const isDealer = idx === state?.dealerIndex
          const isToAct = p.id === toActId
          const isYou = p.id === youId
          return (
            <div key={p.id} className={`seat ${isToAct ? 'to-act' : ''} ${p.folded ? 'folded' : ''}`} style={{
              transform: `translate(calc(${50 + x}% - 50%), calc(${50 + y}% - 50%))`
            }}>
              <div className="seat-name">{p.name}{isYou ? ' (You)' : ''}</div>
              <div className="seat-meta">
                <span>{t('stack')}: {formatChips(p.stack)}</span>
                {p.bet > 0 && <span>{t('bet')}: {formatChips(p.bet)}</span>}
              </div>
              {isDealer && <div className="dealer-btn" aria-label="Dealer">D</div>}
              <div className="seat-cards">
                {isYou && youHole.map((c,i) => <Card key={i} code={c} />)}
                {!isYou && (state?.street === 'showdown') && [<div key="back1" className="card-face back" />, <div key="back2" className="card-face back" />]}
              </div>
            </div>
          )
        })}
      </div>

      <div className="action-bar" aria-live="polite">
        <div className="wager-input">
          <label>{t('betAmount')}</label>
          <input
            type="number"
            min={minBet}
            max={maxBet}
            value={wager}
            onChange={e => setWager(parseInt(e.target.value||'0'))}
          />
        </div>
        <div className="actions">
          {legal?.canFold && (
            <button className="action-btn danger" disabled={!connected || !isYourTurn} onClick={() => userAction('fold')}>{t('fold')}</button>
          )}
          {legal?.canCheck && (
            <button className="action-btn" disabled={!connected || !isYourTurn} onClick={() => userAction('check')}>{t('check')}</button>
          )}
          {legal?.canCall && (
            <button className="action-btn" disabled={!connected || !isYourTurn} onClick={() => userAction('call')}>{t('call')}</button>
          )}
          {maxBet > 0 && (
            <button className="action-btn primary" disabled={!connected || !isYourTurn || wager <= 0} onClick={() => userAction('bet', wager)}>{t('bet')}</button>
          )}
          {maxBet > 0 && (
            <button className="action-btn primary" disabled={!connected || !isYourTurn || wager <= 0} onClick={() => userAction('raise', wager)}>{t('raise')}</button>
          )}
        </div>
      </div>

      <div className="ws-status">
        WS: {connected ? 'Connected' : 'Disconnected'} {wsError ? `(error: ${wsError})` : ''}
        {!connected && <button className="btn" style={{ marginLeft: 8 }} onClick={() => connect()}>Reconnect</button>}
      </div>
    </div>
  )
}

