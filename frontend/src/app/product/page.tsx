'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { apiPost } from '@/lib/api'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Skeleton, SkeletonText, SkeletonImage } from '@/components/ui/Skeleton'

interface ProductAnalysis {
  name: string
  description: string
  features: string[]
  target_audience: string
  marketing_suggestions: string[]
}

interface ProductContent {
  title: string
  content: string
  hashtags: string[]
  cta: string
}

const platforms = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'facebook', label: 'Facebook', icon: '👤' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'blog', label: '部落格', icon: '📝' },
]

const styles = [
  { value: 'professional', label: '專業正式' },
  { value: 'casual', label: '輕鬆友善' },
  { value: 'creative', label: '創意吸睛' },
  { value: 'humorous', label: '幽默有趣' },
]

const steps = ['上傳', '分析', '生成', '預覽']

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getPlatformPreviewStyle(platform: string): { bg: string; textClass: string; maxLines: number } {
  switch (platform) {
    case 'instagram':
      return { bg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400', textClass: 'text-white', maxLines: 4 }
    case 'facebook':
      return { bg: 'bg-[#1877F2]', textClass: 'text-white', maxLines: 6 }
    case 'twitter':
      return { bg: 'bg-black', textClass: 'text-white', maxLines: 3 }
    case 'linkedin':
      return { bg: 'bg-[#0A66C2]', textClass: 'text-white', maxLines: 6 }
    case 'tiktok':
      return { bg: 'bg-black', textClass: 'text-white', maxLines: 4 }
    case 'youtube':
      return { bg: 'bg-[#FF0000]', textClass: 'text-white', maxLines: 4 }
    case 'blog':
      return { bg: 'bg-gray-800', textClass: 'text-gray-200', maxLines: 8 }
    default:
      return { bg: 'bg-gray-800', textClass: 'text-white', maxLines: 4 }
  }
}

function PlatformPreview({ content, platform }: { content: ProductContent; platform: string }) {
  const style = getPlatformPreviewStyle(platform)
  const platformInfo = platforms.find(p => p.value === platform)
  const truncatedContent = content.content.split('\n').slice(0, style.maxLines).join('\n')
  const charLimit = platform === 'twitter' ? 280 : 500

  return (
    <div className="bg-black/30 rounded-xl border border-white/10 p-4">
      <p className="text-gray-400 text-sm mb-3">📱 {platformInfo?.icon} {platformInfo?.label} 預覽</p>
      <div className={`${style.bg} rounded-xl overflow-hidden shadow-2xl`}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              {content.title.charAt(0)}
            </div>
            <div>
              <p className={`font-bold text-sm ${style.textClass}`}>Naratake</p>
              <p className="text-xs text-white/60">剛剛</p>
            </div>
          </div>
          <p className={`font-bold text-lg mb-2 ${style.textClass}`}>{content.title}</p>
          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${style.textClass} opacity-90`}>
            {truncatedContent}
            {content.content.split('\n').length > style.maxLines && '...'}
          </p>
          {content.hashtags.length > 0 && (
            <p className="text-blue-200 text-sm mt-2">
              {content.hashtags.slice(0, 5).map(t => `#${t}`).join(' ')}
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className={`text-sm font-medium ${style.textClass}`}>{content.cta}</p>
          </div>
        </div>
      </div>
      <p className="text-gray-500 text-xs mt-2 text-right">
        {content.content.length + content.title.length} / {charLimit} 字元
      </p>
    </div>
  )
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, i) => {
        const isActive = i === currentStep
        const isComplete = i < currentStep
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  isComplete
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 animate-pulse'
                    : 'bg-white/10 text-gray-500'
                }`}
              >
                {isComplete ? '✓' : i + 1}
              </div>
              <p className={`text-xs mt-2 font-medium ${isActive ? 'text-white' : isComplete ? 'text-green-400' : 'text-gray-500'}`}>
                {step}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-2 mb-6">
                <div className={`h-0.5 rounded-full transition-all duration-500 ${i < currentStep ? 'bg-green-500' : 'bg-white/10'}`} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ProductPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram'])
  const [style, setStyle] = useState('professional')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<ProductContent | null>(null)
  const [generatedContents, setGeneratedContents] = useState<Record<string, ProductContent>>({})
  const [activePreviewPlatform, setActivePreviewPlatform] = useState('instagram')

  const [copied, setCopied] = useState(false)

  const currentStep = analyzing ? 1 : analysis && !generatedContent ? 2 : generatedContent ? 3 : selectedFile ? 1 : 0

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('請上傳圖片檔案', 'error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('檔案大小不能超過 10MB', 'error')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setAnalysis(null)
    setGeneratedContent(null)
    setGeneratedContents({})
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast('請先選擇圖片', 'error')
      return
    }
    if (!user?.has_api_key) {
      toast('請先在設定中新增 OpenAI API Key', 'error')
      router.push('/settings')
      return
    }

    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const token = localStorage.getItem('token')
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_BASE}/api/product/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || '分析失敗')
      }

      const data = await res.json()
      setAnalysis(data)
      toast('產品分析完成', 'success')
    } catch (error: any) {
      toast(error.message || '分析失敗', 'error')
    }
    setAnalyzing(false)
  }

  const handleGenerateContent = async (targetPlatforms?: string[]) => {
    if (!analysis) {
      toast('請先分析產品圖片', 'error')
      return
    }
    if (!user?.has_api_key) {
      toast('請先在設定中新增 OpenAI API Key', 'error')
      router.push('/settings')
      return
    }

    const platformsToGenerate = targetPlatforms || selectedPlatforms
    if (platformsToGenerate.length === 0) {
      toast('請至少選擇一個平台', 'error')
      return
    }

    setGenerating(true)
    try {
      const results: Record<string, ProductContent> = {}
      for (const p of platformsToGenerate) {
        const data = await apiPost<ProductContent>('/api/product/generate-content', {
          product_name: analysis.name,
          product_description: analysis.description,
          platform: p,
          style,
        })
        results[p] = data
      }
      setGeneratedContents(results)
      setGeneratedContent(results[platformsToGenerate[0]])
      setActivePreviewPlatform(platformsToGenerate[0])
      toast(`已為 ${platformsToGenerate.length} 個平台生成內容`, 'success')
    } catch (error: any) {
      toast(error.message || '生成失敗', 'error')
    }
    setGenerating(false)
  }

  const handleRegenerate = async () => {
    await handleGenerateContent()
  }

  const handlePlatformToggle = (platformValue: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformValue)
        ? prev.filter(p => p !== platformValue)
        : [...prev, platformValue]
    )
  }

  const copyContent = (content?: ProductContent) => {
    const c = content || generatedContent
    if (!c) return
    const text = `${c.title}\n\n${c.content}\n\n${c.hashtags.map(t => '#' + t).join(' ')}\n\n${c.cta}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast('已複製到剪貼簿', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAll = () => {
    if (!generatedContent) return
    const text = `產品名稱: ${analysis?.name}\n\n${generatedContent.title}\n\n${generatedContent.content}\n\n${generatedContent.hashtags.map(t => '#' + t).join(' ')}\n\n${generatedContent.cta}`
    navigator.clipboard.writeText(text)
    toast('已複製全部內容', 'success')
  }

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
        <h1 className="text-2xl font-bold text-white mb-2">產品行銷助手</h1>
        <p className="text-gray-400 mb-6">上傳產品圖片，讓 AI 幫你分析並生成行銷內容</p>

        <StepIndicator currentStep={currentStep} />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4">1. 上傳產品圖片</h2>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-purple-400 bg-purple-500/20 scale-[1.02]'
                    : imagePreview
                    ? 'border-white/20 hover:border-purple-400/50'
                    : 'border-white/30 hover:border-purple-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {analyzing && imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Product" className="max-h-64 mx-auto rounded-lg opacity-50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <p className="text-white mt-4 font-medium">AI 分析中...</p>
                      <p className="text-gray-400 text-sm mt-1">正在辨識產品資訊</p>
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Product" className="max-h-64 mx-auto rounded-lg" />
                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <p className="text-white text-sm">點擊更換圖片</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className={`w-12 h-12 mx-auto mb-4 transition-transform ${isDragging ? 'scale-110 text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className={`text-lg font-medium ${isDragging ? 'text-purple-400' : ''}`}>
                      {isDragging ? '放開以上傳檔案' : '點擊或拖拽上傳產品圖片'}
                    </p>
                    <p className="text-sm mt-2">支援 JPG, PNG, WebP（最大 10MB）</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />

              {selectedFile && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 bg-purple-600/30 rounded-lg flex items-center justify-center text-sm">📄</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{selectedFile.name}</p>
                    <p className="text-gray-400 text-xs">
                      {formatFileSize(selectedFile.size)} · {selectedFile.type.split('/')[1]?.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setImagePreview(null)
                    }}
                    className="text-gray-400 hover:text-red-400 transition text-sm px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || analyzing}
                loading={analyzing}
                className="w-full mt-4"
              >
                {analyzing ? '分析中...' : '分析產品圖片'}
              </Button>
            </div>

            {analysis && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-bold text-white mb-4">2. AI 分析結果</h2>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">產品名稱</span>
                    <p className="text-white font-bold text-lg mt-1">{analysis.name}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">產品描述</span>
                    <p className="text-white mt-1 leading-relaxed">{analysis.description}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">產品特色</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysis.features.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-purple-600/50 to-blue-600/50 text-white rounded-full text-sm border border-purple-400/30">
                          ✦ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">目標受眾</span>
                    <p className="text-white mt-1">{analysis.target_audience}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">行銷建議</span>
                    <ul className="mt-2 space-y-2">
                      {analysis.marketing_suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-white">
                          <span className="text-purple-400 mt-0.5">→</span>
                          <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {analysis && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-bold text-white mb-4">3. 生成行銷內容</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-3">目標平台（可多選）</label>
                    <div className="grid grid-cols-2 gap-2">
                      {platforms.map(p => {
                        const isSelected = selectedPlatforms.includes(p.value)
                        return (
                          <label
                            key={p.value}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-600/30 border-purple-400 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePlatformToggle(p.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                              isSelected ? 'bg-purple-600 border-purple-600' : 'border-white/30'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span>{p.icon} {p.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <Select label="內容風格" value={style} onChange={e => setStyle(e.target.value)}>
                    {styles.map(s => (
                      <option key={s.value} value={s.value} className="text-gray-900">{s.label}</option>
                    ))}
                  </Select>
                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerateContent()} loading={generating} className="flex-1">
                      {generating ? '生成中...' : `生成 ${selectedPlatforms.length} 個平台`}
                    </Button>
                    {Object.keys(generatedContents).length > 0 && (
                      <Button onClick={handleRegenerate} loading={generating} variant="secondary">
                        🔄 重新生成
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {Object.keys(generatedContents).length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">4. 生成結果</h2>
                  <div className="flex gap-1">
                    {Object.keys(generatedContents).map(p => {
                      const info = platforms.find(pl => pl.value === p)
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setActivePreviewPlatform(p)
                            setGeneratedContent(generatedContents[p])
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm transition ${
                            activePreviewPlatform === p
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {info?.icon}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <PlatformPreview content={generatedContent!} platform={activePreviewPlatform} />

                <div className="mt-4 space-y-3">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">標題</span>
                    <p className="text-white text-lg font-bold mt-1">{generatedContent!.title}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">內容</span>
                    <p className="text-white whitespace-pre-wrap mt-1 leading-relaxed">{generatedContent!.content}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">Hashtags</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {generatedContent!.hashtags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gradient-to-r from-purple-600/50 to-blue-600/50 text-white rounded-full text-sm border border-purple-400/30">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <span className="text-purple-400 font-medium text-sm">行動呼籲</span>
                    <p className="text-white font-bold mt-1">{generatedContent!.cta}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => copyContent()} variant="secondary" className="flex-1">
                    {copied ? '✓ 已複製' : '📋 複製內容'}
                  </Button>
                  <Button onClick={copyAll} variant="secondary" className="flex-1">
                    📋 複製全部
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
