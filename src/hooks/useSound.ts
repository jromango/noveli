import { useCallback } from 'react'

type SoundType = 'levelup' | 'achievement' | 'ding' | 'sparkle'

interface SoundConfig {
  volume: number
  frequency?: number
  duration?: number
}

export function useSound() {
  const playSound = useCallback((soundType: SoundType, config?: Partial<SoundConfig>) => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const volume = config?.volume ?? 0.3
      const now = audioContext.currentTime

      // Create gain node for volume control
      const gainNode = audioContext.createGain()
      gainNode.connect(audioContext.destination)
      gainNode.gain.setValueAtTime(volume, now)

      switch (soundType) {
        case 'levelup': {
          // Fanfare sound: ascending notes with harmonics
          const notes = [262, 330, 392, 523, 659] // C4, E4, G4, C5, E5 (C major scale)
          const noteDuration = 0.15

          notes.forEach((freq, index) => {
            const osc = audioContext.createOscillator()
            const oscGain = audioContext.createGain()

            osc.type = index % 2 === 0 ? 'sine' : 'square'
            osc.frequency.value = freq
            osc.connect(oscGain)
            oscGain.connect(gainNode)

            const startTime = now + index * noteDuration
            oscGain.gain.setValueAtTime(0.3, startTime)
            oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration)

            osc.start(startTime)
            osc.stop(startTime + noteDuration)
          })

          // Add a low bass note for epicness
          const bass = audioContext.createOscillator()
          const bassGain = audioContext.createGain()
          bass.type = 'sine'
          bass.frequency.value = 131 // C3
          bass.connect(bassGain)
          bassGain.connect(gainNode)
          bassGain.gain.setValueAtTime(0.2, now)
          bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
          bass.start(now)
          bass.stop(now + 0.5)
          break
        }

        case 'achievement': {
          // Ding sound: two harmonics
          const freq1 = 523 // C5
          const freq2 = 659 // E5
          const duration = 0.3

          const osc1 = audioContext.createOscillator()
          const osc2 = audioContext.createOscillator()
          const oscGain1 = audioContext.createGain()
          const oscGain2 = audioContext.createGain()

          osc1.type = 'sine'
          osc1.frequency.value = freq1
          osc1.connect(oscGain1)
          oscGain1.connect(gainNode)

          osc2.type = 'sine'
          osc2.frequency.value = freq2
          osc2.connect(oscGain2)
          oscGain2.connect(gainNode)

          oscGain1.gain.setValueAtTime(0.2, now)
          oscGain1.gain.exponentialRampToValueAtTime(0.01, now + duration)
          oscGain2.gain.setValueAtTime(0.15, now)
          oscGain2.gain.exponentialRampToValueAtTime(0.01, now + duration)

          osc1.start(now)
          osc1.stop(now + duration)
          osc2.start(now)
          osc2.stop(now + duration)
          break
        }

        case 'ding': {
          // Quick confirmation ding
          const osc = audioContext.createOscillator()
          const oscGain = audioContext.createGain()

          osc.type = 'sine'
          osc.frequency.value = 800
          osc.connect(oscGain)
          oscGain.connect(gainNode)

          oscGain.gain.setValueAtTime(0.25, now)
          oscGain.gain.quadraticRampToValueAtTime(0.01, now + 0.15)

          osc.start(now)
          osc.stop(now + 0.15)
          break
        }

        case 'sparkle': {
          // Sparkle effect: random frequency chirp
          const osc = audioContext.createOscillator()
          const oscGain = audioContext.createGain()

          osc.type = 'triangle'
          osc.frequency.setValueAtTime(200, now)
          osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2)
          osc.connect(oscGain)
          oscGain.connect(gainNode)

          oscGain.gain.setValueAtTime(0.15, now)
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

          osc.start(now)
          osc.stop(now + 0.2)
          break
        }
      }
    } catch (error) {
      // Fallback si el browser no soporta Web Audio API
      console.warn('Audio API not available:', error)
    }
  }, [])

  return { playSound }
}
