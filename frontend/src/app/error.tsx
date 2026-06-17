'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">發生錯誤</h1>
        <p className="text-gray-300 mb-8">{error.message || '無法載入頁面'}</p>
        <button
          onClick={reset}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
        >
          重試
        </button>
      </div>
    </main>
  )
}
