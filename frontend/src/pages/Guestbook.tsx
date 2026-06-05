import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Send, MessageCircle, User, Clock, ArrowLeft, Heart, LogOut } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../hooks/useAuth'
import LanguageSwitcher from '../components/LanguageSwitcher'

const API_URL = '/api'

interface GuestbookEntry {
  id: number
  name: string
  email: string
  message: string
  created_at: string
}

export default function Guestbook() {
  const { t } = useI18n()
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${API_URL}/guestbook`)
      const data = await res.json()
      setEntries(data.entries || [])
    } catch {
      setEntries([])
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('guestbook.error'))

      setSuccess(t('guestbook.success'))
      setName('')
      setEmail('')
      setMessage('')
      fetchEntries()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 font-semibold text-lg tracking-tight">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-[3px]">
              <img src="/app-icon.png" alt="TokenMeter" className="h-7 w-7 rounded-xl" />
            </div>
            <span className="text-neutral-100">TokenMeter</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              {t('guestbook.back')}
            </Link>
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                </div>
                <button
                  onClick={() => { logout(); navigate('/') }}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-all duration-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t('dashboard.logout')}
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-300">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
            <MessageCircle className="h-6 w-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">{t('guestbook.title')}</h1>
          <p className="mt-3 text-lg font-light text-neutral-500 max-w-xl mx-auto">{t('guestbook.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-8 mb-12">
          {success && (
            <div className="mb-5 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-400">{t('guestbook.name')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                  placeholder={t('guestbook.namePlaceholder')}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-400">{t('guestbook.email')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">{t('guestbook.message')}</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                placeholder={t('guestbook.messagePlaceholder')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              <Send className="h-4 w-4" />
              {loading ? t('guestbook.sending') : t('guestbook.send')}
            </button>
          </form>
        </div>

        {/* Entries */}
        <div>
          <h2 className="mb-6 text-xl font-semibold text-white tracking-tight">{t('guestbook.entries')}</h2>
          {fetching ? (
            <div className="text-center text-neutral-600 py-12">{t('guestbook.loading')}</div>
          ) : entries.length === 0 ? (
            <div className="rounded-3xl border border-white/5 bg-neutral-900/30 p-12 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-neutral-700 mb-4" />
              <p className="text-sm text-neutral-500">{t('guestbook.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-white/5 bg-neutral-900/50 p-6 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                        <User className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{entry.name}</p>
                        <p className="text-xs text-neutral-600">{entry.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-600 shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatDate(entry.created_at)}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-neutral-300 leading-relaxed pl-12">
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-neutral-950 px-6 py-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs text-neutral-600">{t('footer.copy')}</p>
        </div>
      </footer>
    </div>
  )
}
