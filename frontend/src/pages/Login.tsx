import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const API_URL = '/api'

export default function Login() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('login.error'))

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-[3px]">
              <img src="/app-icon.png" alt="TokenMeter" className="h-10 w-10 rounded-xl" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{t('login.title')}</h1>
          <p className="mt-2 text-sm font-light text-neutral-500">{t('login.subtitle')}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-900/50 p-8 backdrop-blur-sm">
          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">{t('login.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                placeholder={t('login.emailPlaceholder')}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">{t('login.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 pr-11 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                  placeholder={t('login.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white py-3 text-sm font-medium text-neutral-950 hover:bg-neutral-200 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? t('login.submitLoading') : t('login.submit')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
            {t('login.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  )
}
