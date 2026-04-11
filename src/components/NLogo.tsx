import React from 'react'

interface NLogoProps {
  size?: number | string
  className?: string
  background?: boolean
}

export default function NLogo({ size = 48, className = '', background = false }: NLogoProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="N Crest logo"
    >
      {background && (
        <rect x="0" y="0" width="120" height="120" rx="28" fill="#000000" />
      )}
      <path
        d="M34 22 V98 M34 22 L68 74 L68 22 M68 74 V98"
        stroke="#D4AF37"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M30 98 C40 88 52 88 62 98"
        stroke="#D4AF37"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 104 C40 96 52 96 62 104"
        stroke="#D4AF37"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
