import { useEffect, useState } from 'react'
import { useTableStore } from '../stores/table.js'
import { useAuthStore } from '../stores/auth.js'
import '../styles/table.css'

export default function TableView() {
  const { state, connect, createTable, startHand, userAction } = useTableStore()
  const me = useAuthStore(s => s.me)
  const [players, setPlayers] = useState(4)
  const [difficulty, setDifficulty] = useState('easy')
  const [sb, setSb] = useState(50)
  const [bb, setBb] = useState(100)
  const [bet, setBet] = useState(50)

  useEffect(() => { connect() }, [connect])

  const onCreate = () => createTable({ players, difficulty, small_blind: sb, big_blind: bb })

  return (
    <div className="card">
      <div className="table-controls">
        <div>
          <label>Players</label>
          <input type="number" min="2" max="6" value={players} onChange={e => setPlayers(parseInt(e.target.value||'4'))} />
        </div>
        <div>
          <label>Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label>SB</label>
          <input type="number" min="10" value={sb} onChange={e => setSb(parseInt(e.target.value||'50'))} />
        </div>
        <div>
          <label>BB</label>
          <input type="number" min="20" value={bb} onChange={e => setBb(parseInt(e.target.value||'100'))} />
        </div>
        <button onClick={onCreate}>Create</button>
        <button onClick={startHand}>Start Hand</button>
      </div>

      <div className="table-board">
        <div>Pot: {(state?.pot ?? 0) / 100}</div>
        <div>Board: {state?.board?.join(' ')}</div>
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
        <label>Bet Amount</label>
        <input type="number" value={bet} onChange={e => setBet(parseInt(e.target.value||'50'))} />
        <div className="table-actions">
          <button onClick={() => userAction('fold')}>Fold</button>
          <button onClick={() => userAction('check')}>Check</button>
          <button onClick={() => userAction('call')}>Call</button>
          <button onClick={() => userAction('bet', bet)}>Bet</button>
          <button onClick={() => userAction('raise', bet)}>Raise</button>
        </div>
      </div>
    </div>
  )
}


