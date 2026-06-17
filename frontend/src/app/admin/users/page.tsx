'use client'

import { useState, useEffect } from 'react'
import { adminGet, adminPut, adminDelete } from '@/lib/admin-api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userDetail, setUserDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const limit = 20

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      if (planFilter) params.set('plan', planFilter)
      const data = await adminGet(`/api/admin/users?${params}`)
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, planFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const viewUser = async (userId: string) => {
    setSelectedUser(userId)
    setDetailLoading(true)
    try {
      const data = await adminGet(`/api/admin/users/${userId}`)
      setUserDetail(data)
    } finally {
      setDetailLoading(false)
    }
  }

  const changePlan = async (userId: string, plan: string) => {
    await adminPut(`/api/admin/users/${userId}/plan`, { plan })
    fetchUsers()
  }

  const deleteUser = async (userId: string) => {
    await adminDelete(`/api/admin/users/${userId}`)
    setDeleteConfirm(null)
    fetchUsers()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">使用者管理</h1>

      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋電子郵件或名稱..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            搜尋
          </button>
        </form>

        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition"
        >
          <option value="" className="bg-gray-800">所有方案</option>
          <option value="free" className="bg-gray-800">Free</option>
          <option value="pro" className="bg-gray-800">Pro</option>
          <option value="enterprise" className="bg-gray-800">Enterprise</option>
        </select>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">電子郵件</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">名稱</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">方案</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">API Key</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">生成次數</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">建立時間</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">載入中...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">無使用者資料</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-white">{user.email}</td>
                    <td className="px-4 py-3 text-gray-300">{user.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.plan === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                        user.plan === 'enterprise' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={user.has_api_key ? 'text-green-400' : 'text-gray-500'}>
                        {user.has_api_key ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.generation_count}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewUser(user.id)}
                          className="text-purple-400 hover:text-purple-300 text-xs transition"
                        >
                          詳情
                        </button>
                        <select
                          value={user.plan}
                          onChange={(e) => changePlan(user.id, e.target.value)}
                          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        >
                          <option value="free" className="bg-gray-800">Free</option>
                          <option value="pro" className="bg-gray-800">Pro</option>
                          <option value="enterprise" className="bg-gray-800">Enterprise</option>
                        </select>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              確認
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-400 hover:text-gray-300 text-xs"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="text-red-400 hover:text-red-300 text-xs transition"
                          >
                            刪除
                          </button>
                        )}
                      </div>
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">使用者詳情</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {detailLoading ? (
              <div className="text-center py-8 text-gray-400">載入中...</div>
            ) : userDetail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">電子郵件：</span>
                    <span className="text-white">{userDetail.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">名稱：</span>
                    <span className="text-white">{userDetail.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">方案：</span>
                    <span className="text-white">{userDetail.plan}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">管理員：</span>
                    <span className="text-white">{userDetail.is_admin ? '是' : '否'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">生成記錄</h3>
                  {userDetail.generations?.length === 0 ? (
                    <p className="text-gray-500 text-sm">暫無記錄</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {userDetail.generations?.map((gen: any) => (
                        <div key={gen.id} className="bg-white/5 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{gen.type}</span>
                            <span className="text-gray-500 text-xs">{new Date(gen.created_at).toLocaleString('zh-TW')}</span>
                          </div>
                          <p className="text-gray-300 text-xs truncate">{gen.prompt}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
