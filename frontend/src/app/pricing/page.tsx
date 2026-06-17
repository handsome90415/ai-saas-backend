'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const plans = [
  {
    id: 'free',
    name: '免費版',
    price: '$0',
    period: '/月',
    description: '適合個人體驗與輕度使用',
    color: 'from-gray-500 to-gray-600',
    borderColor: 'border-white/10',
    features: [
      { text: '每月 10 次文案生成', included: true },
      { text: '每月 5 次圖片生成', included: true },
      { text: '基本模板', included: true },
      { text: '多平台發布（3 個平台）', included: true },
      { text: '歷史記錄保存 7 天', included: true },
      { text: '進階模板庫', included: false },
      { text: 'API 存取', included: false },
      { text: '專屬客服', included: false },
    ],
    cta: '免費開始',
    ctaHref: '/signup',
    popular: false,
  },
  {
    id: 'pro',
    name: '專業版',
    price: '$9.99',
    period: '/月',
    annualPrice: '$99/年',
    annualSave: '省 17%',
    description: '適合個人創作者與自由工作者',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/50',
    features: [
      { text: '無限文案生成', included: true },
      { text: '每月 100 次圖片生成', included: true },
      { text: '進階模板庫', included: true },
      { text: '多平台發布（全部平台）', included: true },
      { text: '歷史記錄永久保存', included: true },
      { text: '匯出 TXT / JSON', included: true },
      { text: '優先客服', included: true },
      { text: 'API 存取', included: false },
    ],
    cta: '立即訂閱',
    ctaHref: '/signup',
    popular: true,
  },
  {
    id: 'enterprise',
    name: '企業版',
    price: '$29.99',
    period: '/月',
    annualPrice: '$299/年',
    annualSave: '省 17%',
    description: '適合團隊與企業級需求',
    color: 'from-orange-500 to-red-500',
    borderColor: 'border-orange-500/30',
    features: [
      { text: '無限文案生成', included: true },
      { text: '無限圖片生成', included: true },
      { text: '進階模板庫', included: true },
      { text: '多平台發布（全部平台）', included: true },
      { text: '歷史記錄永久保存', included: true },
      { text: '匯出 TXT / JSON', included: true },
      { text: 'API 存取', included: true },
      { text: '專屬客服', included: true },
    ],
    cta: '聯絡我們',
    ctaHref: '/signup',
    popular: false,
  },
]

const faqs = [
  {
    q: '免費版有什麼限制？',
    a: '免費版每月可生成 10 次文案和 5 次圖片，歷史記錄保留 7 天。無需信用卡即可開始使用。',
  },
  {
    q: '可以隨時取消訂閱嗎？',
    a: '是的，你可以隨時在帳戶設定中取消訂閱。取消後，你的方案會在目前計費週期結束時生效。',
  },
  {
    q: '圖片生成使用什麼模型？',
    a: '我們支援 DALL-E 3（OpenAI）等多種圖片生成模型。你也可以在設定中使用自己的 API Key。',
  },
  {
    q: '企業版有什麼額外功能？',
    a: '企業版提供 API 存取、無限生成次數、專屬客服支援，以及自訂模板和批量生成功能。',
  },
  {
    q: '付款方式有哪些？',
    a: '我們支援所有主要信用卡和金融卡。年繳方案可享 17% 折扣。',
  },
  {
    q: '可以升級或降級方案嗎？',
    a: '可以。升級立即生效，降級會在目前計費週期結束時生效。',
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <Header />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <span className="inline-block px-4 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-bold mb-6">定價方案</span>
        <h1 className="text-5xl font-black text-white mb-4">
          選擇適合你的
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"> 方案</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          從免費方案開始體驗，隨時升級以解鎖更多功能。無隱藏費用。
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>月繳</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/20'}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${annual ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>
            年繳 <span className="text-green-400 text-xs font-bold">省 17%</span>
          </span>
        </div>
      </section>

      {/* Plans */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 ${plan.borderColor} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                plan.popular ? 'bg-white/10 shadow-xl shadow-purple-500/10' : 'bg-white/5'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-1.5 text-sm font-black">
                  ⭐ 最受歡迎
                </div>
              )}

              <div className="p-8">
                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-400 text-lg">{plan.period}</span>
                  {annual && plan.annualPrice && (
                    <div className="mt-1">
                      <span className="text-sm text-gray-400">年繳 </span>
                      <span className="text-lg font-bold text-green-400">{plan.annualPrice}</span>
                      <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">{plan.annualSave}</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      {f.included ? (
                        <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${f.included ? 'text-gray-200' : 'text-gray-600'}`}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block w-full py-3.5 rounded-xl font-black text-center transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/25'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">功能比較</h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">功能</th>
                <th className="text-center py-4 px-4 text-white font-bold">免費版</th>
                <th className="text-center py-4 px-4 text-purple-400 font-bold">專業版</th>
                <th className="text-center py-4 px-4 text-orange-400 font-bold">企業版</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ['文案生成', '10 次/月', '無限', '無限'],
                ['圖片生成', '5 次/月', '100 次/月', '無限'],
                ['多平台發布', '3 個平台', '全部平台', '全部平台'],
                ['AI 供應商', '—', 'OpenAI / Gemini / Claude', 'OpenAI / Gemini / Claude'],
                ['模型選擇', '—', '自選模型', '自選模型'],
                ['歷史記錄', '7 天', '永久', '永久'],
                ['匯出格式', '—', 'TXT / JSON', 'TXT / JSON'],
                ['API 存取', '—', '—', '✓'],
                ['專屬客服', '—', '優先', '1 對 1'],
              ].map(([feature, free, pro, enterprise], i) => (
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

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-black text-white text-center mb-4">常見問題</h2>
        <p className="text-gray-400 text-center mb-12">如果你有其他問題，歡迎隨時聯繫我們</p>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-bold">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-2xl p-12 border border-white/10">
          <h2 className="text-3xl font-black text-white mb-4">準備好開始了嗎？</h2>
          <p className="text-gray-400 mb-8">免費註冊，立即體驗 AI 內容生成的強大功能</p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/25"
          >
            免費開始使用
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
