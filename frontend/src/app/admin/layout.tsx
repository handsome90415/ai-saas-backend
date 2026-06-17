'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { adminGet, isLoggedIn, removeAdminToken } from '@/lib/admin-api'

const navItems = [
  { href: '/admin', label: '儀表板', icon: '📊' },
  { href: '/admin/users', label: '使用者管理', icon: '👥' },
  { href: '/admin/generations', label: '生成記錄', icon: '📝' },
  { href: '/admin/usage', label: '使用統計', icon: '📈' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }
    if (!isLoggedIn()) {
      router.push('/admin/login')
      return
    }
    adminGet('/api/admin/me')
      .then((data) => setAdmin(data))
      .catch(() => {
        removeAdminToken()
        router.push('/admin/login')
      })
      .finally(() => setLoading(false))
  }, [pathname, router])

  const logout = () => {
    removeAdminToken()
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">載入中...</div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link href="/admin" className="text-xl font-bold text-white">
            <span className="text-purple-400">AI</span> 後台
          </Link>
          <button className="lg:hidden text-white p-1" onClick={() => setSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button className="lg:hidden text-white p-2" onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-gray-300 text-sm">{admin?.name || admin?.email}</span>
            <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition">
              登出
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
