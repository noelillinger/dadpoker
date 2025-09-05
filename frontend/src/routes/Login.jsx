import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../utils/toastStore.js'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useTranslation } from '../stores/i18n.js'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const fetchMe = useAuthStore(s => s.fetchMe)
  const me = useAuthStore(s => s.me)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { t } = useTranslation()

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
    <div className="login-container">
      <div className="login-form-container">
        <form className="card" onSubmit={onSubmit}>
          <h1 style={{ marginTop: 0, marginBottom: 8 }}>{t('appTitle')}</h1>
          {error && <div className="error">{error}</div>}
          <label>{t('username')}</label>
          <input value={username} onChange={e => setUsername(e.target.value)} />
          <label>{t('password')}</label>
          <div className="password-field">
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
            <button
              type="button"
              className="password-toggle"
              aria-label={t(showPassword ? 'hidePassword' : 'showPassword')}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? (
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
          <button type="submit" disabled={loading}>{loading ? <span className="spinner" /> : t('login')}</button>
        </form>
      </div>
      <div className="login-toggle-container">
        <LanguageToggle />
      </div>
    </div>
  )
}


