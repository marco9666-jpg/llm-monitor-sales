import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, User, MessageSquare, Download, Heart } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const API_URL = '/api'

interface UserData {
  id: number
  name: string
  email: string
}

export default function Dashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [token, navigate])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-neutral-600">{t('dashboard.loading')}</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Topbar */}
      <nav className="border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 font-semibold text-lg tracking-tight">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-[3px]">
              <img src="/app-icon.png" alt="TokenMeter" className="h-6 w-6 rounded-xl" />
            </div>
            <span>TokenMeter</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t('dashboard.logout')}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white tracking-tight">{t('dashboard.title')}</h1>
          <p className="mt-2 text-sm font-light text-neutral-500">{t('dashboard.subtitle')}</p>
        </div>

        {/* Welcome Card */}
        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
              <Heart className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">{t('dashboard.welcome')}</h2>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {t('dashboard.welcomeDesc')}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/guestbook"
            className="group rounded-3xl border border-white/10 bg-neutral-900/50 p-6 hover:border-blue-500/30 transition-all duration-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 mb-4 group-hover:bg-blue-500/20 transition-colors">
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-base font-medium text-white mb-1">{t('dashboard.feedback')}</h3>
            <p className="text-sm text-neutral-500">{t('dashboard.feedbackDesc')}</p>
          </Link>

        </div>
      </main>
    </div>
  )
}
