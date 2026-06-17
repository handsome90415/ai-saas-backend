'use client'

import { useState, useEffect } from 'react'
import { adminGet } from '@/lib/admin-api'

export default function AdminGenerationsPage() {
  const [generations, setGenerations] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const limit = 20

  const fetchGenerations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (typeFilter) params.set('type', typeFilter)
      const data = await adminGet(`/api/admin/generations?${params}`)
      setGenerations(data.generations || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGenerations() }, [page, typeFilter])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">生成記錄監控</h1>

      <div className="flex gap-3">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition"
        >
          <option value="" className="bg-gray-800">所有類型</option>
          <option value="text" className="bg-gray-800">文字生成</option>
          <option value="image" className="bg-gray-800">圖片生成</option>
          <option value="product" className="bg-gray-800">產品圖片</option>
        </select>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">使用者</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">類型</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">提示詞</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">建立時間</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">載入中...</td>
                </tr>
              ) : generations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">無生成記錄</td>
                </tr>
              ) : (
                generations.map((gen) => (
                  <tr
                    key={gen.id}
                    className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                    onClick={() => setExpandedId(expandedId === gen.id ? null : gen.id)}
                  >
                    <td className="px-4 py-3 text-white">{gen.user_email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        gen.type === 'text' ? 'bg-green-500/20 text-green-300' :
                        gen.type === 'image' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-orange-500/20 text-orange-300'
                      }`}>
                        {gen.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{gen.prompt}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(gen.created_at).toLocaleString('zh-TW')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-sm text-gray-400">
              共 {total} 筆，第 {page}/{totalPages} 頁
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-white/10 text-white text-sm disabled:opacity-50 transition"
              >
                上一頁
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-white/10 text-white text-sm disabled:opacity-50 transition"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>

      {expandedId && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">生成詳情</h2>
            <button onClick={() => setExpandedId(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          {(() => {
            const gen = generations.find((g) => g.id === expandedId)
            if (!gen) return null
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">使用者：</span>
                    <span className="text-white">{gen.user_email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">類型：</span>
                    <span className="text-white">{gen.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">建立時間：</span>
                    <span className="text-white">{new Date(gen.created_at).toLocaleString('zh-TW')}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">提示詞：</span>
                  <p className="text-white text-sm mt-1 bg-white/5 rounded-lg p-3 whitespace-pre-wrap">{gen.prompt}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">結果：</span>
                  <pre className="text-white text-xs mt-1 bg-white/5 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                    {typeof gen.result === 'string' ? gen.result : JSON.stringify(gen.result, null, 2)}
                  </pre>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
