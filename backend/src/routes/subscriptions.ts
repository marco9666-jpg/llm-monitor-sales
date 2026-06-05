import { Router } from 'express'
import { getDb } from '../database'

const router = Router()

// POST /api/subscriptions - Subscribe to updates
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' })
      return
    }

    const emailLower = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      res.status(400).json({ error: 'Invalid email format' })
      return
    }

    const db = await getDb()

    // Check if already subscribed
    const existing = await db.get('SELECT id, active FROM subscriptions WHERE email = ?', [emailLower])

    if (existing) {
      if (existing.active === 0) {
        // Reactivate
        await db.run('UPDATE subscriptions SET active = 1 WHERE id = ?', [existing.id])
        res.json({ success: true, message: 'Re-subscribed successfully' })
        return
      }
      res.status(400).json({ error: 'This email is already subscribed' })
      return
    }

    await db.run(
      'INSERT INTO subscriptions (email, name) VALUES (?, ?)',
      [emailLower, name?.trim() || null]
    )

    res.status(201).json({ success: true, message: 'Subscribed successfully' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/subscriptions/unsubscribe?email=... - Unsubscribe
router.get('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.query
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' })
      return
    }

    const db = await getDb()
    await db.run('UPDATE subscriptions SET active = 0 WHERE email = ?', [email.trim().toLowerCase()])

    res.json({ success: true, message: 'Unsubscribed successfully' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
