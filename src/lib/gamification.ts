// Gamification and XP system
export const XP_CONFIG = {
  ADD_BOOK: 50,
  AI_SUGGESTION_BONUS: 20,
  COMPLETE_BOOK: 100,
  COMPLETE_PAGE: 5,
  SCAN_BOOK: 50,
  WRITE_REVIEW: 25,
  DAILY_PAGES_BONUS: 50,
  LEVEL_UP_THRESHOLD: 1000, // XP needed per level
}

// Extended User Ranks with XP thresholds
export const USER_RANKS = [
  { tier: 1, name: 'Lector Curioso', minXp: 0, maxXp: 499, emoji: '📚', color: 'from-blue-400 to-blue-600' },
  { tier: 2, name: 'Bibliotecario Noveli', minXp: 500, maxXp: 1499, emoji: '🎓', color: 'from-purple-400 to-purple-600' },
  { tier: 3, name: 'Crítico Literario', minXp: 1500, maxXp: 2999, emoji: '⭐', color: 'from-yellow-400 to-yellow-600' },
  { tier: 4, name: 'Maestro de la Lectura', minXp: 3000, maxXp: 4999, emoji: '👑', color: 'from-red-400 to-red-600' },
  { tier: 5, name: 'Guardián de las Historias', minXp: 5000, maxXp: Infinity, emoji: '🔥', color: 'from-pink-400 to-rose-600' },
]

export const USER_BADGES = [
  { name: 'Pluma de Bronce', minBooks: 1, maxBooks: 5, icon: 'Feather', color: 'from-yellow-600 to-yellow-800' },
  { name: 'Libro Abierto de Plata', minBooks: 6, maxBooks: 15, icon: 'BookOpen', color: 'from-gray-300 to-gray-500' },
  { name: 'Corona de Oro', minBooks: 16, maxBooks: Infinity, icon: 'Crown', color: 'from-yellow-400 to-yellow-600' },
]

// ===== LEVEL SYSTEM =====

/**
 * Calcula el nivel actual basado en XP total
 * @param xp Total XP points
 * @returns Current level (starts at 1)
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_CONFIG.LEVEL_UP_THRESHOLD) + 1
}

/**
 * Calcula el XP necesario para alcanzar el siguiente nivel
 * @param currentXp Current XP points
 * @returns XP needed to reach next level
 */
export function getXpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp)
  const nextLevelXp = currentLevel * XP_CONFIG.LEVEL_UP_THRESHOLD
  return Math.max(0, nextLevelXp - currentXp)
}

/**
 * Calcula el XP actual en el nivel (0 a LEVEL_UP_THRESHOLD)
 * @param totalXp Total XP accumulated
 * @returns XP progress within current level (0 to 1000)
 */
export function getXpInCurrentLevel(totalXp: number): number {
  return totalXp % XP_CONFIG.LEVEL_UP_THRESHOLD
}

/**
 * Obtiene el porcentaje de progreso hacia el siguiente nivel
 * @param totalXp Total XP accumulated
 * @returns Progress percentage (0-100)
 */
export function getLevelProgress(totalXp: number): number {
  const xpInLevel = getXpInCurrentLevel(totalXp)
  return Math.round((xpInLevel / XP_CONFIG.LEVEL_UP_THRESHOLD) * 100)
}

/**
 * Verifica si ha habido un Level Up comparando XP anterior y nuevo
 * @param previousXp XP anterior
 * @param newXp XP nuevo
 * @returns true si ha subido de nivel
 */
export function hasLeveledUp(previousXp: number, newXp: number): boolean {
  const previousLevel = calculateLevel(previousXp)
  const newLevel = calculateLevel(newXp)
  return newLevel > previousLevel
}

/**
 * Obtiene el rango (tier) del usuario basado en XP
 */
export function getRankByXp(xp: number) {
  return USER_RANKS.find((rank) => xp >= rank.minXp && xp < rank.maxXp) || USER_RANKS[0]
}

/**
 * @deprecated Use calculateLevel and getXpToNextLevel instead
 */
export function getXpToNextRank(currentXp: number): number {
  const currentRank = getRankByXp(currentXp)
  const nextRank = USER_RANKS[USER_RANKS.findIndex((r) => r.tier === currentRank.tier) + 1]

  if (!nextRank) return 0
  return nextRank.minXp - currentXp
}

export function getBadgeByCompletedBooks(completedBooks: number) {
  return USER_BADGES.find((badge) => completedBooks >= badge.minBooks && completedBooks <= badge.maxBooks) || null
}
