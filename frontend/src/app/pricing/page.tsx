'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PricingCards } from '@/components/pricing/PricingCards'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-4">選擇適合你的方案</h1>
        <p className="text-gray-300 text-center mb-12">隨時可以升降級，無隱藏費用</p>
        <PricingCards />
      </section>
      <Footer />
    </main>
  )
}
