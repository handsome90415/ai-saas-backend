'use client'

import { useState, useEffect } from 'react'
import { adminGet } from '@/lib/admin-api'

const planColors: Record<string, string> = {
  free: 'bg-gray-500',
  pro: 'bg-purple-500',
  enterprise: 'bg-blue-500',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [generations, setGenerations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminGet('/api/admin/stats'),
      adminGet('/api/admin/generations?page=1&limit=10'),
    ])
      .then(([statsData, genData]) => {
        setStats(statsData)
        setGenerations(genData.generations || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-white text-center py-20">載入中...</div>
  }

  const cards = [
    { label: '總使用者數', value: stats?.total_users ?? 0, icon: '👥' },
    { label: '總生成次數', value: stats?.total_generations ?? 0, icon: '📝' },
    { label: '今日使用者', value: stats?.users_today ?? 0, icon: '🆕' },
    { label: '今日生成', value: stats?.generations_today ?? 0, icon: '⚡' },
    { label: '預估收入', value: `$${stats?.revenue_estimate ?? 0}`, icon: '💰' },
  ]

  const planDist = stats?.plan_distribution || []
  const maxPlan = Math.max(...planDist.map((p: any) => p.count), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">儀表板</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-5">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-gray-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">方案分佈</h2>
        <div className="space-y-3">
          {planDist.map((item: any) => (
            <div key={item.plan} className="flex items-center gap-3">
              <span className="text-gray-300 text-sm w-20 capitalize">{item.plan}</span>
              <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                <div
                  className={`${planColors[item.plan] || 'bg-gray-500'} h-full rounded-full transition-all`}
                  style={{ width: `${(item.count / maxPlan) * 100}%` }}
                />
              </div>
              <span className="text-gray-300 text-sm w-12 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">最近生成記錄</h2>
        <div className="space-y-2">
          {generations.length === 0 ? (
            <p className="text-gray-400 text-sm">暫無記錄</p>
          ) : (
            generations.map((gen) => (
              <div key={gen.id} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-gray-500 w-36 shrink-0">
                  {new Date(gen.created_at).toLocaleString('zh-TW')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 shrink-0">
                  {gen.type}
                </span>
                <span className="text-gray-300 text-sm truncate">{gen.user_email}</span>
                <span className="text-gray-500 text-sm truncate ml-auto">{gen.prompt?.slice(0, 60)}...</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
