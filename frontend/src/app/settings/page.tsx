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

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, DALL-E 3',
    keyPrefix: 'sk-',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini 1.5 Flash',
    keyPrefix: 'AIza',
    placeholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/apikey',
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Claude 3 Haiku',
    keyPrefix: 'sk-ant-',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
]

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('openai')
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
    const provider = providers.find(p => p.id === selectedProvider)
    if (provider && !apiKey.startsWith(provider.keyPrefix)) {
      toast(`${provider.name} API Key 格式不正確，需以 ${provider.keyPrefix} 開頭`, 'error')
      return
    }
    setSavingApiKey(true)
    try {
      await apiPut('/api/auth/provider-key', { provider: selectedProvider, api_key: apiKey })
      toast(`${provider?.name || selectedProvider} API Key 已儲存`, 'success')
      setApiKey('')
      refreshUser()
    } catch (error: any) {
      toast(error.message || '儲存失敗', 'error')
    }
    setSavingApiKey(false)
  }

  const handleDeleteApiKey = async (provider: string) => {
    if (!confirm(`確定要刪除 ${providers.find(p => p.id === provider)?.name || provider} API Key 嗎？`)) return
    try {
      await apiDelete(`/api/auth/provider-key/${provider}`)
      toast('API Key 已刪除', 'success')
      refreshUser()
    } catch (error: any) {
      toast(error.message || '刪除失敗', 'error')
    }
  }

  const handleSetPreferred = async (provider: string) => {
    try {
      await apiPut('/api/auth/preferred-provider', { provider })
      toast('已設為預設 AI 供應商', 'success')
      refreshUser()
    } catch (error: any) {
      toast(error.message || '設定失敗', 'error')
    }
  }

  const getKeyStatus = (provider: string) => {
    switch (provider) {
      case 'openai': return user?.has_api_key
      case 'gemini': return user?.has_gemini_key
      case 'claude': return user?.has_claude_key
      default: return false
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
            <h2 className="text-xl font-bold text-white mb-4">AI API Keys</h2>
            <p className="text-gray-400 text-sm mb-4">
              提供你的 API Key 以使用 AI 生成功能。你可以同時設定多個供應商。
            </p>

            <div className="space-y-4 mb-6">
              {providers.map(provider => {
                const hasKey = getKeyStatus(provider.id)
                const isPreferred = user?.preferred_provider === provider.id
                return (
                  <div key={provider.id} className={`p-4 rounded-lg border ${isPreferred ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white font-medium">{provider.name}</span>
                        <span className="text-gray-400 text-sm ml-2">({provider.description})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasKey ? (
                          <span className="text-green-400 text-sm">已設定</span>
                        ) : (
                          <span className="text-red-400 text-sm">未設定</span>
                        )}
                        {hasKey && !isPreferred && (
                          <button
                            onClick={() => handleSetPreferred(provider.id)}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            設為預設
                          </button>
                        )}
                        {isPreferred && (
                          <span className="text-xs text-purple-400">預設</span>
                        )}
                        {hasKey && (
                          <button
                            onClick={() => handleDeleteApiKey(provider.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            刪除
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleUpdateApiKey} className="space-y-4">
              <div>
                <label className="block text-white mb-2">選擇 AI 供應商</label>
                <select
                  value={selectedProvider}
                  onChange={e => { setSelectedProvider(e.target.value); setApiKey('') }}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-purple-400"
                >
                  {providers.map(p => (
                    <option key={p.id} value={p.id} className="text-gray-900">{p.name} - {p.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder={providers.find(p => p.id === selectedProvider)?.placeholder}
                  />
                  <Button type="submit" loading={savingApiKey}>
                    儲存
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  取得 Key：
                  <a href={providers.find(p => p.id === selectedProvider)?.docsUrl} target="_blank" className="text-purple-400 hover:underline">
                    {providers.find(p => p.id === selectedProvider)?.name} 後台
                  </a>
                </p>
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
