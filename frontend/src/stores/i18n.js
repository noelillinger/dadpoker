import { create } from 'zustand'

const strings = {
  en: {
    appTitle: 'DadPoker',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    switchLanguage: 'Switch Language',
    players: 'Players',
    difficulty: 'Difficulty',
    smallBlind: 'SB',
    bigBlind: 'BB',
    create: 'Create',
    startHand: 'Start Hand',
    pot: 'Pot',
    board: 'Board',
    betAmount: 'Bet Amount',
    fold: 'Fold',
    check: 'Check',
    call: 'Call',
    bet: 'Bet',
    raise: 'Raise',
    recentHands: 'Recent Hands',
    refresh: 'Refresh',
    user: 'User',
    admin: 'Admin',
    logout: 'Logout',
  },
  de: {
    appTitle: 'DadPoker',
    username: 'Benutzername',
    password: 'Passwort',
    login: 'Anmelden',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort verbergen',
    switchLanguage: 'Sprache ändern',
    players: 'Spieler',
    difficulty: 'Schwierigkeit',
    smallBlind: 'SB',
    bigBlind: 'BB',
    create: 'Erstellen',
    startHand: 'Hand starten',
    pot: 'Pot',
    board: 'Board',
    betAmount: 'Einsatz',
    fold: 'Passen',
    check: 'Schieben',
    call: 'Mitgehen',
    bet: 'Setzen',
    raise: 'Erhöhen',
    recentHands: 'Letzte Hände',
    refresh: 'Aktualisieren',
    user: 'Benutzer',
    admin: 'Admin',
    logout: 'Abmelden',
  },
}

const initialLang = (() => {
  try { return localStorage.getItem('lang') || 'en' } catch(_) { return 'en' }
})()

export const useI18n = create((set, get) => ({
  lang: initialLang,
  setLang: (lang) => {
    try { localStorage.setItem('lang', lang) } catch(_) {}
    set({ lang })
  },
  getCurrentLang: () => get().lang,
}))

// Custom hook to ensure reactivity
export const useTranslation = () => {
  const lang = useI18n(state => state.lang)
  const translate = (key) => strings[lang][key] || key
  return { t: translate, lang }
}


