'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-white">
          <span className="text-purple-400">AI</span> Content Generator
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

        <div className="hidden md:flex space-x-4 items-center">
          {isAuthenticated ? (
            <>
              <Link href="/product" className="text-white hover:text-purple-300">
                產品助手
              </Link>
              <Link href="/publish" className="text-white hover:text-purple-300">
                多平台發布
              </Link>
              <Link href="/history" className="text-white hover:text-purple-300">
                歷史記錄
              </Link>
              <Link href="/billing" className="text-white hover:text-purple-300">
                帳單
              </Link>
              <Link href="/settings" className="text-white hover:text-purple-300">
                設定
              </Link>
              <span className="text-gray-300">{user?.name || user?.email}</span>
              <button
                onClick={logout}
                className="text-white hover:text-purple-300"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-purple-300">
                登入
              </Link>
              <Link
                href="/signup"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                開始使用
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/20">
          <div className="flex flex-col space-y-4 pt-4">
            {isAuthenticated ? (
              <>
                <Link href="/product" className="text-white hover:text-purple-300" onClick={() => setMenuOpen(false)}>
                  產品助手
                </Link>
                <Link href="/publish" className="text-white hover:text-purple-300" onClick={() => setMenuOpen(false)}>
                  多平台發布
                </Link>
                <Link href="/history" className="text-white hover:text-purple-300" onClick={() => setMenuOpen(false)}>
                  歷史記錄
                </Link>
                <Link href="/billing" className="text-white hover:text-purple-300" onClick={() => setMenuOpen(false)}>
                  帳單
                </Link>
                <Link href="/settings" className="text-white hover:text-purple-300" onClick={() => setMenuOpen(false)}>
                  設定
                </Link>
                <span className="text-gray-300">{user?.name || user?.email}</span>
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="text-white hover:text-purple-300 text-left"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-purple-300" onClick={() => setMenuOpen(false)}>
                  登入
                </Link>
                <Link
                  href="/signup"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  開始使用
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
