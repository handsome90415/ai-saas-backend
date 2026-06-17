'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { apiPost } from '@/lib/api'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Skeleton } from '@/components/ui/Skeleton'

interface PlatformContent {
  platform: string
  title: string
  content: string
  hashtags: string[]
  status: 'pending' | 'generating' | 'done' | 'error'
}

interface PlatformDef {
  id: string
  name: string
  brandColor: string
  brandGradient: string
  brandColorLight: string
}

const platforms: PlatformDef[] = [
  { id: 'instagram', name: 'Instagram', brandColor: '#E4405F', brandGradient: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', brandColorLight: 'rgba(228,64,95,0.2)' },
  { id: 'facebook', name: 'Facebook', brandColor: '#1877F2', brandGradient: 'linear-gradient(135deg, #1877F2, #42a5f5)', brandColorLight: 'rgba(24,119,242,0.2)' },
  { id: 'twitter', name: 'Twitter/X', brandColor: '#000000', brandGradient: 'linear-gradient(135deg, #000000, #333333)', brandColorLight: 'rgba(255,255,255,0.1)' },
  { id: 'linkedin', name: 'LinkedIn', brandColor: '#0A66C2', brandGradient: 'linear-gradient(135deg, #0A66C2, #0077B5)', brandColorLight: 'rgba(10,102,194,0.2)' },
  { id: 'tiktok', name: 'TikTok', brandColor: '#010101', brandGradient: 'linear-gradient(135deg, #010101, #25F4EE, #FE2C55)', brandColorLight: 'rgba(255,255,255,0.08)' },
  { id: 'youtube', name: 'YouTube', brandColor: '#FF0000', brandGradient: 'linear-gradient(135deg, #FF0000, #CC0000)', brandColorLight: 'rgba(255,0,0,0.2)' },
  { id: 'blog', name: '部落格', brandColor: '#F59E0B', brandGradient: 'linear-gradient(135deg, #F59E0B, #D97706)', brandColorLight: 'rgba(245,158,11,0.2)' },
]

function PlatformIcon({ platformId, size = 24 }: { platformId: string; size?: number }) {
  const s = size
  const id = `icon-${platformId}-${Math.random().toString(36).slice(2,6)}`
  switch (platformId) {
    case 'instagram':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={id} x1="2" y1="22" x2="22" y2="2">
              <stop offset="0%" stopColor="#FEDA75"/>
              <stop offset="25%" stopColor="#FA7E1E"/>
              <stop offset="50%" stopColor="#D62976"/>
              <stop offset="75%" stopColor="#962FBF"/>
              <stop offset="100%" stopColor="#4F5BD5"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" stroke={`url(#${id})`} strokeWidth="2"/>
          <circle cx="12" cy="12" r="5" stroke={`url(#${id})`} strokeWidth="2"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill={`url(#${id})`}/>
        </svg>
      )
    case 'facebook':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.384C19.612 22.954 24 17.99 24 12z"/>
        </svg>
      )
    case 'twitter':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="#000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case 'linkedin':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    case 'tiktok':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.96a8.21 8.21 0 004.76 1.51V7.02a4.83 4.83 0 01-1-.33z" fill="#25F4EE"/>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.96a8.21 8.21 0 004.76 1.51V7.02a4.83 4.83 0 01-1-.33z" fill="#FE2C55" style={{transform: 'translate(1px, -1px)'}}/>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.96a8.21 8.21 0 004.76 1.51V7.02a4.83 4.83 0 01-1-.33z" fill="#010101" style={{transform: 'translate(-0.5px, 0.5px)'}}/>
        </svg>
      )
    case 'youtube':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
          <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFF"/>
        </svg>
      )
    case 'blog':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      )
    default:
      return <span className="text-lg">📱</span>
  }
}

const styles = [
  { id: 'professional', name: '專業正式', icon: '🏢', color: 'from-blue-500 to-cyan-500' },
  { id: 'casual', name: '輕鬆休閒', icon: '☕', color: 'from-amber-500 to-orange-500' },
  { id: 'creative', name: '創意吸睛', icon: '🎨', color: 'from-purple-500 to-pink-500' },
  { id: 'humorous', name: '幽默風趣', icon: '😄', color: 'from-green-500 to-emerald-500' },
  { id: 'persuasive', name: '說服力強', icon: '🎯', color: 'from-red-500 to-rose-500' },
  { id: 'luxury', name: '奢華高端', icon: '💎', color: 'from-yellow-500 to-amber-500' },
  { id: 'emotional', name: '情感共鳴', icon: '❤️', color: 'from-pink-500 to-rose-500' },
  { id: 'urgent', name: '緊迫感', icon: '⚡', color: 'from-orange-500 to-red-500' },
  { id: 'storytelling', name: '故事敘述', icon: '📖', color: 'from-indigo-500 to-blue-500' },
  { id: 'trendy', name: '潮流網紅', icon: '🔥', color: 'from-fuchsia-500 to-pink-500' },
]

