import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../utils/toastStore.js'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const fetchMe = useAuthStore(s => s.fetchMe)
  const me = useAuthStore(s => s.me)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (me) navigate('/')
  }, [me, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login({ username, password })
      await fetchMe()
      // if must_change_password, route to change-password
      const meNow = useAuthStore.getState().me
      if (meNow?.must_change_password) {
        toast.push('Please set a new password', 'info')
        navigate('/change-password')
      } else {
        toast.push('Logged in', 'success')
        navigate('/')
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Invalid credentials'
      setError(msg)
      toast.push(msg, 'error')
    }
  }

  return (
    <div className="centered">
      <form className="card" onSubmit={onSubmit}>
        <h1>DadPoker</h1>
        {error && <div className="error">{error}</div>}
        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}


