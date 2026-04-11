import React from 'react'

export function BookSkeleton() {
  return (
    <button className="w-full flex gap-3 p-3 border-b border-gray-100 last:border-b-0 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="w-10 h-14 bg-gray-300 rounded border border-gray-200 flex-shrink-0"></div>

      {/* Text skeleton */}
      <div className="flex-1 text-left min-w-0 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </button>
  )
}

export function BookSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <BookSkeleton key={i} />
      ))}
    </>
  )
}
