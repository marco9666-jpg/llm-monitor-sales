import { Router } from 'express'
import { db } from '../firebase'
import { sendTelegram } from '../telegram'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const snap = await db.collection('guestbook').orderBy('created_at', 'desc').limit(200).get()
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json({ entries })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email and message are required' }); return
    }
    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      res.status(400).json({ error: 'Input too long' }); return
    }

    const data = { name: name.trim(), email: email.trim(), message: message.trim(), created_at: new Date().toISOString() }
    const ref = await db.collection('guestbook').add(data)

    sendTelegram(`💬 <b>新留言</b>\n👤 ${data.name} (${data.email})\n📝 ${data.message.slice(0, 200)}`)

    res.status(201).json({ id: ref.id, ...data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
