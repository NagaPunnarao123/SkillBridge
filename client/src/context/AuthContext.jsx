import { createContext, useContext, useState, useEffect } from 'react'
import { firebaseLogin, firebaseRegister, firebaseLogout, getUserProfile, updateUserProfile } from '../data/firebaseApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Read persisted user from offline localStorage store
    try {
      const stored = localStorage.getItem('sb_mock_current_user')
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load offline user session:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const u = await firebaseLogin(email, password)
    setUser(u)
    return u
  }

  const register = async (formData) => {
    const u = await firebaseRegister(formData)
    setUser(u)
    return u
  }

  const logout = async () => {
    await firebaseLogout()
    setUser(null)
  }

  const updateUser = async (data) => {
    if (!user?.uid && !user?.id) return
    const id = user.uid || user.id
    const updated = await updateUserProfile(id, data)
    setUser(updated)
    return updated
  }

  const refreshUser = async () => {
    if (!user?.uid && !user?.id) return null
    const id = user.uid || user.id
    const stored = await getUserProfile(id)
    if (stored) setUser(stored)
    return stored
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
