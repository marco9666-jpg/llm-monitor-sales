import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getDb } from '../database'

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string }
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    // Always fetch fresh role from DB so role changes take effect without re-login
    const db = await getDb()
    const user = await db.get('SELECT id, email, role FROM users WHERE id = ?', [decoded.id])
    if (!user) { res.status(401).json({ error: 'User not found' }); return }
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required' })
    return
  }
  next()
}
