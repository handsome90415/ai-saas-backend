'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiGet, apiDelete } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
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

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const limit = 10

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
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
    } catch (error: any) {
      toast(error.message || '載入失敗', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated) fetchHistory()
  }, [page, filter, search, isAuthenticated])

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此記錄嗎？')) return
    try {
      await apiDelete(`/api/history/${id}`)
      toast('已刪除', 'success')
      fetchHistory()
    } catch (error: any) {
      toast(error.message || '刪除失敗', 'error')
    }
  }

  const typeLabels: Record<string, string> = {
    text: '文案生成',
    image: '圖片生成',
    product_image: '產品圖片',
  }

  const totalPages = Math.ceil(total / limit)

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">歷史記錄</h1>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋提示詞..."
            className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="flex gap-2 mb-6">
          {['', 'text', 'image', 'product_image'].map(type => (
            <button
              key={type}
              onClick={() => { setFilter(type); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {type ? typeLabels[type] : '全部'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">尚無歷史記錄</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generations.map(gen => (
              <div
                key={gen.id}
                className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 flex items-center gap-4"
              >
                <span className="px-3 py-1 bg-purple-600/50 text-white rounded-full text-xs whitespace-nowrap">
                  {typeLabels[gen.type] || gen.type}
                </span>
                <p className="text-white flex-1 truncate">{gen.prompt}</p>
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  {gen.created_at ? new Date(gen.created_at).toLocaleDateString('zh-TW') : ''}
                </span>
                <button
                  onClick={() => handleDelete(gen.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-30"
            >
              上一頁
            </button>
            <span className="px-3 py-1 text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-30"
            >
              下一頁
            </button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
