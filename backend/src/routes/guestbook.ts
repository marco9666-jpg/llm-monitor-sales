import { Router } from 'express'
import { getDb } from '../database'
import { sendTelegram } from '../telegram'

const router = Router()

// GET /api/guestbook - 取得所有留言（最新在前）
router.get('/', async (_req, res) => {
  try {
    const db = await getDb()
    const entries = await db.all(
      'SELECT * FROM guestbook ORDER BY created_at DESC LIMIT 200'
    )
    res.json({ entries })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/guestbook - 新增留言
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email and message are required' })
      return
    }

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      res.status(400).json({ error: 'Input too long' })
      return
    }

    const db = await getDb()
    const result = await db.run(
      'INSERT INTO guestbook (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    )

    sendTelegram(`💬 <b>新留言</b>\n👤 ${name.trim()} (${email.trim()})\n📝 ${message.trim().slice(0, 200)}`)

    res.status(201).json({
      id: result.lastID,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
