import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [oldp, setOldp] = useState('')
  const [newp, setNewp] = useState('')
  const [err, setErr] = useState('')

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
        <input type="password" value={oldp} onChange={e => setOldp(e.target.value)} />
        <label>New password</label>
        <input type="password" value={newp} onChange={e => setNewp(e.target.value)} />
        <button type="submit">Update</button>
      </form>
    </div>
  )
}


