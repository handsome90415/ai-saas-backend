'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
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
  brandColorLight: string
  style: 'card' | 'minimal'
}

const platforms: PlatformDef[] = [
  { id: 'instagram', name: 'Instagram', brandColor: '#E4405F', brandColorLight: 'rgba(228,64,95,0.15)', style: 'card' },
  { id: 'facebook', name: 'Facebook', brandColor: '#1877F2', brandColorLight: 'rgba(24,119,242,0.15)', style: 'card' },
  { id: 'twitter', name: 'Twitter/X', brandColor: '#000000', brandColorLight: 'rgba(0,0,0,0.15)', style: 'minimal' },
  { id: 'linkedin', name: 'LinkedIn', brandColor: '#0A66C2', brandColorLight: 'rgba(10,102,194,0.15)', style: 'card' },
  { id: 'tiktok', name: 'TikTok', brandColor: '#010101', brandColorLight: 'rgba(255,255,255,0.08)', style: 'card' },
  { id: 'youtube', name: 'YouTube', brandColor: '#FF0000', brandColorLight: 'rgba(255,0,0,0.15)', style: 'card' },
  { id: 'blog', name: '部落格', brandColor: '#F59E0B', brandColorLight: 'rgba(245,158,11,0.15)', style: 'card' },
]

function PlatformIcon({ platformId, size = 24 }: { platformId: string; size?: number }) {
  const s = size
  switch (platformId) {
    case 'instagram':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-gradient)" strokeWidth="2"/>
          <circle cx="12" cy="12" r="5" stroke="url(#ig-gradient)" strokeWidth="2"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-gradient)"/>
          <defs>
            <linearGradient id="ig-gradient" x1="2" y1="22" x2="22" y2="2">
              <stop offset="0%" stopColor="#FEDA75"/>
              <stop offset="25%" stopColor="#FA7E1E"/>
              <stop offset="50%" stopColor="#D62976"/>
              <stop offset="75%" stopColor="#962FBF"/>
              <stop offset="100%" stopColor="#4F5BD5"/>
            </linearGradient>
          </defs>
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
        <svg width={s} height={s} viewBox="0 0 24 24" fill="#000000">
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
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.96a8.21 8.21 0 004.76 1.51V7.02a4.83 4.83 0 01-1-.33z" fill="#000000"/>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.96a8.21 8.21 0 004.76 1.51V7.02a4.83 4.83 0 01-1-.33z" fill="#00F2EA" style={{transform: 'translate(-0.5px, -0.5px)'}}/>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.96a8.21 8.21 0 004.76 1.51V7.02a4.83 4.83 0 01-1-.33z" fill="#FE2C55" style={{transform: 'translate(0.5px, 0.5px)'}}/>
        </svg>
      )
    case 'youtube':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
          <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF"/>
        </svg>
      )
    case 'blog':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      )
    default:
      return <span className="text-lg">📱</span>
  }
}

const styles = [
  { id: 'professional', name: '專業正式', icon: '🏢' },
  { id: 'casual', name: '輕鬆休閒', icon: '☕' },
  { id: 'creative', name: '創意吸睛', icon: '🎨' },
  { id: 'humorous', name: '幽默風趣', icon: '😄' },
]

const lengths = [
  { id: 'short', name: '簡短', desc: '50-100 字' },
  { id: 'medium', name: '中等', desc: '150-250 字' },
  { id: 'long', name: '詳細', desc: '300-500 字' },
]

