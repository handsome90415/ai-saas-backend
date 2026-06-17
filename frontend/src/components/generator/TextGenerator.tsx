'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
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
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generate = async () => {
    setLoading(true)
    try {
      const data = await apiPost('/api/generate/text', {
        prompt,
        style,
        platform,
        length: 'medium',
      })
      onResult(data)
    } catch (error: any) {
      toast(error.message || '生成失敗，請稍後再試', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Textarea
        label="想要生成什麼內容？"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={4}
        placeholder="例如：推銷一款新的咖啡機，強調它能快速沖泡高品質咖啡..."
      />

      <div className="grid grid-cols-2 gap-4">
        <Select label="語氣風格" value={style} onChange={e => setStyle(e.target.value)}>
          <option value="professional" className="text-gray-900">專業正式</option>
          <option value="casual" className="text-gray-900">輕鬆友善</option>
          <option value="creative" className="text-gray-900">創意吸睛</option>
          <option value="educational" className="text-gray-900">教學知識</option>
        </Select>

        <Select label="目標平台" value={platform} onChange={e => setPlatform(e.target.value)}>
          <option value="instagram" className="text-gray-900">Instagram</option>
          <option value="facebook" className="text-gray-900">Facebook</option>
          <option value="twitter" className="text-gray-900">Twitter/X</option>
          <option value="linkedin" className="text-gray-900">LinkedIn</option>
          <option value="blog" className="text-gray-900">部落格</option>
        </Select>
      </div>

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
