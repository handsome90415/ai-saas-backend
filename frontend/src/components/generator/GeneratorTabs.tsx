'use client'

import { useState, ReactNode } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

type TabType = 'text' | 'image' | 'product'

interface Props {
  textTab: ReactNode
  imageTab: ReactNode
  productTab: ReactNode
}

export function GeneratorTabs({ textTab, imageTab, productTab }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('text')
  const { t } = useLanguage()

  const tabs: { key: TabType; label: string }[] = [
    { key: 'text', label: t('gen.text') },
    { key: 'image', label: t('gen.image') },
    { key: 'product', label: t('gen.product') },
  ]

  return (
    <>
      <div className="flex mb-6 border-b border-white/20">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-white font-medium transition ${
              activeTab === tab.key ? 'border-b-2 border-purple-400' : ''
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'text' && textTab}
      {activeTab === 'image' && imageTab}
      {activeTab === 'product' && productTab}
    </>
  )
}
