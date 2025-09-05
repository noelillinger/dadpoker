import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [oldp, setOldp] = useState('')
  const [newp, setNewp] = useState('')
  const [err, setErr] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const { data } = await api.patch('/me/password', { old_password: oldp, new_password: newp })
      // server rotates tokens; pull fresh access for header fallback
      try { if (data?.access) sessionStorage.setItem('accessToken', data.access) } catch(_) {}
      navigate('/')
    } catch (e) {
      setErr('Password change failed')
    }
  }

  return (
    <div className="centered">
      <form className="card" onSubmit={submit}>
        <h2>Change password</h2>
        {err && <div className="error">{err}</div>}
        <label>Old password</label>
        <div className="password-field">
          <input type={showOld ? 'text' : 'password'} value={oldp} onChange={e => setOldp(e.target.value)} />
          <button
            type="button"
            className="password-toggle"
            aria-label={showOld ? 'Hide password' : 'Show password'}
            onClick={() => setShowOld(v => !v)}
          >
            {showOld ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 1l22 22"></path>
                <path d="M4.5 4.5C2.6 6.2 1 8.8 1 12c0 0 4 7 11 7 2.17 0 4.2-.66 5.94-1.72"></path>
                <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 3-3c0-.59-.17-1.14-.47-1.6"></path>
                <path d="M20.82 16.86C22.07 15.79 23 14.33 23 12c0-3-4.48-7-11-7-1.61 0-3.14.36-4.5 1"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
        <label>New password</label>
        <div className="password-field">
          <input type={showNew ? 'text' : 'password'} value={newp} onChange={e => setNewp(e.target.value)} />
          <button
            type="button"
            className="password-toggle"
            aria-label={showNew ? 'Hide password' : 'Show password'}
            onClick={() => setShowNew(v => !v)}
          >
            {showNew ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 1l22 22"></path>
                <path d="M4.5 4.5C2.6 6.2 1 8.8 1 12c0 0 4 7 11 7 2.17 0 4.2-.66 5.94-1.72"></path>
                <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 3-3c0-.59-.17-1.14-.47-1.6"></path>
                <path d="M20.82 16.86C22.07 15.79 23 14.33 23 12c0-3-4.48-7-11-7-1.61 0-3.14.36-4.5 1"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  )
}


