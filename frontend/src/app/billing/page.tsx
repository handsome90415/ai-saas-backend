'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiGet, apiPost } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

interface BillingStatus {
  plan: string
  text_usage: number
  text_limit: number
  image_usage: number
  image_limit: number
}

export default function BillingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { t, locale } = useLanguage()
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const planNames: Record<string, string> = { free: t('pricing.free'), pro: t('pricing.pro'), enterprise: t('pricing.enterprise') }

  useEffect(() => { if (!authLoading && !isAuthenticated) router.push('/login') }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (searchParams.get('success') === 'true') toast(locale === 'zh-TW' ? '付款成功！' : 'Payment successful!', 'success')
  }, [searchParams, toast, locale])

  const fetchStatus = async () => {
    setLoading(true)
    try { setStatus(await apiGet<BillingStatus>('/api/billing/status')) }
    catch (error: any) { toast(error.message || 'Error', 'error') }
    setLoading(false)
  }

  useEffect(() => { if (isAuthenticated) fetchStatus() }, [isAuthenticated])

  const handleUpgrade = async (plan: string) => {
    try { const data = await apiPost<{ checkout_url: string }>('/api/billing/checkout', { plan }); window.location.href = data.checkout_url }
    catch (error: any) { toast(error.message || 'Error', 'error') }
  }

  const handlePortal = async () => {
    try { const data = await apiPost<{ portal_url: string }>('/api/billing/portal'); window.location.href = data.portal_url }
    catch (error: any) { toast(error.message || 'Error', 'error') }
  }

  if (authLoading || !isAuthenticated) return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header /><div className="container mx-auto px-4 py-8"><Skeleton className="h-40 w-full" /></div><Footer />
    </main>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">{t('billing.title')}</h1>
        {loading ? <Skeleton className="h-40 w-full" /> : status && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">{t('billing.current')}</h2>
              <p className="text-3xl font-bold text-purple-400 mb-4">{planNames[status.plan] || status.plan}</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1"><span>{t('billing.text_usage')}</span><span>{status.text_usage} / {status.text_limit === -1 ? '∞' : status.text_limit}</span></div>
                  <div className="h-2 bg-white/10 rounded-full"><div className="h-2 bg-purple-500 rounded-full transition-all" style={{ width: status.text_limit === -1 ? '10%' : `${Math.min(100, (status.text_usage / status.text_limit) * 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1"><span>{t('billing.image_usage')}</span><span>{status.image_usage} / {status.image_limit === -1 ? '∞' : status.image_limit}</span></div>
                  <div className="h-2 bg-white/10 rounded-full"><div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: status.image_limit === -1 ? '10%' : `${Math.min(100, (status.image_usage / status.image_limit) * 100)}%` }} /></div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {status.plan === 'free' && (<><Button onClick={() => handleUpgrade('pro')}>{t('billing.upgrade_pro')}</Button><Button variant="secondary" onClick={() => handleUpgrade('enterprise')}>{t('billing.upgrade_enterprise')}</Button></>)}
              {status.plan === 'pro' && (<><Button onClick={() => handleUpgrade('enterprise')}>{t('pricing.cta.enterprise')}</Button><Button variant="secondary" onClick={handlePortal}>{t('billing.manage')}</Button></>)}
              {status.plan === 'enterprise' && <Button variant="secondary" onClick={handlePortal}>{t('billing.manage')}</Button>}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
