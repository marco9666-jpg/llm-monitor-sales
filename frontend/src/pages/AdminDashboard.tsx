import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import {
  Users,
  MessageSquare,
  Mail,
  Bell,
  LogOut,
  Send,
  Trash2,
  ArrowLeft,
  BarChart3,
  Shield,
  Clock,
  Check,
} from 'lucide-react'

const API_URL = '/api'

interface Stats {
  users: number
  entries: number
  subscribers: number
  notifications: number
}

interface UserItem {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

interface GuestbookItem {
  id: number
  name: string
  email: string
  message: string
  created_at: string
}

interface SubscriberItem {
  id: number
  email: string
  name: string | null
  active: number
  created_at: string
}

interface NotificationItem {
  id: number
  title: string
  body: string
  sent_count: number
  created_at: string
}

export default function AdminDashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserItem[]>([])
  const [entries, setEntries] = useState<GuestbookItem[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const [activeTab, setActiveTab] = useState<'overview' | 'entries' | 'subscribers' | 'notifications'>('overview')

  const [notifyTitle, setNotifyTitle] = useState('')
  const [notifyBody, setNotifyBody] = useState('')
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifySuccess, setNotifySuccess] = useState('')
  const [notifyError, setNotifyError] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Check auth + admin
  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      // We can't know role from stored user, let API reject if not admin
    }

    fetchData()
  }, [token, navigate])

  const authHeaders = { Authorization: `Bearer ${token}` }

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, entriesRes, subsRes, notifRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers: authHeaders }),
        fetch(`${API_URL}/admin/users`, { headers: authHeaders }),
        fetch(`${API_URL}/admin/entries`, { headers: authHeaders }),
        fetch(`${API_URL}/admin/subscribers`, { headers: authHeaders }),
        fetch(`${API_URL}/admin/notifications`, { headers: authHeaders }),
      ])

      if (statsRes.status === 403) {
        setError(t('admin.forbidden'))
        setLoading(false)
        return
      }

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      const entriesData = await entriesRes.json()
      const subsData = await subsRes.json()
      const notifData = await notifRes.json()

      setStats(statsData.stats)
      setUsers(usersData.users || [])
      setEntries(entriesData.entries || [])
      setSubscribers(subsData.subscribers || [])
      setNotifications(notifData.notifications || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotifyError('')
    setNotifySuccess('')
    setNotifyLoading(true)

    try {
      const res = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notifyTitle, body: notifyBody }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('admin.notifyError'))

      setNotifySuccess(data.message)
      setNotifyTitle('')
      setNotifyBody('')
      // Refresh notifications list
      const notifRes = await fetch(`${API_URL}/admin/notifications`, { headers: authHeaders })
      const notifData = await notifRes.json()
      setNotifications(notifData.notifications || [])
      // Refresh stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers: authHeaders })
      const statsData = await statsRes.json()
      setStats(statsData.stats)
    } catch (err: any) {
      setNotifyError(err.message)
    } finally {
      setNotifyLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }


  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Topbar */}
      <nav className="border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 font-semibold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10">
              <Shield className="h-4 w-4 text-amber-400" />
            </div>
            <span>{t('admin.title')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              {t('admin.backHome')}
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-neutral-600 py-20">{t('admin.loading')}</div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                      <Users className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-neutral-500">{t('admin.statsUsers')}</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">{stats.users}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
                      <MessageSquare className="h-4 w-4 text-cyan-400" />
                    </div>
                    <span className="text-sm text-neutral-500">{t('admin.statsEntries')}</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">{stats.entries}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10">
                      <Mail className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-sm text-neutral-500">{t('admin.statsSubscribers')}</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">{stats.subscribers}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                      <Bell className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-sm text-neutral-500">{t('admin.statsNotifications')}</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">{stats.notifications}</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/5 pb-1 overflow-x-auto">
              {(['overview', 'entries', 'subscribers', 'notifications'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {t(`admin.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
                </button>
              ))}
            </div>

            {/* Overview Tab - Send Notification */}
            {activeTab === 'overview' && (
              <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-8">
                <h2 className="text-lg font-semibold text-white mb-2">{t('admin.sendNotification')}</h2>
                <p className="text-sm text-neutral-500 mb-6">{t('admin.sendNotificationDesc')}</p>

                {notifySuccess && (
                  <div className="mb-5 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {notifySuccess}
                  </div>
                )}
                {notifyError && (
                  <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{notifyError}</div>
                )}

                <form onSubmit={sendNotification} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-400">{t('admin.notifyTitle')}</label>
                    <input
                      type="text"
                      required
                      value={notifyTitle}
                      onChange={(e) => setNotifyTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                      placeholder={t('admin.notifyTitlePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-400">{t('admin.notifyBody')}</label>
                    <textarea
                      required
                      rows={4}
                      value={notifyBody}
                      onChange={(e) => setNotifyBody(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                      placeholder={t('admin.notifyBodyPlaceholder')}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={notifyLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-blue-500/20"
                  >
                    <Send className="h-4 w-4" />
                    {notifyLoading ? t('admin.notifySending') : t('admin.notifySend')}
                  </button>
                </form>
              </div>
            )}

            {/* Entries Tab */}
            {activeTab === 'entries' && (
              <div className="space-y-3">
                {entries.length === 0 ? (
                  <div className="rounded-3xl border border-white/5 bg-neutral-900/30 p-12 text-center text-sm text-neutral-500">
                    {t('admin.noEntries')}
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{entry.name}</span>
                          <span className="text-xs text-neutral-600">{entry.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-neutral-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(entry.created_at)}
                          </span>
                          <button
                            onClick={async () => {
                              if (!confirm('確定刪除這則留言？')) return
                              await fetch(`${API_URL}/admin/entries/${entry.id}`, {
                                method: 'DELETE',
                                headers: authHeaders,
                              })
                              setEntries(prev => prev.filter(e => e.id !== entry.id))
                            }}
                            className="text-neutral-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-300 leading-relaxed">{entry.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Subscribers Tab */}
            {activeTab === 'subscribers' && (
              <div className="rounded-2xl border border-white/5 bg-neutral-900/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-neutral-500">
                      <th className="px-5 py-3 text-left font-medium">{t('admin.tableEmail')}</th>
                      <th className="px-5 py-3 text-left font-medium">{t('admin.tableName')}</th>
                      <th className="px-5 py-3 text-left font-medium">{t('admin.tableStatus')}</th>
                      <th className="px-5 py-3 text-left font-medium">{t('admin.tableDate')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-neutral-500">
                          {t('admin.noSubscribers')}
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 text-neutral-300">{sub.email}</td>
                          <td className="px-5 py-3 text-neutral-400">{sub.name || '-'}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              sub.active
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                            }`}>
                              {sub.active ? t('admin.statusActive') : t('admin.statusInactive')}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-neutral-600">{formatDate(sub.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="rounded-3xl border border-white/5 bg-neutral-900/30 p-12 text-center text-sm text-neutral-500">
                    {t('admin.noNotifications')}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-white">{n.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-neutral-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {n.sent_count} {t('admin.recipients')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(n.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
