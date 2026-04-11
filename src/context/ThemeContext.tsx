import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  isLight: boolean
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = window.localStorage.getItem('noveli-theme')
    if (stored === 'light' || stored === 'dark') return stored
    return 'dark'
  })

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    window.localStorage.setItem('noveli-theme', theme)

    const root = document.documentElement
    const body = document.body

    // Clase 'dark' en <html> activa todas las variantes dark: de Tailwind
    root.classList.toggle('dark', theme === 'dark')
    body.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
    body.classList.toggle('light', theme === 'light')

    // Limpia clases legacy para evitar estados visuales "parchados"
    body.classList.remove('theme-light', 'theme-dark')

    // Sincroniza color base de Body con el mismo estado que Header
    body.style.backgroundColor = theme === 'dark' ? '#0A0A0A' : '#F8F2E8'
    body.style.color = theme === 'dark' ? '#FFFFFF' : '#3B2F24'

    root.setAttribute('data-theme', theme)
    body.setAttribute('data-theme', theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      isLight: theme === 'light',
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
