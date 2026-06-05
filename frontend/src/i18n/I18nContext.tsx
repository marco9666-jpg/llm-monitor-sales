import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type Locale = 'zh' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'zh', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
]

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'tokemeter_locale'

const LOCALE_MAP: Record<string, Locale> = {
  'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh', 'zh-HK': 'zh',
  'en': 'en', 'en-US': 'en', 'en-GB': 'en',
  'ja': 'ja', 'jp': 'ja',
  'ko': 'ko', 'kr': 'ko',
  'fr': 'fr',
  'de': 'de',
  'es': 'es',
}

function getBrowserLocale(): Locale {
  const browserLang = navigator.language
  const langCode = browserLang.slice(0, 2)
  // Try full match first, then 2-letter code
  const mapped = LOCALE_MAP[browserLang] || LOCALE_MAP[langCode]
  if (mapped && LOCALES.find((l) => l.code === mapped)) {
    return mapped
  }
  // Fallback to English
  return 'en'
}

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale
    if (stored && LOCALES.find((l) => l.code === stored)) {
      return stored
    }
  } catch {}
  return getBrowserLocale()
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
  const [translations, setTranslations] = useState<Record<string, Record<Locale, string>>>({})

  useEffect(() => {
    import('./translations').then((mod) => {
      setTranslations(mod.default)
    })
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {}
  }, [])

  const t = useCallback(
    (key: string) => {
      if (!translations[key]) return key
      return translations[key][locale] || translations[key]['en'] || key
    },
    [locale, translations]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
