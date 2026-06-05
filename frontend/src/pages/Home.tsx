import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Zap, Lock, Server, BarChart3, Eye, Download, MessageSquare, Bell, Check, LogOut, User } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../hooks/useAuth'
import LanguageSwitcher from '../components/LanguageSwitcher'

const DOWNLOAD_URL = 'https://github.com/marco9666-jpg/TokenMeter/releases/download/v1.0/TokenMeter_1.0.dmg'

function trackDownload() {
  fetch('/api/downloads', { method: 'POST' }).catch(() => {})
}

export default function Home() {
  const { t } = useI18n()
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const [subEmail, setSubEmail] = useState('')
  const [subName, setSubName] = useState('')
  const [subLoading, setSubLoading] = useState(false)
  const [subSuccess, setSubSuccess] = useState(false)
  const [subError, setSubError] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubError('')
    setSubSuccess(false)
    setSubLoading(true)

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail, name: subName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('subscribe.error'))

      setSubSuccess(true)
      setSubEmail('')
      setSubName('')
    } catch (err: any) {
      setSubError(err.message)
    } finally {
      setSubLoading(false)
    }
  }

  const features = [
    { icon: Eye, titleKey: 'features.autoMonitor', descKey: 'features.autoMonitorDesc' },
    { icon: BarChart3, titleKey: 'features.realtimeCost', descKey: 'features.realtimeCostDesc' },
    { icon: Lock, titleKey: 'features.local', descKey: 'features.localDesc' },
    { icon: Server, titleKey: 'features.multiVendor', descKey: 'features.multiVendorDesc' },
    { icon: Zap, titleKey: 'features.lightweight', descKey: 'features.lightweightDesc' },
    { icon: Shield, titleKey: 'features.alert', descKey: 'features.alertDesc' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex flex-shrink-0 items-center gap-3 font-semibold text-lg tracking-tight">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-[3px]">
              <img src="/app-icon.png" alt="TokenMeter" className="h-7 w-7 rounded-xl" />
            </div>
            <span className="text-neutral-100">TokenMeter</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <Link to="/guestbook" className="hidden sm:block text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-300">
              {t('nav.feedback')}
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
            <a
              href={DOWNLOAD_URL} onClick={trackDownload}
              className="rounded-full bg-white px-4 py-2 sm:px-5 text-sm font-medium text-neutral-950 hover:bg-neutral-200 transition-colors duration-300 whitespace-nowrap"
            >
              {t('nav.getStarted')}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium tracking-widest text-blue-400">
            {t('hero.badge')}
          </p>
          <h1 className="mb-6 text-5xl font-semibold tracking-tight text-white sm:text-7xl leading-[1.1]">
            {t('hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              {t('hero.title2')}
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg font-light text-neutral-400 leading-relaxed">
            {t('hero.desc')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={DOWNLOAD_URL} onClick={trackDownload}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-8 py-3.5 text-base font-medium text-white hover:bg-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              <Download className="h-5 w-5" />
              {t('hero.cta1')}
            </a>
            <Link
              to="/guestbook"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-white hover:bg-white/5 transition-all duration-300"
            >
              <MessageSquare className="h-5 w-5" />
              {t('hero.cta2')}
            </Link>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="showcase" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl tracking-tight">
              {t('showcase.title')}
            </h2>
            <p className="mt-3 text-lg font-light text-neutral-500">
              {t('showcase.subtitle')}
            </p>
          </div>

          <div className="relative mb-12 flex justify-center">
            <div className="relative w-full max-w-4xl">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-blue-500/10 to-transparent blur-2xl" />
              <img
                src="/screenshots/overview.png"
                alt="TokenMeter"
                className="relative w-full rounded-2xl border border-white/5 shadow-2xl shadow-black/60"
              />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="group relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50">
                <img src="/screenshots/settings.png" alt="Settings" className="w-full" />
              </div>
              <h3 className="mt-5 text-center text-lg font-medium text-white">{t('showcase.settings')}</h3>
              <p className="mt-1 text-center text-sm text-neutral-500">{t('showcase.settingsDesc')}</p>
            </div>
            <div className="group relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50">
                <img src="/screenshots/floating.png" alt="Monitor" className="w-full" />
              </div>
              <h3 className="mt-5 text-center text-lg font-medium text-white">{t('showcase.floating')}</h3>
              <p className="mt-1 text-center text-sm text-neutral-500">{t('showcase.floatingDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl tracking-tight">
              {t('features.title')}
            </h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.titleKey} className="group">
                <div className="mb-5 inline-flex rounded-2xl bg-neutral-900 p-4 ring-1 ring-white/10 group-hover:ring-blue-500/30 transition-all duration-500">
                  <f.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">{t(f.titleKey)}</h3>
                <p className="text-sm font-light text-neutral-500 leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
            <Bell className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">{t('subscribe.title')}</h2>
          <p className="mt-2 text-sm text-neutral-500 mb-6">{t('subscribe.subtitle')}</p>

          {subSuccess ? (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400 flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              {t('subscribe.success')}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                placeholder={t('subscribe.namePlaceholder')}
              />
              <input
                type="email"
                required
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                className="flex-[2] rounded-xl border border-white/10 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                placeholder={t('subscribe.emailPlaceholder')}
              />
              <button
                type="submit"
                disabled={subLoading}
                className="rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                {subLoading ? t('subscribe.loading') : t('subscribe.button')}
              </button>
            </form>
          )}
          {subError && (
            <p className="mt-3 text-xs text-red-400">{subError}</p>
          )}
          <p className="mt-4 text-xs text-neutral-600">{t('subscribe.privacy')}</p>
        </div>
      </section>

      {/* CTA - Feedback */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg font-light text-neutral-500">
            {t('cta.subtitle')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={DOWNLOAD_URL} onClick={trackDownload}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-10 py-4 text-base font-medium text-white hover:bg-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              <Download className="h-5 w-5" />
              {t('cta.button')}
            </a>
            <Link
              to="/guestbook"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-10 py-4 text-base font-medium text-white hover:bg-white/5 transition-all duration-300"
            >
              <MessageSquare className="h-5 w-5" />
              {t('cta.feedbackButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-neutral-950 px-6 py-8">
        <div className="mx-auto max-w-5xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-neutral-600">
            {t('footer.copy')}
          </p>
          <div className="flex gap-6 text-xs text-neutral-600">
            <Link to="/guestbook" className="hover:text-neutral-400 transition-colors">{t('nav.feedback')}</Link>
            {isLoggedIn ? (
              <button onClick={() => { logout(); navigate('/') }} className="hover:text-neutral-400 transition-colors">
                {t('dashboard.logout')}
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-neutral-400 transition-colors">{t('footer.login')}</Link>
                <Link to="/register" className="hover:text-neutral-400 transition-colors">{t('footer.register')}</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
