import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { db } from '../firebase'

const router = Router()
router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/stats', async (_req, res) => {
  try {
    const [users, entries, subs, notifs, dlDoc] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('guestbook').count().get(),
      db.collection('subscriptions').where('active', '==', true).count().get(),
      db.collection('notifications').count().get(),
      db.collection('meta').doc('downloads').get(),
    ])
    res.json({ stats: {
      users: users.data().count,
      entries: entries.data().count,
      subscribers: subs.data().count,
      notifications: notifs.data().count,
      downloads: dlDoc.exists ? dlDoc.data()!.count : 0,
    }})
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/users', async (_req, res) => {
  try {
    const snap = await db.collection('users').orderBy('created_at', 'desc').limit(500).get()
    const users = snap.docs.map(d => {
      const { password, ...safe } = d.data() as any
      return { id: d.id, ...safe }
    })
    res.json({ users })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/entries', async (_req, res) => {
  try {
    const snap = await db.collection('guestbook').orderBy('created_at', 'desc').limit(500).get()
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json({ entries })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/entries/:id', async (req, res) => {
  try {
    const ref = db.collection('guestbook').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists) { res.status(404).json({ error: 'Entry not found' }); return }
    await ref.delete()
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/subscribers', async (_req, res) => {
  try {
    const snap = await db.collection('subscriptions').orderBy('created_at', 'desc').limit(500).get()
    const subscribers = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json({ subscribers })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/notifications', async (_req, res) => {
  try {
    const snap = await db.collection('notifications').orderBy('created_at', 'desc').limit(200).get()
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json({ notifications })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
