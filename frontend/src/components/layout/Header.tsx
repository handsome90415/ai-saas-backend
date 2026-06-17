'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Locale } from '@/i18n/locales'

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

function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const options: { id: Locale; label: string; flag: string }[] = [
    { id: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
  ]

  const current = options.find(o => o.id === locale) || options[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-gray-300 hover:text-white transition"
      >
        <span>{current.flag}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px]">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { setLocale(opt.id); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                locale === opt.id ? 'bg-purple-500/20 text-purple-300' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
              {locale === opt.id && (
                <svg className="w-4 h-4 ml-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
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
            {t('nav.pricing')}
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/product" className="text-gray-300 hover:text-white text-sm font-medium transition">
                {t('nav.product')}
              </Link>
              <Link href="/publish" className="text-gray-300 hover:text-white text-sm font-medium transition">
                {t('nav.publish')}
              </Link>
              <Link href="/history" className="text-gray-300 hover:text-white text-sm font-medium transition">
                {t('nav.history')}
              </Link>
              <Link href="/settings" className="text-gray-300 hover:text-white text-sm font-medium transition">
                {t('nav.settings')}
              </Link>
              <div className="w-px h-5 bg-white/20" />
              <span className="text-gray-400 text-sm">{user?.name || user?.email}</span>
              <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium transition">
                {t('nav.login')}
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:from-purple-400 hover:to-pink-400 transition shadow-lg shadow-purple-500/20">
                {t('nav.signup')}
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10">
          <div className="flex flex-col space-y-3 pt-4">
            <Link href="/pricing" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
              {t('nav.pricing')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/product" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  {t('nav.product')}
                </Link>
                <Link href="/publish" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  {t('nav.publish')}
                </Link>
                <Link href="/history" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  {t('nav.history')}
                </Link>
                <Link href="/settings" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  {t('nav.settings')}
                </Link>
                <div className="border-t border-white/10 pt-3" />
                <span className="text-gray-400">{user?.name || user?.email}</span>
                <button onClick={() => { logout(); setMenuOpen(false) }} className="text-gray-400 hover:text-white text-left">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                  {t('nav.login')}
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold text-center" onClick={() => setMenuOpen(false)}>
                  {t('nav.signup')}
                </Link>
              </>
            )}
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
