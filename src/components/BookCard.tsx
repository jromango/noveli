import React, { useState } from 'react'

interface BookCardProps {
  title: string
  author: string
  cover: string
  progress: number
  totalPages: number
  currentPage: number
}

export default function BookCard({
  title,
  author,
  cover,
  progress,
  totalPages,
  currentPage,
}: BookCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="group transition-all duration-300 hover:-translate-y-1">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300">
        {/* Cover Image Container - 2/3 aspect ratio */}
        <div className="relative w-full aspect-[2/3] bg-gray-300 overflow-hidden">
          {!imageError ? (
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500">
              <div className="text-center px-4">
                <p className="text-white font-serif text-base text-center line-clamp-3">
                  {title}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-serif text-lg font-bold text-text mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="font-sans text-sm text-gray-600 mb-4">{author}</p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-sans text-xs text-gray-500">Progreso</span>
              <span className="font-sans text-xs font-semibold text-gold">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gold-light h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Pages info */}
          <p className="font-sans text-xs text-gray-500 text-center">
            {currentPage} de {totalPages} páginas
          </p>
        </div>
      </div>
    </div>
  )
}
