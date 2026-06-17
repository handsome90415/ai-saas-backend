'use client'

import { useState, ReactNode } from 'react'

type TabType = 'text' | 'image' | 'product'

interface Props {
  textTab: ReactNode
  imageTab: ReactNode
  productTab: ReactNode
}

export function GeneratorTabs({ textTab, imageTab, productTab }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('text')

  const tabs: { key: TabType; label: string }[] = [
    { key: 'text', label: '文案生成' },
    { key: 'image', label: '圖片生成' },
    { key: 'product', label: '產品圖片' },
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
