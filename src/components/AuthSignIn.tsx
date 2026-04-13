import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock } from 'lucide-react'

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
        <label className="block text-sm font-medium text-gold mb-1">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full px-3 py-2 bg-black border border-gold/40 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition"
        />
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 bg-black border border-gold/40 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition"
        />
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅')
            ? 'bg-green-900/20 text-green-400 border border-green-600/30'
            : 'bg-red-900/20 text-red-400 border border-red-600/30'
        }`}>
          {message}
        </div>
      )}

      {/* Botón Iniciar sesión */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gold text-black rounded-lg font-semibold hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Entrando...' : 'Entrar a Círculo Noveli'}
      </button>

      {/* Links */}
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className="flex-1 text-gold hover:text-gold/80 transition text-center"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div className="text-center text-sm text-gold">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold hover:text-gold/80 transition"
        >
          Regístrate
        </button>
      </div>
    </form>
  )
}
