import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/auth.js'
import api from '../utils/api.js'

export default function Admin() {
  const me = useAuthStore(s => s.me)
  const [users, setUsers] = useState([])
  const [username, setUsername] = useState('')
  const [temp, setTemp] = useState('')
  const [role, setRole] = useState('user')

  const load = async () => {
    const { data } = await api.get('/admin/users')
    setUsers(data.users || [])
  }

  const createUser = async () => {
    await api.post('/admin/users', { username, temp_password: temp, role })
    setUsername('')
    setTemp('')
    setRole('user')
    await load()
    alert('User created. Copy the temp password now.')
  }

  const reset = async (id) => {
    const temp = prompt('Enter temporary password:')
    if (!temp) return
    await api.patch(`/admin/users/${id}`, { temp_password: temp })
    await load()
  }

  const toggleActive = async (id, is_active) => {
    await api.patch(`/admin/users/${id}`, { is_active: !is_active })
    await load()
  }

  useEffect(() => { if (me?.role === 'admin') load() }, [me])

  if (me?.role !== 'admin') return null
  return (
    <div className="container">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Create User</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="temp password" value={temp} onChange={e => setTemp(e.target.value)} />
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button onClick={createUser} style={{ width: 160 }}>Create</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Users</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: 8 }}>
          <div>Username</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
          {users.map(u => (
            <>
              <div key={`u-${u.id}`}>{u.username}</div>
              <div>{u.role}</div>
              <div>{u.is_active ? 'active' : 'disabled'}</div>
              <div>
                <button onClick={() => toggleActive(u.id, u.is_active)} style={{ width: 120 }}>{u.is_active ? 'Disable' : 'Enable'}</button>
                <button onClick={() => reset(u.id)} style={{ width: 160, marginLeft: 8 }}>Reset Password</button>
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  )
}


