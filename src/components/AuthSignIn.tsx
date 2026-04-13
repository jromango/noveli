import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface AuthSignInProps {
  onSuccess: () => void
  onSwitchToSignUp: () => void
  onForgotPassword: () => void
}

export default function AuthSignIn({ onSuccess, onSwitchToSignUp, onForgotPassword }: AuthSignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('✅ Sesión iniciada exitosamente')
        setTimeout(() => onSuccess(), 1000)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error inesperado. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      {/* Email */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gold' : 'text-amber-700'
        }`}>Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className={`w-full px-3 py-2 rounded-lg placeholder-opacity-40 focus:outline-none focus:border-2 transition ${
            isDarkMode
              ? 'bg-black border border-gold/40 text-white placeholder-white focus:border-gold'
              : 'bg-white border border-amber-600/40 text-amber-900 placeholder-amber-700 focus:border-amber-600'
          }`}
        />
      </div>

      {/* Contraseña */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gold' : 'text-amber-700'
        }`}>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={`w-full px-3 py-2 rounded-lg placeholder-opacity-40 focus:outline-none focus:border-2 transition ${
            isDarkMode
              ? 'bg-black border border-gold/40 text-white placeholder-white focus:border-gold'
              : 'bg-white border border-amber-600/40 text-amber-900 placeholder-amber-700 focus:border-amber-600'
          }`}
        />
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅')
            ? isDarkMode
              ? 'bg-green-900/20 text-green-400 border border-green-600/30'
              : 'bg-green-50 text-green-700 border border-green-300'
            : isDarkMode
              ? 'bg-red-900/20 text-red-400 border border-red-600/30'
              : 'bg-red-50 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}

      {/* Botón Iniciar sesión */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
          isDarkMode
            ? 'bg-gold text-black hover:bg-gold/90'
            : 'bg-amber-600 text-white hover:bg-amber-700'
        }`}
      >
        {isLoading ? 'Entrando...' : 'Entrar a Círculo Noveli'}
      </button>

      {/* Links */}
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className={`flex-1 transition text-center hover:opacity-70 ${
            isDarkMode ? 'text-gold' : 'text-amber-700'
          }`}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div className={`text-center text-sm ${isDarkMode ? 'text-gold' : 'text-amber-700'}`}>
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold hover:opacity-70 transition"
        >
          Regístrate
        </button>
      </div>
    </form>
  )
}
