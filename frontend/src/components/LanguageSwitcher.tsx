import { useState, useRef, useEffect } from 'react'
import { useI18n, LOCALES } from '../i18n/I18nContext'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[1] // default to English

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-neutral-400 hover:bg-white/5 hover:text-white transition-all duration-300"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline text-neutral-300">{current.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-xl">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code)
                setOpen(false)
              }}
              className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                l.code === locale
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
