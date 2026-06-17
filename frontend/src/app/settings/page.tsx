'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { apiPut, apiDelete } from '@/lib/api'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

const planNames: Record<string, string> = {
  free: '免費版',
  pro: '專業版',
  enterprise: '企業版',
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingApiKey, setSavingApiKey] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await apiPut('/api/auth/profile', { name })
      toast('個人資料已更新', 'success')
      refreshUser()
    } catch (error: any) {
      toast(error.message || '更新失敗', 'error')
    }
    setSavingProfile(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast('兩次輸入的密碼不一致', 'error')
      return
    }
    if (newPassword.length < 6) {
      toast('新密碼至少需要 6 個字元', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await apiPut('/api/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      toast('密碼已更新', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast(error.message || '變更失敗', 'error')
    }
    setSavingPassword(false)
  }

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.startsWith('sk-')) {
      toast('API Key 格式不正確，需以 sk- 開頭', 'error')
      return
    }
    setSavingApiKey(true)
    try {
      await apiPut('/api/auth/api-key', { api_key: apiKey })
      toast('API Key 已儲存', 'success')
      setApiKey('')
      refreshUser()
    } catch (error: any) {
      toast(error.message || '儲存失敗', 'error')
    }
    setSavingApiKey(false)
  }

  const handleDeleteApiKey = async () => {
    if (!confirm('確定要刪除 API Key 嗎？刪除後將無法使用 AI 生成功能。')) return
    try {
      await apiDelete('/api/auth/api-key')
      toast('API Key 已刪除', 'success')
      refreshUser()
    } catch (error: any) {
      toast(error.message || '刪除失敗', 'error')
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">帳號設定</h1>

        <div className="max-w-2xl space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">個人資料</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-white mb-2">電子信箱</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-white mb-2">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="你的名字"
                />
              </div>
              <div>
                <label className="block text-white mb-2">目前方案</label>
                <p className="text-purple-400 font-bold text-lg">
                  {planNames[user?.plan || 'free'] || user?.plan}
                </p>
              </div>
              <Button type="submit" loading={savingProfile}>
                儲存個人資料
              </Button>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">OpenAI API Key</h2>
            <p className="text-gray-400 text-sm mb-4">
              請提供你自己的 OpenAI API Key 以使用 AI 生成功能。
              你可以在 <a href="https://platform.openai.com/api-keys" target="_blank" className="text-purple-400 hover:underline">OpenAI 後台</a> 取得。
            </p>
            <div className="mb-4">
              <span className="text-white text-sm">狀態：</span>
              {user?.has_api_key ? (
                <span className="text-green-400 text-sm">已設定</span>
              ) : (
                <span className="text-red-400 text-sm">未設定</span>
              )}
            </div>
            <form onSubmit={handleUpdateApiKey} className="space-y-4">
              <div>
                <label className="block text-white mb-2">
                  {user?.has_api_key ? '更新 API Key' : '新增 API Key'}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="sk-..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={savingApiKey}>
                  {user?.has_api_key ? '更新 API Key' : '儲存 API Key'}
                </Button>
                {user?.has_api_key && (
                  <Button type="button" variant="secondary" onClick={handleDeleteApiKey}>
                    刪除 API Key
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">變更密碼</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-white mb-2">目前密碼</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="輸入目前密碼"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">新密碼</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="至少 6 個字元"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">確認新密碼</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="再次輸入新密碼"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" loading={savingPassword}>
                變更密碼
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
