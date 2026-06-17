'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

const firebaseErrors: Record<string, string> = {
  'auth/email-already-in-use': '此 Email 已被註冊',
  'auth/invalid-email': 'Email 格式不正確',
  'auth/weak-password': '密碼至少需要 6 個字元',
  'auth/operation-not-allowed': '此註冊方式尚未啟用，請到 Firebase Console 啟用',
  'auth/too-many-requests': '嘗試次數過多，請稍後再試',
  'auth/network-request-failed': '網路連線失敗，請檢查網路',
  'auth/popup-closed-by-user': '已取消註冊',
}

function getErrorMessage(error: any): string {
  if (error?.code && firebaseErrors[error.code]) return firebaseErrors[error.code]
  if (typeof error?.message === 'string' && error.message.length > 0) return error.message
  if (typeof error?.detail === 'string') return error.detail
  if (Array.isArray(error?.detail)) return error.detail.map((d: any) => d.msg || String(d)).join(', ')
  return '註冊失敗，請稍後再試'
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const { signup, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(email, password, name || undefined)
      toast('註冊成功', 'success')
      router.push('/')
    } catch (err: any) {
      const msg = getErrorMessage(err)
      setError(msg)
      toast(msg, 'error')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      toast('Google 註冊成功', 'success')
      router.push('/')
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        const msg = getErrorMessage(err)
        setError(msg)
        toast(msg, 'error')
      }
    }
    setGoogleLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
          ← 回到主頁
        </Link>
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          <span className="text-purple-400">AI</span> Content Generator
        </h1>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 space-y-4">
          <h2 className="text-2xl font-bold text-white text-center mb-4">註冊</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 bg-white text-gray-900 font-bold rounded-lg transition hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            使用 Google 註冊
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">或使用帳號密碼</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">姓名</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                placeholder="你的名字（選填）"
              />
            </div>
            <div>
              <label className="block text-white mb-2">電子信箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">密碼</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                placeholder="至少 6 個字元"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? '註冊中...' : '註冊'}
            </button>
          </form>

          <p className="text-center text-gray-400">
            已有帳號？{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              登入
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
