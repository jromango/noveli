import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import { themeConfig } from '../../lib/themeConfig'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function PageLayout({ children, className = '' }: PageLayoutProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const palette = themeConfig[theme]

  return (
    <div
      className={[
        'relative min-h-screen overflow-hidden transition-colors duration-300',
        className,
      ].join(' ')}
      style={{
        color: palette.textPrimary,
        backgroundColor: palette.background,
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: isDarkMode
            ? 'radial-gradient(1000px 520px at 50% 8%, rgba(212,175,55,0.15), transparent 70%), radial-gradient(900px 420px at 0% 100%, rgba(255,120,32,0.08), transparent 76%)'
            : 'radial-gradient(900px 520px at 50% 8%, rgba(196,164,132,0.14), transparent 70%), radial-gradient(860px 420px at 0% 100%, rgba(255,255,255,0.62), transparent 76%)',
          transform: 'translateZ(0)',
        }}
      />
      <div className="app-shell relative z-10 px-3 sm:px-4">{children}</div>
    </div>
  )
}