export default function PublishPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

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
    if (!prompt.trim()) {
      toast('請輸入產品或主題描述', 'error')
      return
    }
    if (selectedPlatforms.length === 0) {
      toast('請至少選擇一個平台', 'error')
      return
    }
    if (!user?.has_api_key) {
      toast('請先在設定中新增 OpenAI API Key', 'error')
      return
    }

    setGenerating(true)
    const initialContents: PlatformContent[] = selectedPlatforms.map(platform => ({
      platform,
      title: '',
      content: '',
      hashtags: [],
      status: 'generating',
    }))
    setContents(initialContents)

    const results = await Promise.allSettled(
      selectedPlatforms.map((platform, index) =>
        generateForPlatform(platform, index)
      )
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    if (successCount > 0) {
      toast(`已為 ${successCount} 個平台生成內容`, 'success')
    }
    setGenerating(false)
  }

  const regenerateSingle = async (platform: string) => {
    const index = contents.findIndex(c => c.platform === platform)
    if (index === -1) return
    try {
      await generateForPlatform(platform, index)
      toast(`已重新生成 ${platforms.find(p => p.id === platform)?.name || platform} 的內容`, 'success')
    } catch {
      toast('重新生成失敗，請稍後再試', 'error')
    }
  }

  const formatContent = (c: PlatformContent) => {
    const platformDef = platforms.find(p => p.id === c.platform)
    const platformName = platformDef?.name || c.platform
    return `[${platformName}]\n\n${c.title}\n\n${c.content}\n\n${c.hashtags.map(t => '#' + t).join(' ')}`
  }

  const copyContent = (index: number) => {
    const content = contents[index]
    if (!content) return
    navigator.clipboard.writeText(formatContent(content))
    setCopiedIndex(index)
    toast('已複製到剪貼簿', 'success')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAll = () => {
    const allText = contents
      .filter(c => c.status === 'done')
      .map(formatContent)
      .join('\n\n---\n\n')
    navigator.clipboard.writeText(allText)
    toast('已複製全部內容', 'success')
  }

  const downloadAsTxt = () => {
    const allText = contents
      .filter(c => c.status === 'done')
      .map(formatContent)
      .join('\n\n---\n\n')
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `multi-platform-content-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast('已下載 TXT 檔案', 'success')
  }

  const downloadAsJson = () => {
    const data = contents
      .filter(c => c.status === 'done')
      .map(c => {
        const platformDef = platforms.find(p => p.id === c.platform)
        return {
          platform: c.platform,
          platform_name: platformDef?.name || c.platform,
          title: c.title,
          content: c.content,
          hashtags: c.hashtags,
          generated_at: new Date().toISOString(),
        }
      })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `multi-platform-content-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('已下載 JSON 檔案', 'success')
  }

  const doneCount = contents.filter(c => c.status === 'done').length
  const totalCount = contents.length
  const allDone = totalCount > 0 && contents.every(c => c.status === 'done' || c.status === 'error')

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">多平台發布</h1>
        <p className="text-gray-400 mb-8">一次生成多個平台的行銷內容，輕鬆管理社群行銷</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">產品/主題描述</h2>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
                placeholder="例如：一款新的智慧手錶，具有健康監測功能..."
              />
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">內容風格</h2>
              <div className="grid grid-cols-2 gap-2">
                {styles.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg text-sm transition ${
                      selectedStyle === s.id
                        ? 'bg-purple-600/40 border-2 border-purple-400 text-white'
                        : 'bg-white/5 border-2 border-transparent text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">內容長度</h2>
              <div className="grid grid-cols-3 gap-2">
                {lengths.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLength(l.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg text-sm transition ${
                      selectedLength === l.id
                        ? 'bg-purple-600/40 border-2 border-purple-400 text-white'
                        : 'bg-white/5 border-2 border-transparent text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-medium">{l.name}</span>
                    <span className="text-xs text-gray-400">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">選擇發布平台</h2>
              <div className="space-y-2">
                {platforms.map(platform => (
                  <label
                    key={platform.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-2'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                    style={selectedPlatforms.includes(platform.id) ? {
                      backgroundColor: platform.brandColorLight,
                      borderColor: platform.brandColor,
                    } : {}}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => togglePlatform(platform.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: platform.brandColorLight }}
                    >
                      <PlatformIcon platformId={platform.id} size={20} />
                    </div>
                    <span className="text-white">{platform.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={generateAll} loading={generating} className="w-full">
              {generating ? '生成中...' : `為 ${selectedPlatforms.length} 個平台生成內容`}
            </Button>
          </div>

          <div className="lg:col-span-2">
            {contents.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold text-white">生成結果</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {allDone ? (
                        <span className="text-green-400">全部完成</span>
                      ) : (
                        <span>{doneCount}/{totalCount} 已完成</span>
                      )}
                    </span>
                    {contents.some(c => c.status === 'done') && (
                      <div className="flex gap-2">
                        <Button onClick={copyAll} variant="secondary" className="text-sm">
                          複製全部
                        </Button>
                        <Button onClick={downloadAsTxt} variant="secondary" className="text-sm">
                          TXT
                        </Button>
                        <Button onClick={downloadAsJson} variant="secondary" className="text-sm">
                          JSON
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {contents.map(c => {
                    const p = platforms.find(pl => pl.id === c.platform)
                    return (
                      <div
                        key={c.platform}
                        className="flex items-center gap-1 text-xs"
                        title={p?.name}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: c.status === 'done' ? '#22c55e' :
                              c.status === 'generating' ? '#eab308' :
                              c.status === 'error' ? '#ef4444' : '#6b7280',
                          }}
                        />
                        <PlatformIcon platformId={c.platform} size={14} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {contents.length > 0 && (
              <div className="space-y-4">
                {contents.map((content, index) => {
                  const platform = platforms.find(p => p.id === content.platform)
                  return (
                    <div
                      key={content.platform}
                      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border-2 transition-all duration-300"
                      style={{ borderColor: platform?.brandColor || 'rgba(255,255,255,0.1)' }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: platform?.brandColorLight || 'rgba(255,255,255,0.1)' }}
                          >
                            <PlatformIcon platformId={content.platform} size={24} />
                          </div>
                          <span className="text-white font-bold">{platform?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {content.status === 'done' && (
                            <>
                              <Button
                                onClick={() => copyContent(index)}
                                variant="secondary"
                                className="text-sm"
                              >
                                {copiedIndex === index ? '已複製' : '複製'}
                              </Button>
                              <Button
                                onClick={() => regenerateSingle(content.platform)}
                                variant="ghost"
                                className="text-sm"
                              >
                                重新生成
                              </Button>
                            </>
                          )}
                          {content.status === 'generating' && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full" />
                              生成中...
                            </div>
                          )}
                          {content.status === 'error' && (
                            <Button
                              onClick={() => regenerateSingle(content.platform)}
                              variant="secondary"
                              className="text-sm text-red-400"
                            >
                              重試
                            </Button>
                          )}
                        </div>
                      </div>

                      {content.status === 'generating' && (
                        <div className="space-y-3">
                          <div className="h-4 bg-white/5 rounded animate-pulse w-1/3" />
                          <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
                          <div className="h-3 bg-white/5 rounded animate-pulse w-5/6" />
                          <div className="h-3 bg-white/5 rounded animate-pulse w-2/3" />
                        </div>
                      )}

                      {content.status === 'error' && (
                        <p className="text-red-400">生成失敗，請稍後再試或點擊「重試」</p>
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
                  )
                })}
              </div>
            )}

            {contents.length === 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <p className="text-gray-400 text-lg">輸入產品描述並選擇平台，即可一次生成多個平台的內容</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function PlatformPreview({
  platform,
  title,
  content,
  hashtags,
}: {
  platform: PlatformDef
  title: string
  content: string
  hashtags: string[]
}) {
  if (platform.id === 'twitter') {
    return <TwitterPreview platform={platform} title={title} content={content} hashtags={hashtags} />
  }

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: platform.brandColor + '40' }}
    >
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: platform.brandColorLight }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: platform.brandColor }}
        >
          <PlatformIcon platformId={platform.id} size={22} />
        </div>
        <div>
          <p className="text-white font-bold text-sm">你的品牌</p>
          <p className="text-gray-400 text-xs">sponsored</p>
        </div>
      </div>

      <div className="p-4 bg-white/5">
        {title && <h3 className="text-white font-bold text-base mb-2">{title}</h3>}
        <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: platform.brandColorLight,
                  color: platform.brandColor,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center gap-6 text-gray-400 text-xs">
        {platform.id === 'instagram' && (
          <>
            <span>❤️ 讚</span>
            <span>💬 留言</span>
            <span>📤 分享</span>
          </>
        )}
        {platform.id === 'facebook' && (
          <>
            <span>👍 讚</span>
            <span>💬 留言</span>
            <span>📤 分享</span>
          </>
        )}
        {platform.id === 'linkedin' && (
          <>
            <span>👍 讚</span>
            <span>💬 留言</span>
            <span>🔄 轉發</span>
          </>
        )}
        {platform.id === 'tiktok' && (
          <>
            <span>❤️ 讚</span>
            <span>💬 留言</span>
            <span>🔖 收藏</span>
          </>
        )}
        {platform.id === 'youtube' && (
          <>
            <span>👍 讚</span>
            <span>👎 不喜歡</span>
            <span>💬 留言</span>
            <span>📤 分享</span>
          </>
        )}
        {platform.id === 'blog' && (
          <>
            <span>👍 讚</span>
            <span>💬 留言</span>
            <span>🔖 收藏</span>
          </>
        )}
      </div>
    </div>
  )
}

function TwitterPreview({
  platform,
  title,
  content,
  hashtags,
}: {
  platform: PlatformDef
  title: string
  content: string
  hashtags: string[]
}) {
  const fullText = title ? `${title}\n\n${content}` : content
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: platform.brandColor + '40' }}>
      <div className="p-4 bg-white/5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-black">
            <PlatformIcon platformId="twitter" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-sm">你的品牌</span>
              <span className="text-gray-500 text-sm">@brand · 1m</span>
            </div>
            <p className="text-gray-200 text-sm whitespace-pre-wrap mt-1 leading-relaxed">{fullText}</p>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag, i) => (
                  <span key={i} className="text-xs" style={{ color: platform.brandColor }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-8 mt-3 text-gray-500 text-xs">
              <span>💬 {Math.floor(Math.random() * 50)}</span>
              <span>🔁 {Math.floor(Math.random() * 100)}</span>
              <span>❤️ {Math.floor(Math.random() * 300)}</span>
              <span>📊 {Math.floor(Math.random() * 1000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
