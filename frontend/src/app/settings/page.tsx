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
import { useLanguage } from '@/contexts/LanguageContext'

const planNames: Record<string, string> = {
  free: '免費版',
  pro: '專業版',
  enterprise: '企業版',
}

const providers = [
  { id: 'openai', name: 'OpenAI', keyPrefix: 'sk-', placeholder: 'sk-...', docsUrl: 'https://platform.openai.com/api-keys',
    models: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'o3', 'o3-pro', 'o4-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano'] },
  { id: 'gemini', name: 'Google Gemini', keyPrefix: 'AIza', placeholder: 'AIza...', docsUrl: 'https://aistudio.google.com/apikey',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'claude', name: 'Claude', keyPrefix: 'sk-ant-', placeholder: 'sk-ant-...', docsUrl: 'https://console.anthropic.com/settings/keys',
    models: ['claude-fable-5', 'claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-sonnet-4-5'] },
]

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t, locale } = useLanguage()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [customModel, setCustomModel] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingApiKey, setSavingApiKey] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      updateModelForProvider(user.preferred_provider || 'openai')
    }
  }, [user])

  const updateModelForProvider = (providerId: string) => {
    if (!user) return
    switch (providerId) {
      case 'openai': setCustomModel(user.openai_model || 'gpt-5.4-mini'); break
      case 'gemini': setCustomModel(user.gemini_model || 'gemini-2.5-flash'); break
      case 'claude': setCustomModel(user.claude_model || 'claude-sonnet-4-6'); break
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try { await apiPut('/api/auth/profile', { name }); toast('個人資料已更新', 'success'); refreshUser() }
    catch (error: any) { toast(error.message || '更新失敗', 'error') }
    setSavingProfile(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast('兩次輸入的密碼不一致', 'error'); return }
    if (newPassword.length < 6) { toast('新密碼至少需要 6 個字元', 'error'); return }
    setSavingPassword(true)
    try {
      await apiPut('/api/auth/password', { current_password: currentPassword, new_password: newPassword })
      toast('密碼已更新', 'success'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (error: any) { toast(error.message || '變更失敗', 'error') }
    setSavingPassword(false)
  }

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    const provider = providers.find(p => p.id === selectedProvider)
    if (provider && apiKey && !apiKey.startsWith(provider.keyPrefix)) {
      toast(`${provider.name} API Key 格式不正確，需以 ${provider.keyPrefix} 開頭`, 'error'); return
    }
    setSavingApiKey(true)
    try {
      await apiPut('/api/auth/provider-key', { provider: selectedProvider, api_key: apiKey })
      toast(`${provider?.name || selectedProvider} API Key 已儲存`, 'success'); setApiKey(''); refreshUser()
    } catch (error: any) { toast(error.message || '儲存失敗', 'error') }
    setSavingApiKey(false)
  }

  const handleSaveModel = async () => {
    try {
      await apiPut('/api/auth/model', { provider: selectedProvider, model: customModel })
      toast('模型設定已儲存', 'success'); refreshUser()
    } catch (error: any) { toast(error.message || '儲存失敗', 'error') }
  }

  const handleDeleteApiKey = async (provider: string) => {
    if (!confirm(`確定要刪除 ${providers.find(p => p.id === provider)?.name || provider} API Key 嗎？`)) return
    try { await apiDelete(`/api/auth/provider-key/${provider}`); toast('API Key 已刪除', 'success'); refreshUser() }
    catch (error: any) { toast(error.message || '刪除失敗', 'error') }
  }

  const handleSetPreferred = async (provider: string) => {
    try { await apiPut('/api/auth/preferred-provider', { provider }); toast('已設為預設 AI 供應商', 'success'); refreshUser() }
    catch (error: any) { toast(error.message || '設定失敗', 'error') }
  }

  const getKeyStatus = (provider: string) => {
    switch (provider) {
      case 'openai': return user?.has_api_key
      case 'gemini': return user?.has_gemini_key
      case 'claude': return user?.has_claude_key
      default: return false
    }
  }

  const getModelForProvider = (provider: string) => {
    switch (provider) {
      case 'openai': return user?.openai_model || 'gpt-5.4-mini'
      case 'gemini': return user?.gemini_model || 'gemini-2.5-flash'
      case 'claude': return user?.claude_model || 'claude-sonnet-4-6'
      default: return ''
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center"><Skeleton className="h-96 w-full max-w-2xl" /></div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8 text-center">
            {t('settings.title')}
          </h1>

          <div className="space-y-6">
            {/* Profile */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">{t('settings.profile')}</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-white mb-2 text-sm">{t('settings.email')}</label>
                  <input type="email" value={user?.email || ''} disabled
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">{t('settings.name')}</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder={t('settings.name.placeholder')} />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">{t('settings.plan')}</label>
                  <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-bold">
                    {planNames[user?.plan || 'free'] || user?.plan}
                  </span>
                </div>
                <Button type="submit" loading={savingProfile}>{t('settings.save')}</Button>
              </form>
            </div>

            {/* AI API Keys & Models */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-2">{t('settings.ai')}</h2>
              <p className="text-gray-400 text-sm mb-6">{t('settings.ai.desc')}</p>

              {/* Provider Status */}
              <div className="space-y-3 mb-6">
                {providers.map(provider => {
                  const hasKey = getKeyStatus(provider.id)
                  const isPreferred = user?.preferred_provider === provider.id
                  const currentModel = getModelForProvider(provider.id)
                  return (
                    <div key={provider.id}
                      className={`p-4 rounded-xl border transition-all ${isPreferred ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${hasKey ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400'}`} />
                          <div>
                            <span className="text-white font-bold">{provider.name}</span>
                            <span className="text-gray-500 text-xs ml-2">{currentModel}</span>
                          </div>
                          {isPreferred && <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-bold">預設</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {hasKey && !isPreferred && (
                            <button onClick={() => handleSetPreferred(provider.id)}
                              className="text-xs text-purple-400 hover:text-purple-300 font-medium">設為預設</button>
                          )}
                          {hasKey && (
                            <button onClick={() => handleDeleteApiKey(provider.id)}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">刪除</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add Key & Model */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="mb-4">
                  <label className="block text-white mb-2 text-sm font-medium">{t('settings.provider')}</label>
                  <div className="flex gap-2">
                    {providers.map(p => (
                      <button key={p.id}
                        onClick={() => { setSelectedProvider(p.id); updateModelForProvider(p.id) }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          selectedProvider === p.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-2 text-sm font-medium">{t('settings.apiKey')}</label>
                  <div className="flex gap-2">
                    <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                      className="flex-1 p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                      placeholder={providers.find(p => p.id === selectedProvider)?.placeholder} />
                    <Button type="button" onClick={handleUpdateApiKey} loading={savingApiKey}>{t('settings.apiKey.save')}</Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    取得 Key：<a href={providers.find(p => p.id === selectedProvider)?.docsUrl} target="_blank"
                      className="text-purple-400 hover:underline">{providers.find(p => p.id === selectedProvider)?.name} 後台</a>
                  </p>
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm font-medium">{t('settings.model')}</label>
                  <div className="flex gap-2">
                    <select value={customModel} onChange={e => setCustomModel(e.target.value)}
                      className="flex-1 p-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-purple-400">
                      {providers.find(p => p.id === selectedProvider)?.models.map(m => (
                        <option key={m} value={m} className="text-gray-900">{m}</option>
                      ))}
                    </select>
                    <Button type="button" onClick={handleSaveModel} variant="secondary">{t('settings.model.save')}</Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('settings.model.custom')}</p>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">{t('settings.password')}</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-white mb-2 text-sm">{t('settings.password.current')}</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder={locale === 'zh-TW' ? '輸入目前密碼' : 'Enter current password'} required />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">{t('settings.password.new')}</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder={locale === 'zh-TW' ? '至少 6 個字元' : 'At least 6 characters'} minLength={6} required />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">{t('settings.password.confirm')}</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder={locale === 'zh-TW' ? '再次輸入新密碼' : 'Confirm new password'} minLength={6} required />
                </div>
                <Button type="submit" loading={savingPassword}>{t('settings.password.change')}</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
