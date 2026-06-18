'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { t } = useLanguage()

  const plans = [
    { id: 'free', name: t('pricing.free'), price: '$0', period: '/mo', desc: t('pricing.free.desc'),
      features: [t('pricing.f.10text'), t('pricing.f.5image'), t('pricing.f.3platform'), t('pricing.f.7days'), t('pricing.f.advanced'), t('pricing.f.api'), t('pricing.f.dedicated')],
      included: [true, true, true, true, false, false, false], cta: t('pricing.cta.free'), popular: false },
    { id: 'pro', name: t('pricing.pro'), price: '$9.99', period: '/mo', annualPrice: '$99/yr', desc: t('pricing.pro.desc'),
      features: [t('pricing.f.unlimited_text'), t('pricing.f.100image'), t('pricing.f.advanced'), t('pricing.f.allplatform'), t('pricing.f.forever'), t('pricing.f.export'), t('pricing.f.priority'), t('pricing.f.api')],
      included: [true, true, true, true, true, true, true, false], cta: t('pricing.cta.pro'), popular: true },
    { id: 'enterprise', name: t('pricing.enterprise'), price: '$29.99', period: '/mo', annualPrice: '$299/yr', desc: t('pricing.enterprise.desc'),
      features: [t('pricing.f.unlimited_text'), t('pricing.f.infimage'), t('pricing.f.advanced'), t('pricing.f.allplatform'), t('pricing.f.forever'), t('pricing.f.export'), t('pricing.f.api'), t('pricing.f.dedicated')],
      included: [true, true, true, true, true, true, true, true], cta: t('pricing.cta.enterprise'), popular: false },
  ]

  const faqs = [
    { q: t('pricing.faq.1.q'), a: t('pricing.faq.1.a') },
    { q: t('pricing.faq.2.q'), a: t('pricing.faq.2.a') },
    { q: t('pricing.faq.3.q'), a: t('pricing.faq.3.a') },
    { q: t('pricing.faq.4.q'), a: t('pricing.faq.4.a') },
    { q: t('pricing.faq.5.q'), a: t('pricing.faq.5.a') },
    { q: t('pricing.faq.6.q'), a: t('pricing.faq.6.a') },
  ]

  const compareRows = [
    [t('pricing.c.text_gen'), '10/mo', t('pricing.c.unlimited'), t('pricing.c.unlimited')],
    [t('pricing.c.image_gen'), '5/mo', '100/mo', t('pricing.c.unlimited')],
    [t('pricing.c.platform'), '3', '✓', '✓'],
    [t('pricing.c.provider'), '—', 'OpenAI/Gemini/Claude', 'OpenAI/Gemini/Claude'],
    [t('pricing.c.model'), '—', '✓', '✓'],
    [t('pricing.c.history'), '7d', t('pricing.c.forever'), t('pricing.c.forever')],
    [t('pricing.c.export_fmt'), '—', 'TXT/JSON', 'TXT/JSON'],
    [t('pricing.c.api'), '—', '—', '✓'],
    [t('pricing.c.support'), '—', t('pricing.c.priority'), t('pricing.c.one_on_one')],
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <Header />
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <span className="inline-block px-4 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-bold mb-6">Pricing</span>
        <h1 className="text-5xl font-black text-white mb-4">{t('pricing.title')}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">{t('pricing.subtitle')}</p>
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>{t('pricing.monthly')}</span>
          <button onClick={() => setAnnual(!annual)} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/20'}`}>
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${annual ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>{t('pricing.annual')} <span className="text-green-400 text-xs font-bold">{t('pricing.save')}</span></span>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          {plans.map(plan => (
            <div key={plan.id} className={`relative rounded-2xl border-2 ${plan.popular ? 'border-purple-500/50 bg-white/10 shadow-xl shadow-purple-500/10' : 'border-white/10 bg-white/5'} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
              {plan.popular && <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-1.5 text-sm font-black">{t('pricing.popular')}</div>}
              <div className="p-8">
                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-400 text-lg">{plan.period}</span>
                  {annual && plan.annualPrice && <div className="mt-1"><span className="text-sm text-gray-400">Annual </span><span className="text-lg font-bold text-green-400">{plan.annualPrice}</span></div>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      {plan.included[i] ? (
                        <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      <span className={`text-sm ${plan.included[i] ? 'text-gray-200' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block w-full py-3.5 rounded-xl font-black text-center transition-all duration-200 ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/25' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}>
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">{t('pricing.compare')}</h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10">
              <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('pricing.c.feature')}</th>
              <th className="text-center py-4 px-4 text-white font-bold">{t('pricing.free')}</th>
              <th className="text-center py-4 px-4 text-purple-400 font-bold">{t('pricing.pro')}</th>
              <th className="text-center py-4 px-4 text-orange-400 font-bold">{t('pricing.enterprise')}</th>
            </tr></thead>
            <tbody className="text-gray-300">
              {compareRows.map(([feature, free, pro, enterprise], i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3.5 px-4 text-white font-medium">{feature}</td>
                  <td className="py-3.5 px-4 text-center">{free}</td>
                  <td className="py-3.5 px-4 text-center text-purple-300">{pro}</td>
                  <td className="py-3.5 px-4 text-center text-orange-300">{enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-black text-white text-center mb-4">{t('pricing.faq')}</h2>
        <p className="text-gray-400 text-center mb-12">{t('pricing.faq.desc')}</p>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="text-white font-bold">{faq.q}</span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openFaq === i && <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-2xl p-12 border border-white/10">
          <h2 className="text-3xl font-black text-white mb-4">{t('pricing.cta.ready')}</h2>
          <p className="text-gray-400 mb-8">{t('pricing.cta.desc')}</p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/25">{t('pricing.cta.start')}</Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
