import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { getDb } from '../database'

const router = Router()

// All admin routes require authentication + admin role
router.use(authMiddleware)
router.use(adminMiddleware)

// GET /api/admin/stats - Dashboard stats
router.get('/stats', async (_req, res) => {
  try {
    const db = await getDb()
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users')
    const totalEntries = await db.get('SELECT COUNT(*) as count FROM guestbook')
    const totalSubscribers = await db.get('SELECT COUNT(*) as count FROM subscriptions WHERE active = 1')
    const totalNotifications = await db.get('SELECT COUNT(*) as count FROM notifications')

    res.json({
      stats: {
        users: totalUsers.count,
        entries: totalEntries.count,
        subscribers: totalSubscribers.count,
        notifications: totalNotifications.count,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/users - List all users
router.get('/users', async (_req, res) => {
  try {
    const db = await getDb()
    const users = await db.all(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 500`
    )
    res.json({ users })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/entries - List all guestbook entries
router.get('/entries', async (_req, res) => {
  try {
    const db = await getDb()
    const entries = await db.all(
      `SELECT * FROM guestbook ORDER BY created_at DESC LIMIT 500`
    )
    res.json({ entries })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/admin/entries/:id - Delete a guestbook entry
router.delete('/entries/:id', async (req, res) => {
  try {
    const db = await getDb()
    const { changes } = await db.run('DELETE FROM guestbook WHERE id = ?', [req.params.id])
    if (changes === 0) {
      res.status(404).json({ error: 'Entry not found' })
      return
    }
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/subscribers - List all subscribers
router.get('/subscribers', async (_req, res) => {
  try {
    const db = await getDb()
    const subscribers = await db.all(
      `SELECT id, email, name, active, created_at FROM subscriptions ORDER BY created_at DESC LIMIT 500`
    )
    res.json({ subscribers })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/notifications - List all sent notifications
router.get('/notifications', async (_req, res) => {
  try {
    const db = await getDb()
    const notifications = await db.all(
      `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 200`
    )
    res.json({ notifications })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
