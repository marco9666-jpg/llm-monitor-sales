import { Router } from 'express'
import { db } from '../firebase'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' }); return
    }
    const emailLower = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      res.status(400).json({ error: 'Invalid email format' }); return
    }

    const snap = await db.collection('subscriptions').where('email', '==', emailLower).limit(1).get()
    if (!snap.empty) {
      const doc = snap.docs[0]
      if (doc.data().active === false) {
        await doc.ref.update({ active: true })
        res.json({ success: true, message: 'Re-subscribed successfully' }); return
      }
      res.status(400).json({ error: 'This email is already subscribed' }); return
    }

    await db.collection('subscriptions').add({
      email: emailLower, name: name?.trim() || null,
      active: true, created_at: new Date().toISOString()
    })
    res.status(201).json({ success: true, message: 'Subscribed successfully' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.query
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' }); return
    }
    const snap = await db.collection('subscriptions').where('email', '==', email.trim().toLowerCase()).limit(1).get()
    if (!snap.empty) await snap.docs[0].ref.update({ active: false })
    res.json({ success: true, message: 'Unsubscribed successfully' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
