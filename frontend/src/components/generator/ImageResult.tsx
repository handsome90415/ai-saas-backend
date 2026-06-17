'use client'

import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'

interface Props {
  image_url: string
  revised_prompt?: string
}

export function ImageResult({ image_url, revised_prompt }: Props) {
  const { toast } = useToast()

  const downloadImage = async () => {
    try {
      const response = await fetch(image_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-image-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast('已下載圖片', 'success')
    } catch {
      toast('下載失敗', 'error')
    }
  }

  return (
    <div>
      <img src={image_url} alt="Generated" className="w-full rounded-lg" />
      {revised_prompt && (
        <p className="text-gray-400 text-sm mt-2">
          AI 優化後的提示詞: {revised_prompt}
        </p>
      )}
      <div className="mt-4">
        <Button variant="secondary" onClick={downloadImage}>
          下載圖片
        </Button>
      </div>
    </div>
  )
}
