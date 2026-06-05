import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import licenseRoutes from './routes/licenses'
import guestbookRoutes from './routes/guestbook'
import subscriptionRoutes from './routes/subscriptions'
import adminRoutes from './routes/admin'
import notificationRoutes from './routes/notifications'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/licenses', licenseRoutes)
app.use('/api/guestbook', guestbookRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// POST /api/downloads - record a download click (no auth required)
app.post('/api/downloads', async (_req, res) => {
  try {
    const { db } = await import('./firebase')
    const ref = db.collection('meta').doc('downloads')
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref)
      tx.set(ref, { count: (doc.exists ? doc.data()!.count : 0) + 1 }, { merge: true })
    })
    res.json({ ok: true })
  } catch {
    res.json({ ok: true }) // 失敗靜默忽略，不影響下載
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
