'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function HeroSection() {
  const { t } = useLanguage()
  return (
    <section className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-5xl font-black text-white mb-4">
        {t('hero.title')}
      </h2>
      <p className="text-xl text-gray-300 mb-8">
        {t('hero.subtitle')}
      </p>
    </section>
  )
}
