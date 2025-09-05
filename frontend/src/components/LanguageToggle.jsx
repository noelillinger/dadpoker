import { useTranslation, useI18n } from '../stores/i18n.js'
import { useState, useEffect } from 'react'

export default function LanguageToggle() {
  const { t, lang } = useTranslation()
  const setLang = useI18n(s => s.setLang)
  const [isGerman, setIsGerman] = useState(lang === 'de')

  useEffect(() => {
    setIsGerman(lang === 'de')
  }, [lang])

  const toggleLanguage = () => {
    const nextLang = isGerman ? 'en' : 'de'
    setIsGerman(!isGerman)
    setLang(nextLang)
  }

  return (
    <div className="language-toggle-container">
      <div className="language-toggle-text-container">
        <span className="language-toggle-text">{t('switchLanguage')}</span>
      </div>
      <div className="language-toggle-button-container">
        <button
          id="language-toggle"
          className={`language-toggle ${isGerman ? 'active' : ''}`}
          onClick={toggleLanguage}
          aria-label={t('switchLanguage')}
          type="button"
        >
          <span className="language-toggle-slider">
            {isGerman ? 'DE' : 'EN'}
          </span>
        </button>
      </div>
    </div>
  )
}


