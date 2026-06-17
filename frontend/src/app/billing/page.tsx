'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiGet, apiPost } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
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

const planNames: Record<string, string> = {
  free: '免費版',
  pro: '專業版',
  enterprise: '企業版',
}

export default function BillingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast('付款成功！', 'success')
    }
  }, [searchParams, toast])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const data = await apiGet<BillingStatus>('/api/billing/status')
      setStatus(data)
    } catch (error: any) {
      toast(error.message || '載入失敗', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated) fetchStatus()
  }, [isAuthenticated])

  const handleUpgrade = async (plan: string) => {
    try {
      const data = await apiPost<{ checkout_url: string }>('/api/billing/checkout', { plan })
      window.location.href = data.checkout_url
    } catch (error: any) {
      toast(error.message || '升級失敗', 'error')
    }
  }

  const handlePortal = async () => {
    try {
      const data = await apiPost<{ portal_url: string }>('/api/billing/portal')
      window.location.href = data.portal_url
    } catch (error: any) {
      toast(error.message || '無法開啟管理頁面', 'error')
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">帳單管理</h1>

        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : status && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">目前方案</h2>
              <p className="text-3xl font-bold text-purple-400 mb-4">
                {planNames[status.plan] || status.plan}
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>文案生成</span>
                    <span>
                      {status.text_usage} / {status.text_limit === -1 ? '∞' : status.text_limit}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full">
                    <div
                      className="h-2 bg-purple-500 rounded-full transition-all"
                      style={{
                        width: status.text_limit === -1
                          ? '10%'
                          : `${Math.min(100, (status.text_usage / status.text_limit) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>圖片生成</span>
                    <span>
                      {status.image_usage} / {status.image_limit === -1 ? '∞' : status.image_limit}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all"
                      style={{
                        width: status.image_limit === -1
                          ? '10%'
                          : `${Math.min(100, (status.image_usage / status.image_limit) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {status.plan === 'free' && (
                <>
                  <Button onClick={() => handleUpgrade('pro')}>
                    升級專業版 $9.99/月
                  </Button>
                  <Button variant="secondary" onClick={() => handleUpgrade('enterprise')}>
                    升級企業版 $29.99/月
                  </Button>
                </>
              )}
              {status.plan === 'pro' && (
                <>
                  <Button onClick={() => handleUpgrade('enterprise')}>
                    升級企業版
                  </Button>
                  <Button variant="secondary" onClick={handlePortal}>
                    管理訂閱
                  </Button>
                </>
              )}
              {status.plan === 'enterprise' && (
                <Button variant="secondary" onClick={handlePortal}>
                  管理訂閱
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
