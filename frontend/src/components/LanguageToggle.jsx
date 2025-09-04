import { useI18n } from '../stores/i18n.js'
import { useState, useEffect } from 'react'

export default function LanguageToggle() {
  const lang = useI18n(s => s.lang)
  const setLang = useI18n(s => s.setLang)
  const [on, setOn] = useState(lang === 'de')
  useEffect(() => { setOn(lang === 'de') }, [lang])

  const toggle = () => {
    const next = on ? 'en' : 'de'
    setOn(!on)
    setTimeout(() => setLang(next), 50)
  }

  return (
    <button onClick={toggle} style={{
      width: 64, height: 34, borderRadius: 20, background: 'linear-gradient(180deg,#2a2a2f,#1a1a1e)', position: 'relative',
      display: 'inline-flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start', padding: '0 6px',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,.6)', transition: 'all .25s cubic-bezier(0.22, 1, 0.36, 1)'
    }} aria-label="Language">
      <span style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff', color: '#000', fontSize: 10,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
        boxShadow: '0 4px 12px rgba(0,0,0,.35)', transform: 'translateY(0)', transition: 'transform .25s cubic-bezier(0.22, 1, 0.36, 1)'
      }}>{on ? 'DE' : 'EN'}</span>
    </button>
  )
}


