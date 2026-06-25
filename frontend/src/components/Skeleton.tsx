interface Props { lines?: number; height?: string }

export function Skeleton({ lines = 3, height = 'h-3' }: Props) {
  return (
    <div className="flex flex-col gap-2.5 p-1">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${height} rounded-lg`}
          style={{ width: `${70 + (i % 3) * 15}%`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface/40 rounded-xl p-3 flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="skeleton h-3 w-3 rounded-full" />
        <div className="skeleton h-3 rounded-lg" style={{ width: '40%' }} />
        <div className="skeleton h-3 rounded-full ml-auto" style={{ width: '20%' }} />
      </div>
      <div className="skeleton h-1.5 rounded-full" />
      <div className="skeleton h-1.5 rounded-full" style={{ width: '75%' }} />
    </div>
  );
}
