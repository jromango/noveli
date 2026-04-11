import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import { themeConfig } from '../../lib/themeConfig'

interface CardNoveliProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export default function CardNoveli({ children, className = '', hoverable = true }: CardNoveliProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const palette = themeConfig[theme]

  const hoverClass = hoverable
    ? isDarkMode
      ? 'hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.58)] hover:border-[#D4AF37]/24'
      : 'hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(90,60,30,0.14)] hover:border-[#C4A484]/30'
    : ''

  return (
    <div
      className={[
        'rounded-2xl border',
        'backdrop-blur-md',
        'transition-colors duration-250',
        hoverable ? 'transition-all duration-300' : '',
        hoverClass,
        className,
      ].join(' ')}
      style={{
        background: isDarkMode ? 'rgba(0,0,0,0.34)' : 'rgba(255,255,255,0.78)',
        border: '0.5px solid rgba(212,175,55,0.22)',
        boxShadow: isDarkMode ? '0 14px 36px rgba(0,0,0,0.52)' : '0 10px 24px rgba(90,60,30,0.10)',
      }}
    >
      {children}
    </div>
  )
}
