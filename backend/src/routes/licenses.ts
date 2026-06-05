import { Router } from 'express'
import { getDb } from '../database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// 取得當前用戶的所有授權
router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb()
    const licenses = await db.all(
      'SELECT id, license_key, plan, status, created_at, activated_at FROM licenses WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.id]
    )
    res.json({ licenses })
  } catch (err: any) {
    console.error('Get licenses error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// 驗證授權碼（供桌面軟體呼叫）
router.post('/verify', async (req, res) => {
  try {
    const { license_key } = req.body
    if (!license_key) {
      res.status(400).json({ error: '缺少授權碼' })
      return
    }

    const db = await getDb()
    const license = await db.get('SELECT * FROM licenses WHERE license_key = ?', [license_key])

    if (!license) {
      res.status(404).json({ valid: false, error: '授權碼不存在' })
      return
    }

    if (license.status === 'expired') {
      res.status(400).json({ valid: false, error: '授權已過期' })
      return
    }

    if (license.status === 'revoked') {
      res.status(400).json({ valid: false, error: '授權已被撤銷' })
      return
    }

    // 檢查試用期限
    if (license.status === 'trial' && license.expires_at) {
      const now = new Date()
      const expire = new Date(license.expires_at)
      if (now > expire) {
        await db.run('UPDATE licenses SET status = ? WHERE id = ?', ['expired', license.id])
        res.status(400).json({ valid: false, error: '試用期限已過' })
        return
      }
    }

    res.json({
      valid: true,
      plan: license.plan,
      status: license.status,
      expires_at: license.expires_at,
    })
  } catch (err: any) {
    console.error('Verify license error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// 啟動授權（桌面軟體首次啟動時呼叫）
router.post('/activate', async (req, res) => {
  try {
    const { license_key, device_id } = req.body
    if (!license_key || !device_id) {
      res.status(400).json({ error: '缺少必要參數' })
      return
    }

    const db = await getDb()
    const license = await db.get('SELECT * FROM licenses WHERE license_key = ?', [license_key])

    if (!license) {
      res.status(404).json({ error: '授權碼不存在' })
      return
    }

    if (license.status === 'expired' || license.status === 'revoked') {
      res.status(400).json({ error: '授權無效' })
      return
    }

    // 更新啟動時間
    if (!license.activated_at) {
      await db.run('UPDATE licenses SET activated_at = CURRENT_TIMESTAMP WHERE id = ?', [license.id])
    }

    res.json({ success: true, message: '授權啟動成功', plan: license.plan })
  } catch (err: any) {
    console.error('Activate license error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

export default router
