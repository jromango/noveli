import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTheme } from '../context/ThemeContext'

interface AuthSignUpProps {
  onSuccess: () => void
  onSwitchToSignIn: () => void
}

const COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'Espana', 'Guatemala', 'Guinea Ecuatorial', 'Honduras',
  'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Puerto Rico', 'Republica Dominicana',
  'Uruguay', 'Venezuela', 'Otros',
]

export default function AuthSignUp({ onSuccess, onSwitchToSignIn }: AuthSignUpProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    country: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido'
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido'
    if (!formData.username.trim()) newErrors.username = 'El alias es requerido'
    if (formData.username.length < 3) newErrors.username = 'El alias debe tener al menos 3 caracteres'
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Email invalido'
    if (formData.password.length < 6) newErrors.password = 'La contrasena debe tener al menos 6 caracteres'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contrasenas no coinciden'
    if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida'
    if (!formData.country) newErrors.country = 'Selecciona un pais'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setMessage('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setMessage(`Error en autenticacion: ${authError.message}`)
        return
      }

      if (!authData.user) {
        setMessage('Error creando la cuenta')
        return
      }

      const fullProfilePayload = {
        id: authData.user.id,
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate,
        country: formData.country,
        phone: formData.phone || null,
        xp: 0,
        rank: 'Lector Curioso',
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([fullProfilePayload])

      if (profileError) {
        // Fallback: intenta crear un perfil minimo por compatibilidad
        const { error: fallbackError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: formData.username,
              xp: 0,
              rank: 'Lector Curioso',
            },
          ])

        if (fallbackError) {
          // La cuenta ya fue creada en Auth; no bloquear al usuario por el perfil.
          console.error('Error creando perfil completo:', profileError)
          console.error('Error creando perfil fallback:', fallbackError)
          setMessage('✅ Cuenta creada. Revisa tu email para confirmar. El perfil se completara al iniciar sesion.')
          window.setTimeout(() => onSwitchToSignIn(), 1800)
          return
        }
      }

      // Si Supabase devuelve sesion, entra directo a la app.
      if (authData.session) {
        setMessage('✅ Cuenta creada. Entrando a tu biblioteca...')
        window.setTimeout(() => onSuccess(), 700)
        return
      }

      // Fallback: intentar login automatico por credenciales.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInData.session && !signInError) {
        setMessage('✅ Cuenta creada. Entrando a tu biblioteca...')
        window.setTimeout(() => onSuccess(), 700)
        return
      }

      setMessage('✅ Cuenta creada. Inicia sesion para entrar.')
      window.setTimeout(() => onSwitchToSignIn(), 1400)
    } catch {
      setMessage('Error inesperado. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const inputBase = isDarkMode
    ? 'w-full px-3 py-2 rounded-lg bg-black border border-gold/40 text-white placeholder-white/40 focus:outline-none focus:border-gold transition'
    : 'w-full px-3 py-2 rounded-lg bg-white border border-amber-600/40 text-amber-900 placeholder-amber-700/60 focus:outline-none focus:border-amber-600 transition'

  const labelBase = isDarkMode ? 'block text-sm font-medium text-gold mb-1' : 'block text-sm font-medium text-amber-700 mb-1'

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBase}>Nombre</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Juan" className={`${inputBase} ${errors.firstName ? 'border-red-500' : ''}`} />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className={labelBase}>Apellido</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Perez" className={`${inputBase} ${errors.lastName ? 'border-red-500' : ''}`} />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className={labelBase}>Alias (usuario)</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="juanPerez" className={`${inputBase} ${errors.username ? 'border-red-500' : ''}`} />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className={labelBase}>Correo electronico</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@correo.com" className={`${inputBase} ${errors.email ? 'border-red-500' : ''}`} />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className={labelBase}>Fecha de nacimiento</label>
        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={`${inputBase} ${errors.birthDate ? 'border-red-500' : ''}`} />
        {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
      </div>

      <div>
        <label className={labelBase}>Pais</label>
        <select name="country" value={formData.country} onChange={handleChange} className={`${inputBase} ${errors.country ? 'border-red-500' : ''}`}>
          <option value="">Selecciona tu pais</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
      </div>

      <div>
        <label className={labelBase}>Telefono (opcional)</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+56 9 12345678" className={inputBase} />
      </div>

      <div>
        <label className={labelBase}>Contrasena</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" className={`${inputBase} ${errors.password ? 'border-red-500' : ''}`} />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className={labelBase}>Confirmar contrasena</label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" className={`${inputBase} ${errors.confirmPassword ? 'border-red-500' : ''}`} />
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

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

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
          isDarkMode ? 'bg-gold text-black hover:bg-gold/90' : 'bg-amber-600 text-white hover:bg-amber-700'
        }`}
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <button
        type="button"
        onClick={onSwitchToSignIn}
        className={`w-full text-sm transition hover:opacity-70 ${isDarkMode ? 'text-gold' : 'text-amber-700'}`}
      >
        Ya tienes cuenta? Inicia sesion
      </button>
    </form>
  )
}
