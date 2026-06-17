'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="container mx-auto px-4 py-8 border-t border-white/10">
      <div className="text-center text-gray-400">
        <p>{t('footer.rights')}</p>
      </div>
    </footer>
  )
}
