'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiGet, apiDelete } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Skeleton } from '@/components/ui/Skeleton'

interface Generation {
  id: string
  type: string
  prompt: string
  result: any
  created_at: string | null
}

const allTypes = ['', 'text', 'image', 'product_image', 'product_content', 'product_analysis']

function formatAsText(gen: Generation): string {
  const r = gen.result
  if (!r) return gen.prompt
  if (gen.type === 'text' || gen.type === 'product_content') {
    const parts: string[] = []
    if (r.title) parts.push(r.title)
    if (r.content) parts.push(r.content)
    if (r.hashtags?.length) parts.push(r.hashtags.map((t: string) => '#' + t).join(' '))
    if (r.cta) parts.push(r.cta)
    return parts.join('\n\n')
  }
  if (gen.type === 'image' || gen.type === 'product_image') {
    return r.revised_prompt || r.image_url || gen.prompt
  }
  if (gen.type === 'product_analysis') return JSON.stringify(r, null, 2)
  return gen.prompt
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t, locale } = useLanguage()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const limit = 10

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (filter) params.set('type', filter)
      if (search) params.set('search', search)
      const data = await apiGet<{ generations: Generation[]; total: number }>(`/api/history?${params}`)
      setGenerations(data.generations)
      setTotal(data.total)
    } catch (error: any) { toast(error.message || 'Error', 'error') }
    setLoading(false)
  }

  useEffect(() => { if (isAuthenticated) fetchHistory() }, [page, filter, search, isAuthenticated])

  const handleDelete = async (id: string) => {
    if (!confirm(t('misc.confirm_delete'))) return
    try { await apiDelete(`/api/history/${id}`); toast(locale === 'zh-TW' ? '已刪除' : 'Deleted', 'success'); fetchHistory() }
    catch (error: any) { toast(error.message || 'Error', 'error') }
  }

  const copyContent = useCallback((gen: Generation) => {
    navigator.clipboard.writeText(formatAsText(gen))
    setCopiedId(gen.id)
    toast(locale === 'zh-TW' ? '已複製到剪貼簿' : 'Copied to clipboard', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }, [toast, locale])

  const exportAsTxt = useCallback((gen: Generation) => {
    const blob = new Blob([formatAsText(gen)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${gen.type}-${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
    toast(locale === 'zh-TW' ? '已下載 TXT 檔案' : 'TXT downloaded', 'success')
  }, [toast, locale])

  const typeLabel = (type: string) => t(`history.${type}` as any) || type
  const totalPages = Math.ceil(total / limit)

  if (authLoading) return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8"><Skeleton className="h-8 w-48 mb-6" /><div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div></div>
      <Footer />
    </main>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">{t('history.title')}</h1>
        <div className="mb-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('history.search')}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400" />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {allTypes.map(type => (
            <button key={type} onClick={() => { setFilter(type); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm transition ${filter === type ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {type ? typeLabel(type) : t('history.all')}
            </button>
          ))}
        </div>

        {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        : generations.length === 0 ? <div className="text-center text-gray-400 py-12"><p className="text-lg">{t('history.empty')}</p></div>
        : (
          <div className="space-y-3">
            {generations.map(gen => (
              <div key={gen.id} className="bg-white/5 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition" onClick={() => setExpandedId(expandedId === gen.id ? null : gen.id)}>
                  <span className="px-3 py-1 bg-purple-600/50 text-white rounded-full text-xs whitespace-nowrap">{typeLabel(gen.type)}</span>
                  <p className="text-white flex-1 truncate">{gen.prompt}</p>
                  <span className="text-gray-400 text-sm whitespace-nowrap">{gen.created_at ? new Date(gen.created_at).toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US') : ''}</span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === gen.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                {expandedId === gen.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-white/5">
                    <p className="text-xs text-gray-500 mb-2">{t('history.prompt')}：{gen.prompt}</p>
                    <div className="space-y-3">
                      {gen.type === 'text' || gen.type === 'product_content' ? (
                        <>
                          {gen.result?.title && <h4 className="text-lg font-bold text-purple-300">{gen.result.title}</h4>}
                          {gen.result?.content && <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{gen.result.content}</p>}
                          {gen.result?.hashtags?.length > 0 && <div className="flex flex-wrap gap-2">{gen.result.hashtags.map((tag: string, i: number) => <span key={i} className="text-sm text-purple-400">#{tag}</span>)}</div>}
                          {gen.result?.cta && <p className="text-sm text-blue-300 mt-2">CTA: {gen.result.cta}</p>}
                        </>
                      ) : gen.type === 'image' || gen.type === 'product_image' ? (
                        <>
                          {gen.result?.image_url && <img src={gen.result.image_url} alt={gen.prompt} className="max-w-md rounded-lg" />}
                          {gen.result?.revised_prompt && <p className="text-sm text-gray-400">{gen.result.revised_prompt}</p>}
                        </>
                      ) : (
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap">{JSON.stringify(gen.result, null, 2)}</pre>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                      <button onClick={() => copyContent(gen)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition">
                        {copiedId === gen.id ? t('publish.copied') : t('history.copy')}
                      </button>
                      <button onClick={() => exportAsTxt(gen)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition">{t('history.export')}</button>
                      <button onClick={() => handleDelete(gen.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-lg transition ml-auto">{t('history.delete')}</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-30">←</button>
            <span className="px-3 py-1 text-gray-400">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-30">→</button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
