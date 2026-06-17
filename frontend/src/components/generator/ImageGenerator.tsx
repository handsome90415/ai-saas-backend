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
  const [size, setSize] = useState('1024x1024')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generate = async () => {
    setLoading(true)
    try {
      const data = await apiPost('/api/generate/image', {
        prompt,
        style,
        size,
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
        <option value="realistic" className="text-gray-900">📷 寫實風格</option>
        <option value="artistic" className="text-gray-900">🎨 藝術風格</option>
        <option value="minimalist" className="text-gray-900">⬜ 簡約風格</option>
        <option value="vibrant" className="text-gray-900">🌈 鮮豔風格</option>
        <option value="cinematic" className="text-gray-900">🎬 電影質感</option>
        <option value="watercolor" className="text-gray-900">🖌️ 水彩風格</option>
        <option value="3d-render" className="text-gray-900">🧊 3D 渲染</option>
        <option value="pixel-art" className="text-gray-900">👾 像素風格</option>
        <option value="anime" className="text-gray-900">🌸 動漫風格</option>
        <option value="flat-design" className="text-gray-900">📐 扁平設計</option>
        <option value="vintage" className="text-gray-900">🎞️ 復古風格</option>
        <option value="cyberpunk" className="text-gray-900">🌃 賽博龐克</option>
        <option value="product-photo" className="text-gray-900">📦 產品攝影</option>
        <option value="food-photo" className="text-gray-900">🍕 美食攝影</option>
      </Select>

      <Select label="圖片尺寸" value={size} onChange={e => setSize(e.target.value)}>
        <option value="1024x1024" className="text-gray-900">1:1 正方形 (1024×1024)</option>
        <option value="1792x1024" className="text-gray-900">16:9 橫版 (1792×1024)</option>
        <option value="1024x1792" className="text-gray-900">9:16 直版 (1024×1792)</option>
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
