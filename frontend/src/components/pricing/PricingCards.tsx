'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { apiPost } from '@/lib/api'

export function PricingCards() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (plan: string) => {
    setLoading(plan)
    try {
      const data = await apiPost<{ checkout_url: string }>('/api/billing/create-checkout-session', { plan })
      window.location.href = data.checkout_url
    } catch (error: any) {
      toast(error.message || 'Error', 'error')
      setLoading(null)
    }
  }

  const plans = [
    {
      name: t('pricing.free'),
      price: '$0',
      features: ['5 ' + t('gen.text'), '3 ' + t('gen.image'), t('pricing.f.1platform')],
      button: t('pricing.cta.free'),
      href: '/signup',
      featured: false,
    },
    {
      name: t('pricing.pro'),
      price: '$9.99',
      period: '/mo',
      badge: t('pricing.popular'),
      features: ['200 ' + t('gen.text'), '20 ' + t('gen.image'), '3 ' + t('pricing.c.platform'), t('pricing.f.advanced')],
      button: t('pricing.cta.pro'),
      featured: true,
    },
    {
      name: t('pricing.business'),
      price: '$19.99',
      period: '/mo',
      features: ['800 ' + t('gen.text'), '60 ' + t('gen.image'), t('pricing.f.allplatform'), t('pricing.f.batch'), t('pricing.f.priority')],
      button: t('pricing.cta.business'),
      featured: false,
    },
    {
      name: t('pricing.enterprise'),
      price: 'Custom',
      features: [t('pricing.f.custom_limits'), t('pricing.f.team'), t('pricing.f.api'), t('pricing.f.dedicated')],
      button: t('pricing.cta.enterprise'),
      href: 'mailto:contact@naratake.com',
      featured: false,
    },
  ]

  return (
    <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={`backdrop-blur rounded-xl p-6 ${
            plan.featured
              ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-2 border-purple-400 relative'
              : 'bg-white/5 border border-white/10'
          }`}
        >
          {plan.badge && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
              {plan.badge}
            </span>
          )}
          <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-3xl font-bold text-white mb-4">
            {plan.price}
            {plan.period && <span className="text-lg">{plan.period}</span>}
          </p>
          <ul className="space-y-2 text-gray-300 mb-6">
            {plan.features.map(f => (
              <li key={f} className="text-sm">{f}</li>
            ))}
          </ul>
          {plan.href ? (
            <Link
              href={plan.href}
              className={`block w-full py-3 text-center rounded-lg transition ${
                plan.featured
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'border border-white/30 text-white hover:bg-white/10'
              }`}
            >
              {plan.button}
            </Link>
          ) : (
            <button
              onClick={() => handleCheckout(plan.name === t('pricing.pro') ? 'pro' : 'business')}
              disabled={loading !== null}
              className={`block w-full py-3 text-center rounded-lg transition disabled:opacity-50 ${
                plan.featured
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'border border-white/30 text-white hover:bg-white/10'
              }`}
            >
              {loading !== null ? '...' : plan.button}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
