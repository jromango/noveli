export type ThemeMode = 'dark' | 'light'

export interface ThemePalette {
  background: string
  backgroundElevated: string
  surface: string
  surfaceBorder: string
  title: string
  textPrimary: string
  textSecondary: string
  accent: string
  accentSoft: string
  glow: string
}

export const themeConfig: Record<ThemeMode, ThemePalette> = {
  dark: {
    background: '#0A0A0A',
    backgroundElevated: '#141414',
    surface: 'rgba(255, 255, 255, 0.03)',
    surfaceBorder: 'rgba(212, 175, 55, 0.10)',
    title: '#F7F2E8',
    textPrimary: '#F5F1E8',
    textSecondary: '#B9B1A4',
    accent: '#D4AF37',
    accentSoft: 'rgba(212, 175, 55, 0.26)',
    glow: 'rgba(212, 175, 55, 0.40)',
  },
  light: {
    background: '#F8F2E8',
    backgroundElevated: '#F2E9DC',
    surface: 'rgba(255, 255, 255, 0.80)',
    surfaceBorder: 'rgba(196, 164, 132, 0.30)',
    title: '#2E241A',
    textPrimary: '#3B2F24',
    textSecondary: '#7E6A54',
    accent: '#C4A484',
    accentSoft: 'rgba(196, 164, 132, 0.22)',
    glow: 'rgba(196, 164, 132, 0.36)',
  },
}
