import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../firebase'
import { sendTelegram } from '../telegram'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ error: '請填寫所有欄位' }); return
    }

    const existing = await db.collection('users').where('email', '==', email).limit(1).get()
    if (!existing.empty) {
      res.status(400).json({ error: '此電子郵件已被註冊' }); return
    }

    const hashed = await bcrypt.hash(password, 10)
    const role = process.env.ADMIN_EMAIL === email ? 'admin' : 'user'
    const now = new Date().toISOString()

    const userRef = await db.collection('users').add({ name, email, password: hashed, role, created_at: now })

    // 試用授權碼
    const trialKey = `TRIAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const trialExpire = new Date(); trialExpire.setDate(trialExpire.getDate() + 14)
    await db.collection('licenses').add({
      user_id: userRef.id, license_key: trialKey, plan: 'trial',
      status: 'trial', created_at: now, expires_at: trialExpire.toISOString()
    })

    const token = jwt.sign(
      { id: userRef.id, email, role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    sendTelegram(`🆕 <b>新用戶註冊</b>\n👤 ${name}\n📧 ${email}`)

    res.json({ token, user: { id: userRef.id, name, email }, message: '註冊成功，已啟用 14 天免費試用' })
  } catch (err: any) {
    console.error('Register error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: '請填寫所有欄位' }); return
    }

    const snap = await db.collection('users').where('email', '==', email).limit(1).get()
    if (snap.empty) {
      res.status(400).json({ error: '帳號或密碼錯誤' }); return
    }

    const userDoc = snap.docs[0]
    const user = userDoc.data()
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(400).json({ error: '帳號或密碼錯誤' }); return
    }

    const token = jwt.sign(
      { id: userDoc.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: userDoc.id, name: user.name, email: user.email } })
  } catch (err: any) {
    console.error('Login error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

export default router
