import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface CircularProgressProps {
  current: number
  target: number
  theme: 'dark' | 'light'
  label: string
  showSparkle?: boolean
}

export default function CircularProgress({
  current,
  target,
  theme,
  label,
  showSparkle = true,
}: CircularProgressProps) {
  const isDark = theme === 'dark'
  const percentage = Math.min(100, (current / target) * 100)
  const isComplete = percentage >= 100
  const [showAnimation, setShowAnimation] = useState(false)
  const circumference = 2 * Math.PI * 45

  useEffect(() => {
    if (isComplete && !showAnimation) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, showAnimation])

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Circular Progress */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="3"
            stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}
          />
        </svg>

        {/* Progress circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{
              strokeDashoffset: circumference - (percentage / 100) * circumference,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            stroke="url(#pageGradient)"
            strokeLinecap="round"
            style={{
              filter: isDark
                ? `drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))`
                : `drop-shadow(0 0 6px rgba(249, 115, 22, 0.3))`,
            }}
          />
          <defs>
            <linearGradient id="pageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold" style={{ color: isDark ? '#F5F1E8' : '#3B2F24' }}>
            {Math.round(percentage)}%
          </p>
          <p className="text-xs opacity-60">{current} / {target}</p>

          {/* Sparkle burst on completion */}
          {showAnimation && isComplete && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{
                    opacity: 0,
                    scale: 2,
                    x: Math.cos((i / 6) * Math.PI * 2) * 40,
                    y: Math.sin((i / 6) * Math.PI * 2) * 40,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <Star
                    size={16}
                    fill="#FFD700"
                    color="#FFD700"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))' }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-[0.1em] opacity-70">{label}</p>

      {/* Completion badge */}
      {isComplete && (
        <motion.div
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)',
            color: isDark ? '#22c55e' : '#16a34a',
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)'}`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Star size={12} fill="currentColor" /> ¡Logro completado!
        </motion.div>
      )}
    </motion.div>
  )
}
