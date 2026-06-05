import { Router } from 'express'
import { db } from '../firebase'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const snap = await db.collection('licenses')
      .where('user_id', '==', req.user!.id)
      .orderBy('created_at', 'desc').get()
    const licenses = snap.docs.map(d => {
      const { user_id, ...rest } = d.data() as any
      return { id: d.id, ...rest }
    })
    res.json({ licenses })
  } catch (err: any) {
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { license_key } = req.body
    if (!license_key) { res.status(400).json({ error: '缺少授權碼' }); return }

    const snap = await db.collection('licenses').where('license_key', '==', license_key).limit(1).get()
    if (snap.empty) { res.status(404).json({ valid: false, error: '授權碼不存在' }); return }

    const licDoc = snap.docs[0]
    const lic = licDoc.data()

    if (lic.status === 'expired') { res.status(400).json({ valid: false, error: '授權已過期' }); return }
    if (lic.status === 'revoked') { res.status(400).json({ valid: false, error: '授權已被撤銷' }); return }

    if (lic.status === 'trial' && lic.expires_at && new Date() > new Date(lic.expires_at)) {
      await licDoc.ref.update({ status: 'expired' })
      res.status(400).json({ valid: false, error: '試用期限已過' }); return
    }

    res.json({ valid: true, plan: lic.plan, status: lic.status, expires_at: lic.expires_at })
  } catch (err: any) {
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

router.post('/activate', async (req, res) => {
  try {
    const { license_key } = req.body
    if (!license_key) { res.status(400).json({ error: '缺少必要參數' }); return }

    const snap = await db.collection('licenses').where('license_key', '==', license_key).limit(1).get()
    if (snap.empty) { res.status(404).json({ error: '授權碼不存在' }); return }

    const licDoc = snap.docs[0]
    const lic = licDoc.data()
    if (lic.status === 'expired' || lic.status === 'revoked') {
      res.status(400).json({ error: '授權無效' }); return
    }
    if (!lic.activated_at) await licDoc.ref.update({ activated_at: new Date().toISOString() })

    res.json({ success: true, message: '授權啟動成功', plan: lic.plan })
  } catch (err: any) {
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

export default router
