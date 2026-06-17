'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
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

const styleKeys = ['professional','casual','creative','humorous','educational','persuasive','luxury','emotional','urgent','storytelling','minimalist','trendy'] as const
const platformKeys = ['instagram','facebook','twitter','linkedin','blog','tiktok','youtube','general'] as const
const lengthKeys = ['short','medium','long'] as const
const sizeLabels = { short: '50-100', medium: '150-250', long: '300-500' }

export function TextGenerator({ onResult }: Props) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('professional')
  const [platform, setPlatform] = useState('instagram')
  const [length, setLength] = useState('medium')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { t } = useLanguage()

  const generate = async () => {
    setLoading(true)
    try {
      const data = await apiPost('/api/generate/text', {
        prompt, style, platform, length,
        provider: provider || undefined,
      })
      onResult(data)
    } catch (error: any) {
      toast(error.message || 'Error', 'error')
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
        label={t('gen.prompt.text')}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={4}
        placeholder={t('gen.placeholder.text')}
      />

      <Select label={t('gen.style')} value={style} onChange={e => setStyle(e.target.value)}>
        {styleKeys.map(k => (
          <option key={k} value={k} className="text-gray-900">{t(`style.${k}` as any)}</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Select label={t('gen.platform')} value={platform} onChange={e => setPlatform(e.target.value)}>
          {platformKeys.map(k => (
            <option key={k} value={k} className="text-gray-900">{t(`platform.${k}` as any)}</option>
          ))}
        </Select>

        <Select label={t('gen.length')} value={length} onChange={e => setLength(e.target.value)}>
          {lengthKeys.map(k => (
            <option key={k} value={k} className="text-gray-900">{t(`length.${k}` as any)} ({sizeLabels[k]} 字)</option>
          ))}
        </Select>
      </div>

      {availableProviders.length > 1 && (
        <Select label={t('gen.provider')} value={provider} onChange={e => setProvider(e.target.value)}>
          <option value="" className="text-gray-900">{t('gen.provider.default')}</option>
          {availableProviders.map(p => (
            <option key={p.id} value={p.id} className="text-gray-900">{p.name}</option>
          ))}
        </Select>
      )}

      <Button onClick={generate} disabled={!prompt} loading={loading} className="w-full py-4">
        {t('gen.text')}
      </Button>
    </div>
  )
}
