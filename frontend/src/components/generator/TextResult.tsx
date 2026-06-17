'use client'

import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'

interface Props {
  title: string
  content: string
  hashtags: string[]
}

export function TextResult({ title, content, hashtags }: Props) {
  const { toast } = useToast()

  const copyAll = () => {
    const text = `${title}\n\n${content}\n\n${hashtags.map(t => '#' + t).join(' ')}`
    navigator.clipboard.writeText(text)
    toast('已複製到剪貼簿', 'success')
  }

  const exportTxt = () => {
    const text = `${title}\n\n${content}\n\n${hashtags.map(t => '#' + t).join(' ')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'content'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast('已匯出 TXT 檔案', 'success')
  }

  const exportJson = () => {
    const data = { title, content, hashtags }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'content'}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('已匯出 JSON 檔案', 'success')
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="text-purple-400 font-medium">標題：</span>
        <p className="text-white text-lg">{title}</p>
      </div>
      <div>
        <span className="text-purple-400 font-medium">內容：</span>
        <p className="text-white whitespace-pre-wrap">{content}</p>
      </div>
      <div>
        <span className="text-purple-400 font-medium">Hashtags：</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {hashtags?.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-purple-600/50 text-white rounded-full text-sm">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={copyAll}>
          複製全部
        </Button>
        <Button variant="secondary" onClick={exportTxt}>
          匯出 TXT
        </Button>
        <Button variant="secondary" onClick={exportJson}>
          匯出 JSON
        </Button>
      </div>
    </div>
  )
}
