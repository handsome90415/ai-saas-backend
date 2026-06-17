'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface ImageResult {
  image_url: string
  revised_prompt: string
}

interface Props {
  onResult: (result: ImageResult) => void
}

export function ImageGenerator({ onResult }: Props) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generate = async () => {
    setLoading(true)
    try {
      const data = await apiPost('/api/generate/image', {
        prompt,
        style,
        size: '1024x1024',
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
        label="描述你想要的圖片"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={4}
        placeholder="例如：一杯精緻的拿鐵咖啡放在木桌上，周圍有咖啡豆和晨光..."
      />

      <Select label="圖片風格" value={style} onChange={e => setStyle(e.target.value)}>
        <option value="realistic" className="text-gray-900">寫實風格</option>
        <option value="artistic" className="text-gray-900">藝術風格</option>
        <option value="minimalist" className="text-gray-900">簡約風格</option>
        <option value="vibrant" className="text-gray-900">鮮豔風格</option>
      </Select>

      <Button
        onClick={generate}
        disabled={!prompt}
        loading={loading}
        className="w-full py-4"
      >
        生成圖片
      </Button>
    </div>
  )
}
