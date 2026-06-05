import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './database'
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

async function start() {
  await initDatabase()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

start().catch(console.error)
