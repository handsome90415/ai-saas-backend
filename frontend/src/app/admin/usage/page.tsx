'use client'

import { useState, useEffect } from 'react'
import { adminGet } from '@/lib/admin-api'

export default function AdminUsagePage() {
  const [usage, setUsage] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminGet('/api/admin/usage'),
      adminGet('/api/admin/generations/stats'),
    ])
      .then(([usageData, statsData]) => {
        setUsage(usageData)
        setStats(statsData)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-white text-center py-20">載入中...</div>
  }

  const daily = usage?.daily || []
  const maxDaily = Math.max(...daily.map((d: any) => d.count), 1)

  const typeStats = stats?.by_type || []
  const maxType = Math.max(...typeStats.map((t: any) => t.count), 1)

  const typeColors: Record<string, string> = {
    text: 'bg-green-500',
    image: 'bg-blue-500',
    product: 'bg-orange-500',
  }

  const typeLabels: Record<string, string> = {
    text: '文字生成',
    image: '圖片生成',
    product: '產品圖片',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">使用統計</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-3xl font-bold text-white">{usage?.total_text ?? 0}</div>
          <div className="text-sm text-gray-400 mt-1">總文字生成</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="text-3xl mb-2">🖼️</div>
          <div className="text-3xl font-bold text-white">{usage?.total_image ?? 0}</div>
          <div className="text-sm text-gray-400 mt-1">總圖片生成</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">每日使用量（近30天）</h2>
        <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
          {daily.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">暫無資料</div>
          ) : (
            daily.map((day: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[20px] flex-1">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t transition-all hover:from-purple-500 hover:to-blue-400"
                  style={{ height: `${(day.count / maxDaily) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                  title={`${day.date}: ${day.count}`}
                />
                {i % 5 === 0 && (
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {day.date?.slice(5) || ''}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">類型分佈</h2>
        <div className="space-y-3">
          {typeStats.length === 0 ? (
            <p className="text-gray-400 text-sm">暫無資料</p>
          ) : (
            typeStats.map((item: any) => (
              <div key={item.type} className="flex items-center gap-3">
                <span className="text-gray-300 text-sm w-24">{typeLabels[item.type] || item.type}</span>
                <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                  <div
                    className={`${typeColors[item.type] || 'bg-gray-500'} h-full rounded-full transition-all`}
                    style={{ width: `${(item.count / maxType) * 100}%` }}
                  />
                </div>
                <span className="text-gray-300 text-sm w-12 text-right">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {stats?.by_platform?.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">平台分佈</h2>
          <div className="space-y-3">
            {stats.by_platform.map((item: any) => {
              const maxPlatform = Math.max(...stats.by_platform.map((p: any) => p.count), 1)
              return (
                <div key={item.platform} className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm w-24">{item.platform}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${(item.count / maxPlatform) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-300 text-sm w-12 text-right">{item.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
