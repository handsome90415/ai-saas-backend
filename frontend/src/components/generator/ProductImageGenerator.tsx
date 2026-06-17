'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface ImageResult { image_url: string; revised_prompt: string }
interface Props { onResult: (result: ImageResult) => void }

export function ProductImageGenerator({ onResult }: Props) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const generate = async () => {
    setLoading(true)
    try { const data = await apiPost('/api/generate/product-image', { prompt, style, size: '1024x1024' }); onResult(data) }
    catch (error: any) { toast(error.message || 'Error', 'error') }
    setLoading(false)
  }

  const styleKeys = ['realistic','artistic','minimalist','vibrant','cinematic','watercolor','3d','pixel','anime','flat','vintage','cyberpunk','product-photo','food-photo'] as const

  return (
    <div className="space-y-4">
      <Textarea label={t('gen.prompt.product')} value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder={t('gen.placeholder.product')} />
      <Select label={t('gen.imageStyle')} value={style} onChange={e => setStyle(e.target.value)}>
        {styleKeys.map(k => <option key={k} value={k} className="text-gray-900">{t(`style.${k}` as any)}</option>)}
      </Select>
      <Button onClick={generate} disabled={!prompt} loading={loading} className="w-full py-4">{t('gen.product')}</Button>
    </div>
  )
}