const lengths = [
  { id: 'short', name: '簡短', desc: '50-100 字' },
  { id: 'medium', name: '中等', desc: '150-250 字' },
  { id: 'long', name: '詳細', desc: '300-500 字' },
]

export default function PublishPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const { t, locale } = useLanguage()

  const [prompt, setPrompt] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'facebook'])
  const [selectedStyle, setSelectedStyle] = useState('creative')
  const [selectedLength, setSelectedLength] = useState('medium')
  const [contents, setContents] = useState<PlatformContent[]>([])
  const [generating, setGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const generateForPlatform = useCallback(async (platform: string, index: number) => {
    try {
      setContents(prev => prev.map((c, i) =>
        i === index ? { ...c, status: 'generating' } : c
      ))
      const data = await apiPost('/api/product/generate-content', {
        product_name: prompt,
        product_description: prompt,
        platform,
        style: selectedStyle,
        length: selectedLength,
      })
      setContents(prev => prev.map((c, i) =>
        i === index ? { ...c, ...data, status: 'done' } : c
      ))
      return data
    } catch (error: any) {
      setContents(prev => prev.map((c, i) =>
        i === index ? { ...c, status: 'error' } : c
      ))
      throw error
    }
  }, [prompt, selectedStyle, selectedLength])

  const generateAll = async () => {
    if (!prompt.trim()) { toast('請輸入產品或主題描述', 'error'); return }
    if (selectedPlatforms.length === 0) { toast('請至少選擇一個平台', 'error'); return }
    if (!user?.has_api_key) { toast('請先在設定中新增 API Key', 'error'); return }

    setGenerating(true)
    setContents(selectedPlatforms.map(platform => ({
      platform, title: '', content: '', hashtags: [], status: 'generating',
    })))

    const results = await Promise.allSettled(
      selectedPlatforms.map((platform, index) => generateForPlatform(platform, index))
    )
    const successCount = results.filter(r => r.status === 'fulfilled').length
    if (successCount > 0) toast(`已為 ${successCount} 個平台生成內容`, 'success')
    setGenerating(false)
  }

  const regenerateSingle = async (platform: string) => {
    const index = contents.findIndex(c => c.platform === platform)
    if (index === -1) return
    try {
      await generateForPlatform(platform, index)
      toast(`已重新生成`, 'success')
    } catch { toast('重新生成失敗', 'error') }
  }

  const formatContent = (c: PlatformContent) => {
    const p = platforms.find(pl => pl.id === c.platform)
    return `[${p?.name || c.platform}]\n\n${c.title}\n\n${c.content}\n\n${c.hashtags.map(t => '#' + t).join(' ')}`
  }

  const copyContent = (index: number) => {
    navigator.clipboard.writeText(formatContent(contents[index]))
    setCopiedIndex(index)
    toast('已複製到剪貼簿', 'success')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAll = () => {
    const all = contents.filter(c => c.status === 'done').map(formatContent).join('\n\n---\n\n')
    navigator.clipboard.writeText(all)
    toast('已複製全部內容', 'success')
  }

  const downloadAs = (ext: string) => {
    const all = contents.filter(c => c.status === 'done').map(formatContent).join('\n\n---\n\n')
    const mime = ext === 'json' ? 'application/json' : 'text/plain'
    const data = ext === 'json'
      ? JSON.stringify(contents.filter(c => c.status === 'done').map(c => ({
          platform: c.platform, title: c.title, content: c.content, hashtags: c.hashtags,
          generated_at: new Date().toISOString(),
        })), null, 2)
      : all
    const blob = new Blob([data], { type: `${mime};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `content-${Date.now()}.${ext}`; a.click()
    URL.revokeObjectURL(url)
    toast(`已下載 ${ext.toUpperCase()} 檔案`, 'success')
  }

  const doneCount = contents.filter(c => c.status === 'done').length
  const totalCount = contents.length
  const allDone = totalCount > 0 && contents.every(c => c.status === 'done' || c.status === 'error')

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8"><Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-64 w-full" /></div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            {t('publish.title')}
          </h1>
          <p className="text-gray-400 text-lg">{t('publish.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-5">
            {/* Input */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">✏️</span>
                {t('publish.input')}
              </h2>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
                placeholder={t('publish.input.placeholder')}
              />
            </div>

            {/* Style */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm">✨</span>
                {t('publish.style')}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {styles.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`relative flex items-center gap-2 p-3 rounded-xl text-sm transition-all duration-200 ${
                      selectedStyle === s.id
                        ? `bg-gradient-to-r ${s.color} text-white shadow-lg scale-105`
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:scale-[1.02]'
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="font-medium">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm">📏</span>
                {t('publish.length')}
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {lengths.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLength(l.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl text-sm transition-all duration-200 ${
                      selectedLength === l.id
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold">{l.name}</span>
                    <span className="text-xs opacity-70">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-sm">🌐</span>
                {t('publish.platforms')}
                <span className="ml-auto text-xs font-normal text-gray-400 bg-white/10 px-2 py-1 rounded-full">{selectedPlatforms.length} {t('publish.selected')}</span>
              </h2>
              <div className="space-y-2">
                {platforms.map(platform => {
                  const active = selectedPlatforms.includes(platform.id)
                  return (
                    <label
                      key={platform.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        active
                          ? 'border-2 shadow-lg scale-[1.02]'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:scale-[1.01]'
                      }`}
                      style={active ? {
                        background: platform.brandGradient,
                        borderColor: platform.brandColor,
                        boxShadow: `0 4px 20px ${platform.brandColor}40`,
                      } : {}}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => togglePlatform(platform.id)}
                        className="w-4 h-4 rounded border-gray-300 accent-white"
                      />
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20">
                        <PlatformIcon platformId={platform.id} size={22} />
                      </div>
                      <span className="text-white font-bold">{platform.name}</span>
                      {active && (
                        <svg className="w-5 h-5 text-white ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateAll}
              disabled={generating}
              className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-300 disabled:opacity-50 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </span>
              ) : (
                `🚀 ${t('publish.generate', { n: selectedPlatforms.length })}`
              )}
            </button>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {contents.length > 0 && (
              <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-white">{t('publish.results')}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">
                      {allDone ? (
                        <span className="text-green-400 font-bold">✅ {t('publish.allDone')}</span>
                      ) : (
                        <span className="text-gray-400">{doneCount}/{totalCount} {t('publish.completed')}</span>
                      )}
                    </span>
                    {contents.some(c => c.status === 'done') && (
                      <div className="flex gap-2">
                        <button onClick={copyAll} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition">📋 {t('publish.copyAll')}</button>
                        <button onClick={() => downloadAs('txt')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition">📄 TXT</button>
                        <button onClick={() => downloadAs('json')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition">📦 JSON</button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400"
                    style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
                  />
                </div>
                {/* Platform Status Dots */}
                <div className="flex gap-3 mt-3">
                  {contents.map(c => {
                    const p = platforms.find(pl => pl.id === c.platform)
                    return (
                      <div key={c.platform} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: c.status === 'done' ? '#22c55e' : c.status === 'generating' ? '#eab308' : c.status === 'error' ? '#ef4444' : '#6b7280',
                            boxShadow: c.status === 'done' ? '0 0 8px #22c55e' : c.status === 'generating' ? '0 0 8px #eab308' : 'none',
                          }}
                        />
                        <PlatformIcon platformId={c.platform} size={14} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Content Cards */}
            {contents.length > 0 && (
              <div className="space-y-5">
                {contents.map((content, index) => {
                  const platform = platforms.find(p => p.id === content.platform)
                  return (
                    <div
                      key={content.platform}
                      className="rounded-2xl border-2 transition-all duration-500 overflow-hidden"
                      style={{
                        borderColor: content.status === 'done' ? platform?.brandColor + '80' : 'rgba(255,255,255,0.1)',
                        boxShadow: content.status === 'done' ? `0 8px 32px ${platform?.brandColor}20` : 'none',
                      }}
                    >
                      {/* Card Header */}
                      <div
                        className="px-5 py-4 flex items-center justify-between"
                        style={{ background: platform?.brandGradient || 'rgba(255,255,255,0.05)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                            <PlatformIcon platformId={content.platform} size={26} />
                          </div>
                          <div>
                            <span className="text-white font-black text-lg">{platform?.name}</span>
                            {content.status === 'done' && (
                              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/80">已完成</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {content.status === 'done' && (
                            <>
                              <button
                                onClick={() => copyContent(index)}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-xl transition-all duration-200 backdrop-blur"
                              >
                                {copiedIndex === index ? `✓ ${t('publish.copied')}` : `📋 ${t('publish.copy')}`}
                              </button>
                              <button
                                onClick={() => regenerateSingle(content.platform)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 text-sm font-bold rounded-xl transition-all duration-200"
                              >
                                🔄 {t('publish.regenerate')}
                              </button>
                            </>
                          )}
                          {content.status === 'generating' && (
                            <div className="flex items-center gap-2 text-white/80">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm font-medium">生成中...</span>
                            </div>
                          )}
                          {content.status === 'error' && (
                            <button
                              onClick={() => regenerateSingle(content.platform)}
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-bold rounded-xl transition"
                            >
                              ⚠️ {t('publish.retry')}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="bg-[#1a1a2e] p-5">
                        {content.status === 'generating' && (
                          <div className="space-y-3">
                            <div className="h-5 bg-white/5 rounded-lg animate-pulse w-1/3" />
                            <div className="h-4 bg-white/5 rounded-lg animate-pulse w-full" />
                            <div className="h-4 bg-white/5 rounded-lg animate-pulse w-5/6" />
                            <div className="h-4 bg-white/5 rounded-lg animate-pulse w-2/3" />
                          </div>
                        )}

                        {content.status === 'error' && (
                          <p className="text-red-400 text-center py-4">{locale === 'zh-TW' ? '生成失敗，請稍後再試或點擊「重試」' : 'Generation failed. Try again or click Retry'}</p>
                        )}

                        {content.status === 'done' && (
                          <PlatformPreview
                            platform={platform!}
                            title={content.title}
                            content={content.content}
                            hashtags={content.hashtags}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty State */}
            {contents.length === 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-16 border border-white/10 text-center shadow-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-xl font-bold mb-2">{t('publish.empty')}</p>
                <p className="text-gray-500">{t('publish.empty.sub')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function PlatformPreview({ platform, title, content, hashtags }: { platform: PlatformDef; title: string; content: string; hashtags: string[] }) {
  if (platform.id === 'twitter') {
    return (
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white">
        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-black">
              <PlatformIcon platformId="twitter" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-black font-bold text-sm">你的品牌</span>
                <span className="text-gray-500 text-sm">@brand · 1m</span>
              </div>
              <p className="text-gray-900 text-sm whitespace-pre-wrap mt-1 leading-relaxed">{title ? `${title}\n\n${content}` : content}</p>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="text-sm text-blue-500">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-8 mt-3 text-gray-500 text-xs">
                <span>💬 12</span><span>🔁 45</span><span>❤️ 128</span><span>📊 1.2K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: platform.brandGradient }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur shadow">
          <PlatformIcon platformId={platform.id} size={22} />
        </div>
        <div>
          <p className="text-white font-bold text-sm">你的品牌</p>
          <p className="text-white/60 text-xs">sponsored</p>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        {title && <h3 className="text-gray-900 font-black text-base mb-2">{title}</h3>}
        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {hashtags.map((tag, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: platform.brandColorLight, color: platform.brandColor }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-6 text-gray-400 text-xs">
        {platform.id === 'instagram' && <><span>❤️ 讚</span><span>💬 留言</span><span>📤 分享</span></>}
        {platform.id === 'facebook' && <><span>👍 讚</span><span>💬 留言</span><span>📤 分享</span></>}
        {platform.id === 'linkedin' && <><span>👍 讚</span><span>💬 留言</span><span>🔄 轉發</span></>}
        {platform.id === 'tiktok' && <><span>❤️ 讚</span><span>💬 留言</span><span>🔖 收藏</span></>}
        {platform.id === 'youtube' && <><span>👍 讚</span><span>👎 不喜歡</span><span>💬 留言</span><span>📤 分享</span></>}
        {platform.id === 'blog' && <><span>👍 讚</span><span>💬 留言</span><span>🔖 收藏</span></>}
      </div>
    </div>
  )
}
