'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import {
  loginWithGoogle as fbLoginWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  logoutFirebase,
  getIdToken,
  onAuthChange,
} from '@/lib/firebase'

interface User {
  id: string
  email: string
  name: string | null
  plan: string
  has_api_key: boolean
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

async function syncFirebaseUser(firebaseUser: any): Promise<User> {
  const idToken = await getIdToken(firebaseUser)
  const data = await apiPost<{ user: User; access_token: string }>('/api/auth/firebase-login', {
    id_token: idToken,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
  })
  localStorage.setItem('token', data.access_token)
  return data.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await syncFirebaseUser(firebaseUser)
          setUser(userData)
        } catch {
          setUser(null)
        }
      } else {
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const userData = await apiGet<User>('/api/auth/me')
            setUser(userData)
          } catch {
            localStorage.removeItem('token')
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const fbUser = await fbLoginWithEmail(email, password)
    const userData = await syncFirebaseUser(fbUser)
    setUser(userData)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const fbUser = await fbLoginWithGoogle()
    const userData = await syncFirebaseUser(fbUser)
    setUser(userData)
  }, [])

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    const fbUser = await fbRegisterWithEmail(email, password, name)
    const userData = await syncFirebaseUser(fbUser)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    await logoutFirebase()
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = await apiGet<User>('/api/auth/me')
        setUser(userData)
      } catch {
        localStorage.removeItem('token')
        setUser(null)
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithGoogle, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
