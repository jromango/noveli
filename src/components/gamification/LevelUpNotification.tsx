import React, { useEffect, useState } from 'react'
import { Crown, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from '../../hooks/useSound'

interface LevelUpNotificationProps {
  level: number
  theme: 'dark' | 'light'
  isVisible: boolean
  onClose?: () => void
}

// Confetti particle component
const ConfettiPiece: React.FC<{ index: number }> = ({ index }) => {
  const randomDelay = Math.random() * 0.2
  const randomDuration = 2 + Math.random() * 0.5
  const randomX = (Math.random() - 0.5) * 400
  const randomRotation = Math.random() * 360

  return (
    <motion.div
      className="fixed pointer-events-none"
      initial={{
        x: 0,
        y: -20,
        opacity: 1,
        rotate: 0,
      }}
      animate={{
        x: randomX,
        y: window.innerHeight,
        opacity: 0,
        rotate: randomRotation,
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeIn',
      }}
      style={{
        left: '50%',
        top: '50%',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: ['#FFD700', '#FF6B9D', '#00D9FF', '#00FF88', '#FFB500'][index % 5],
      }}
    />
  )
}

export default function LevelUpNotification({
  level,
  theme,
  isVisible,
  onClose,
}: LevelUpNotificationProps) {
  const isDark = theme === 'dark'
  const { playSound } = useSound()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Play level up sound
      playSound('levelup', { volume: 0.35 })
      setShowConfetti(true)

      // Auto-close after 3.5 seconds
      const timer = setTimeout(() => {
        onClose?.()
      }, 3500)

      return () => clearTimeout(timer)
    }
  }, [isVisible, playSound, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Confetti shower */}
          {showConfetti && (
            <>
              {[...Array(40)].map((_, i) => (
                <ConfettiPiece key={i} index={i} />
              ))}
            </>
          )}

          {/* Main notification */}
          <motion.div
            className="fixed top-20 right-4 sm:right-6 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{
              duration: 0.4,
              type: 'spring',
              stiffness: 120,
              damping: 15,
            }}
          >
            <div
              className="relative overflow-hidden rounded-[20px] border p-5 sm:p-6 shadow-2xl backdrop-blur-2xl"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(196, 164, 132, 0.18) 0%, rgba(196, 164, 132, 0.1) 100%)',
                borderColor: isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(196, 164, 132, 0.4)',
                boxShadow: isDark
                  ? '0 8px 32px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                  : '0 8px 32px rgba(196, 164, 132, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              }}
            >
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                  background: 'linear-gradient(270deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0))',
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-4 max-w-sm">
                {/* Crown Icon */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Crown
                    size={40}
                    style={{
                      color: isDark ? '#FFD700' : '#D4A574',
                      filter: isDark
                        ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))'
                        : 'drop-shadow(0 0 8px rgba(212, 165, 116, 0.6))',
                    }}
                    fill={isDark ? '#FFD700' : '#D4A574'}
                  />
                </motion.div>

                {/* Text Content */}
                <div>
                  <motion.p
                    className="text-xs uppercase font-bold tracking-[0.2em] mb-1"
                    style={{ color: isDark ? '#D4AF37' : '#C4A484' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    ¡Nivel desbloqueado!
                  </motion.p>
                  <motion.h3
                    className="font-serif text-2xl sm:text-3xl font-bold"
                    style={{ color: isDark ? '#F5F1E8' : '#3B2F24' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
                  >
                    Eres Nivel {level}
                  </motion.h3>
                </div>

                {/* Sparkles animation */}
                <motion.div className="absolute -top-2 -right-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                        x: Math.cos((i / 3) * Math.PI * 2) * 30,
                        y: Math.sin((i / 3) * Math.PI * 2) * 30,
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                      }}
                    >
                      <Sparkles size={16} color={isDark ? '#FFD700' : '#D4A574'} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
