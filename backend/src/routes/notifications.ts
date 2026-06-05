import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { getDb } from '../database'

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

// POST /api/notifications - Send a notification (save to DB)
router.post('/', async (req, res) => {
  try {
    const { title, body } = req.body

    if (!title || !body) {
      res.status(400).json({ error: 'Title and body are required' })
      return
    }

    if (title.length > 200 || body.length > 2000) {
      res.status(400).json({ error: 'Title or body too long' })
      return
    }

    const db = await getDb()

    // Count active subscribers
    const subscriberCount = await db.get(
      'SELECT COUNT(*) as count FROM subscriptions WHERE active = 1'
    )

    // Save notification
    const result = await db.run(
      'INSERT INTO notifications (title, body, sent_count) VALUES (?, ?, ?)',
      [title.trim(), body.trim(), subscriberCount.count]
    )

    res.status(201).json({
      id: result.lastID,
      title: title.trim(),
      body: body.trim(),
      sentCount: subscriberCount.count,
      message: `Notification saved. ${subscriberCount.count} subscribers would be notified.`,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
