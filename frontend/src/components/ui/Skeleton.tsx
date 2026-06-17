export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-white/10 rounded ${className}`} style={style} />
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  )
}

export function SkeletonImage() {
  return <Skeleton className="w-full aspect-square rounded-lg" />
}
