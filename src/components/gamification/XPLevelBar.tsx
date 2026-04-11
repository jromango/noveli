import React from 'react'
import { Crown } from 'lucide-react'
import { calculateLevel, getXpInCurrentLevel, getLevelProgress, getXpToNextLevel, getRankByXp, XP_CONFIG } from '../../lib/gamification'
import { motion } from 'framer-motion'

interface XPLevelBarProps {
  currentXp: number
  theme: 'dark' | 'light'
}

export default function XPLevelBar({ currentXp, theme }: XPLevelBarProps) {
  const isDark = theme === 'dark'
  const currentLevel = calculateLevel(currentXp)
  const currentRank = getRankByXp(currentXp)
  const xpToNextLevel = getXpToNextLevel(currentXp)
  const progressPercent = getLevelProgress(currentXp)

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="relative overflow-hidden rounded-[24px] p-5 border backdrop-blur-xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
          borderColor: isDark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(196, 164, 132, 0.25)',
          boxShadow: isDark
            ? '0 0 20px rgba(59, 130, 246, 0.15), inset 0 0 12px rgba(139, 92, 246, 0.08)'
            : '0 0 16px rgba(59, 130, 246, 0.1), inset 0 0 8px rgba(139, 92, 246, 0.06)',
        }}
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 opacity-30 -z-10"
          style={{
            background: 'linear-gradient(270deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
            backgroundSize: '300% 100%',
            animation: isDark ? 'xpGradientShift 8s ease-in-out infinite' : 'none',
          }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Level and Rank Info */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full border-2 flex-shrink-0"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(196, 164, 132, 0.15) 0%, rgba(196, 164, 132, 0.08) 100%)',
                borderColor: isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(196, 164, 132, 0.3)',
                boxShadow: isDark
                  ? '0 0 16px rgba(212, 175, 55, 0.25), inset 0 0 8px rgba(212, 175, 55, 0.12)'
                  : '0 0 12px rgba(196, 164, 132, 0.18), inset 0 0 6px rgba(196, 164, 132, 0.08)',
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Crown
                  size={32}
                  style={{
                    color: isDark ? '#D4AF37' : '#C4A484',
                    filter: isDark ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))' : 'drop-shadow(0 0 4px rgba(196, 164, 132, 0.3))',
                  }}
                  fill={isDark ? '#D4AF37' : '#C4A484'}
                />
              </motion.div>
            </div>
            <div>
              <p
                className="text-xs uppercase font-bold tracking-[0.15em] opacity-75"
                style={{ color: isDark ? '#D4AF37' : '#C4A484' }}
              >
                Nivel {currentLevel}
              </p>
              <p
                className="text-sm sm:text-base font-bold"
                style={{ color: isDark ? '#F5F1E8' : '#3B2F24' }}
              >
                {currentRank.name}
              </p>
              <p className="text-xs opacity-60 mt-0.5">
                {currentRank.emoji} {xpToNextLevel > 0 ? `${xpToNextLevel} XP para siguiente nivel` : 'Nivel máximo'}
              </p>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="flex-1 min-w-[150px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold opacity-60">{currentXp} XP</span>
              <span className="text-xs font-bold text-cyan-400">{progressPercent}%</span>
            </div>
            <div
              className="relative h-3 rounded-full overflow-hidden border"
              style={{
                background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)',
                borderColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(196, 164, 132, 0.2)',
              }}
            >
              <motion.div
                className="h-full rounded-full xp-level-gradient animate-xp-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  boxShadow: isDark
                    ? '0 0 12px rgba(59, 130, 246, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.2)'
                    : '0 0 8px rgba(139, 92, 246, 0.4), inset 0 0 4px rgba(255, 255, 255, 0.4)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
