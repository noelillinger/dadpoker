import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../utils/toastStore.js'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useI18n } from '../stores/i18n.js'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const fetchMe = useAuthStore(s => s.fetchMe)
  const me = useAuthStore(s => s.me)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const t = useI18n(s => s.t)

  useEffect(() => {
    if (me) navigate('/')
  }, [me, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
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
    } finally { setLoading(false) }
  }

  return (
    <div className="centered">
      <form className="card" onSubmit={onSubmit}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>{t('appTitle')}</h1>
        {error && <div className="error">{error}</div>}
        <label>{t('username')}</label>
        <input value={username} onChange={e => setUsername(e.target.value)} />
        <label>{t('password')}</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? <span className="spinner" /> : t('login')}</button>
      </form>
      <div style={{ marginTop: 16 }}><LanguageToggle /></div>
    </div>
  )
}


