import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { db } from '../firebase'

const router = Router()
router.use(authMiddleware)
router.use(adminMiddleware)

router.post('/', async (req, res) => {
  try {
    const { title, body } = req.body
    if (!title || !body) {
      res.status(400).json({ error: 'Title and body are required' }); return
    }
    if (title.length > 200 || body.length > 2000) {
      res.status(400).json({ error: 'Title or body too long' }); return
    }

    const subSnap = await db.collection('subscriptions').where('active', '==', true).get()
    const sentCount = subSnap.size

    const ref = await db.collection('notifications').add({
      title: title.trim(), body: body.trim(),
      sent_count: sentCount, created_at: new Date().toISOString()
    })

    res.status(201).json({
      id: ref.id, title: title.trim(), body: body.trim(), sentCount,
      message: `Notification saved. ${sentCount} subscribers would be notified.`
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
