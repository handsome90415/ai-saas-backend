'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7"/>
          <stop offset="50%" stopColor="#ec4899"/>
          <stop offset="100%" stopColor="#f97316"/>
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#logo-grad)"/>
      <path d="M10 24L14 12L18 20L22 12L26 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="14" cy="12" r="2" fill="white"/>
      <circle cx="22" cy="12" r="2" fill="white"/>
    </svg>
  )
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo />
          <span className="text-xl font-black text-white tracking-tight">
            Nara<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">take</span>
          </span>
        </Link>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="hidden md:flex space-x-5 items-center">
          <Link href="/pricing" className="text-gray-300 hover:text-white text-sm font-medium transition">
            方案
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/product" className="text-gray-300 hover:text-white text-sm font-medium transition">
                產品助手
              </Link>
              <Link href="/publish" className="text-gray-300 hover:text-white text-sm font-medium transition">
                多平台發布
              </Link>
              <Link href="/history" className="text-gray-300 hover:text-white text-sm font-medium transition">
                歷史記錄
              </Link>
              <Link href="/settings" className="text-gray-300 hover:text-white text-sm font-medium transition">
                設定
              </Link>
              <div className="w-px h-5 bg-white/20" />
              <span className="text-gray-400 text-sm">{user?.name || user?.email}</span>
              <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition">
                登出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium transition">
                登入
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:from-purple-400 hover:to-pink-400 transition shadow-lg shadow-purple-500/20">
                免費開始
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10">
          <div className="flex flex-col space-y-3 pt-4">
            <Link href="/pricing" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
              方案
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/product" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  產品助手
                </Link>
                <Link href="/publish" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  多平台發布
                </Link>
                <Link href="/history" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  歷史記錄
                </Link>
                <Link href="/settings" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  設定
                </Link>
                <div className="border-t border-white/10 pt-3" />
                <span className="text-gray-400">{user?.name || user?.email}</span>
                <button onClick={() => { logout(); setMenuOpen(false) }} className="text-gray-400 hover:text-white text-left">
                  登出
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  登入
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold text-center" onClick={() => setMenuOpen(false)}>
                  免費開始
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
