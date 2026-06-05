import { useState, useEffect, useCallback } from 'react'

interface UserData {
  id: string
  name: string
  email: string
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<UserData | null>(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserData
    } catch {
      return null
    }
  })

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        setToken(e.newValue)
      }
      if (e.key === 'user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: null }))
  }, [])

  const isLoggedIn = !!token && !!user

  return { token, user, isLoggedIn, logout }
}
