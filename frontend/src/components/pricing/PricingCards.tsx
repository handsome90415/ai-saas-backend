import Link from 'next/link'

const plans = [
  {
    name: '免費版',
    price: '$0',
    features: ['每月 10 次文案生成', '每月 5 次圖片生成', '基本模板'],
    button: '開始使用',
    href: '/signup',
    featured: false,
  },
  {
    name: '專業版',
    price: '$9.99',
    period: '/月',
    badge: '最受歡迎',
    features: ['無限文案生成', '每月 100 次圖片生成', '進階模板庫', '優先客服'],
    button: '立即訂閱',
    href: '/signup',
    featured: true,
  },
  {
    name: '企業版',
    price: '$29.99',
    period: '/月',
    features: ['無限文案生成', '無限圖片生成', 'API 存取', '專屬客服', '自訂模板'],
    button: '聯絡我們',
    href: '/signup',
    featured: false,
  },
]

export function PricingCards() {
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
