import React from 'react'
import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

interface StreakFireIconProps {
  streak: number
  theme: 'dark' | 'light'
}

export default function StreakFireIcon({ streak, theme }: StreakFireIconProps) {
  const isDark = theme === 'dark'
  
  // Determine fire intensity based on streak
  const fireSize = Math.min(80, 40 + Math.floor(streak / 5) * 5)
  
  // Determine color gradient based on streak
  let gradientStart = '#f97316' // orange
  let gradientEnd = '#fb923c' // light orange
  
  if (streak >= 7) {
    gradientStart = '#8b5cf6' // violet
    gradientEnd = '#06b6d4' // cyan
  } else if (streak >= 14) {
    gradientStart = '#3b82f6' // blue
    gradientEnd = '#06b6d4' // cyan
  }

  const glowColor = streak >= 7 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(249, 115, 22, 0.6)'

  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Fire Icon Container */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full opacity-40 blur-xl"
          style={{
            width: fireSize + 20,
            height: fireSize + 20,
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            filter: streak >= 7 ? 'blur(20px)' : 'blur(16px)',
          }}
        />

        {/* Fire Icon */}
        <motion.div
          animate={{
            filter: [
              `drop-shadow(0 0 12px ${glowColor})`,
              `drop-shadow(0 0 24px ${glowColor})`,
              `drop-shadow(0 0 12px ${glowColor})`,
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Flame
            size={fireSize}
            fill={gradientStart}
            color={gradientStart}
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </motion.div>

        {/* Streak Counter Badge */}
        <motion.div
          className="absolute -bottom-2 -right-2 flex items-center justify-center w-14 h-14 rounded-full font-bold text-lg"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(196, 164, 132, 0.2) 0%, rgba(196, 164, 132, 0.1) 100%)',
            border: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(196, 164, 132, 0.3)'}`,
            color: isDark ? '#D4AF37' : '#C4A484',
            boxShadow: isDark
              ? '0 0 12px rgba(212, 175, 55, 0.3), inset 0 0 8px rgba(212, 175, 55, 0.1)'
              : '0 0 8px rgba(196, 164, 132, 0.2), inset 0 0 4px rgba(196, 164, 132, 0.08)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {streak}
        </motion.div>
      </motion.div>

      {/* Streak Text */}
      <div className="text-center">
        <p className="text-xs uppercase font-bold tracking-[0.1em] opacity-70">Racha diaria</p>
        <p className="text-sm font-semibold mt-1" style={{ color: isDark ? '#D4AF37' : '#C4A484' }}>
          {streak === 1 ? '1 día' : `${streak} días`}
        </p>
        {streak >= 7 && (
          <motion.p
            className="text-xs mt-2"
            style={{
              background: streak >= 14
                ? 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)'
                : 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'bold',
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ¡{streak >= 14 ? 'Legendario' : 'Excelente'}!
          </motion.p>
        )}
      </div>

      {/* Motivation text */}
      <motion.p
        className="text-xs text-center opacity-60 max-w-[120px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.3 }}
      >
        {streak >= 14 ? '¡Mantén la llama ardiendo!' : streak >= 7 ? '¡Vas muy bien!' : 'Sigue leyendo cada día'}
      </motion.p>
    </motion.div>
  )
}
