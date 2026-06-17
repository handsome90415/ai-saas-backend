'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export function PricingCards() {
  const { t } = useLanguage()

  const plans = [
    {
      name: t('pricing.free'),
      price: '$0',
      features: ['10 ' + (t('gen.text')), '5 ' + (t('gen.image'))],
      button: t('pricing.cta.free'),
      href: '/signup',
      featured: false,
    },
    {
      name: t('pricing.pro'),
      price: '$9.99',
      period: '/mo',
      badge: t('pricing.popular'),
      features: [t('pricing.features.unlimited'), t('pricing.features.images.100'), t('pricing.features.templates'), t('pricing.features.priority')],
      button: t('pricing.cta.pro'),
      href: '/signup',
      featured: true,
    },
    {
      name: t('pricing.enterprise'),
      price: '$29.99',
      period: '/mo',
      features: [t('pricing.features.unlimited'), t('pricing.features.images.inf'), t('pricing.features.api'), t('pricing.features.dedicated')],
      button: t('pricing.cta.enterprise'),
      href: '/signup',
      featured: false,
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={`backdrop-blur rounded-xl p-8 ${
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
          <p className="text-4xl font-bold text-white mb-4">
            {plan.price}
            {plan.period && <span className="text-lg">{plan.period}</span>}
          </p>
          <ul className="space-y-3 text-gray-300 mb-8">
            {plan.features.map(f => (
              <li key={f}>{f}</li>
            ))}
          </ul>
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
        </div>
      ))}
    </div>
  )
}
