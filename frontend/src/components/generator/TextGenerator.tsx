'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface TextResult {
  title: string
  content: string
  hashtags: string[]
}

interface Props {
  onResult: (result: TextResult) => void
}

export function TextGenerator({ onResult }: Props) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('professional')
  const [platform, setPlatform] = useState('instagram')
  const [length, setLength] = useState('medium')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const generate = async () => {
    setLoading(true)
    try {
      const data = await apiPost('/api/generate/text', {
        prompt,
        style,
        platform,
        length,
        provider: provider || undefined,
      })
      onResult(data)
    } catch (error: any) {
      toast(error.message || '生成失敗，請稍後再試', 'error')
    }
    setLoading(false)
  }

  const availableProviders = [
    user?.has_api_key && { id: 'openai', name: 'OpenAI' },
    user?.has_gemini_key && { id: 'gemini', name: 'Gemini' },
    user?.has_claude_key && { id: 'claude', name: 'Claude' },
  ].filter(Boolean) as { id: string; name: string }[]

  return (
    <div className="space-y-4">
      <Textarea
        label="想要生成什麼內容？"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={4}
        placeholder="例如：推銷一款新的咖啡機，強調它能快速沖泡高品質咖啡..."
      />

      <Select label="語氣風格" value={style} onChange={e => setStyle(e.target.value)}>
        <option value="professional" className="text-gray-900">🏢 專業正式</option>
        <option value="casual" className="text-gray-900">☕ 輕鬆友善</option>
        <option value="creative" className="text-gray-900">🎨 創意吸睛</option>
        <option value="humorous" className="text-gray-900">😄 幽默風趣</option>
        <option value="educational" className="text-gray-900">📚 教學知識</option>
        <option value="persuasive" className="text-gray-900">🎯 說服力強</option>
        <option value="luxury" className="text-gray-900">💎 奢華高端</option>
        <option value="emotional" className="text-gray-900">❤️ 情感共鳴</option>
        <option value="urgent" className="text-gray-900">⚡ 緊迫感</option>
        <option value="storytelling" className="text-gray-900">📖 故事敘述</option>
        <option value="minimalist" className="text-gray-900">✨ 簡約優雅</option>
        <option value="trendy" className="text-gray-900">🔥 潮流網紅</option>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Select label="目標平台" value={platform} onChange={e => setPlatform(e.target.value)}>
          <option value="instagram" className="text-gray-900">Instagram</option>
          <option value="facebook" className="text-gray-900">Facebook</option>
          <option value="twitter" className="text-gray-900">Twitter/X</option>
          <option value="linkedin" className="text-gray-900">LinkedIn</option>
          <option value="blog" className="text-gray-900">部落格</option>
          <option value="tiktok" className="text-gray-900">TikTok</option>
          <option value="youtube" className="text-gray-900">YouTube</option>
          <option value="general" className="text-gray-900">通用</option>
        </Select>

        <Select label="內容長度" value={length} onChange={e => setLength(e.target.value)}>
          <option value="short" className="text-gray-900">簡短 (50-100字)</option>
          <option value="medium" className="text-gray-900">中等 (150-250字)</option>
          <option value="long" className="text-gray-900">詳細 (300-500字)</option>
        </Select>
      </div>

      {availableProviders.length > 1 && (
        <Select label="AI 供應商" value={provider} onChange={e => setProvider(e.target.value)}>
          <option value="" className="text-gray-900">使用預設</option>
          {availableProviders.map(p => (
            <option key={p.id} value={p.id} className="text-gray-900">{p.name}</option>
          ))}
        </Select>
      )}

      <Button
        onClick={generate}
        disabled={!prompt}
        loading={loading}
        className="w-full py-4"
      >
        生成文案
      </Button>
    </div>
  )
}
