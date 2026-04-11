import React from 'react'

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold border-r-gold animate-spin"
          style={{
            animationDuration: '1s',
          }}
        ></div>
      </div>
    </div>
  )
}
