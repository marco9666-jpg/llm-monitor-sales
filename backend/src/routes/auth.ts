import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb } from '../database'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ error: '請填寫所有欄位' })
      return
    }

    const db = await getDb()
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email])
    if (existing) {
      res.status(400).json({ error: '此電子郵件已被註冊' })
      return
    }

    const hashed = await bcrypt.hash(password, 10)
    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    )

    const userId = result.lastID

    // 產生試用授權碼
    const trialKey = `TRIAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const trialExpire = new Date()
    trialExpire.setDate(trialExpire.getDate() + 14)

    await db.run(
      'INSERT INTO licenses (user_id, license_key, plan, status, expires_at) VALUES (?, ?, ?, ?, ?)',
      [userId, trialKey, 'trial', 'trial', trialExpire.toISOString()]
    )

    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: userId, name, email },
      message: '註冊成功，已啟用 14 天免費試用',
    })
  } catch (err: any) {
    console.error('Register error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: '請填寫所有欄位' })
      return
    }

    const db = await getDb()
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email])
    if (!user) {
      res.status(400).json({ error: '帳號或密碼錯誤' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(400).json({ error: '帳號或密碼錯誤' })
      return
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err: any) {
    console.error('Login error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

export default router
