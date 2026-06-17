'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/layout/HeroSection'
import { GeneratorTabs } from '@/components/generator/GeneratorTabs'
import { TextGenerator } from '@/components/generator/TextGenerator'
import { ImageGenerator } from '@/components/generator/ImageGenerator'
import { ProductImageGenerator } from '@/components/generator/ProductImageGenerator'
import { TextResult } from '@/components/generator/TextResult'
import { ImageResult } from '@/components/generator/ImageResult'
import { PricingCards } from '@/components/pricing/PricingCards'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Home() {
  const [result, setResult] = useState<any>(null)
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (!isAuthenticated) setResult(null)
  }, [isAuthenticated])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <HeroSection />
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <GeneratorTabs
            textTab={<TextGenerator onResult={(data) => setResult(data)} />}
            imageTab={<ImageGenerator onResult={(data) => setResult(data)} />}
            productTab={<ProductImageGenerator onResult={(data) => setResult(data)} />}
          />
          {result && (
            <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{t('gen.result')}</h3>
              {result.title ? (
                <TextResult title={result.title} content={result.content} hashtags={result.hashtags || []} />
              ) : result.image_url ? (
                <ImageResult image_url={result.image_url} revised_prompt={result.revised_prompt} />
              ) : null}
            </div>
          )}
        </div>
      </section>
      <section className="container mx-auto px-4 py-20">
        <PricingCards />
      </section>
      <Footer />
    </main>
  )
}
