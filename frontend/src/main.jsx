import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './routes/App.jsx'
import './styles/vars.css'
import './styles/app.css'
import { useToast } from './utils/toastStore.js'

function Bootstrap() {
  const toasts = useToast(s => s.items)
  useEffect(() => {
    try {
      const p = sessionStorage.getItem('redirectPath')
      if (p) {
        sessionStorage.removeItem('redirectPath')
        const target = p.startsWith('/') ? p : '/' + p
        if (target !== '/' && target !== '/index.html') {
          window.history.replaceState({}, '', '/dadpoker' + target)
        }
      }
    } catch (e) {}
  }, [])
  return (
    <BrowserRouter basename="/dadpoker">
      <App />
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind}`}>{t.message}</div>
        ))}
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
)


