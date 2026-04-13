import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import NLogo from './NLogo'
import AuthSignIn from './AuthSignIn'
import AuthSignUp from './AuthSignUp'
import AuthForgotPassword from './AuthForgotPassword'
import { Chrome, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface AuthScreenProps {
  onAuthSuccess: () => void
}

type AuthView = 'signin' | 'signup' | 'forgot'

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authView, setAuthView] = useState<AuthView>('signin')
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuario autenticado:', session.user.email)

        // Crear perfil automáticamente si no existe
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  username: session.user.user_metadata?.name || session.user.email?.split('@')[0],
                  xp: 0,
                  rank: 'Lector Curioso',
                },
              ])

            if (profileError) {
              console.error('❌ Error creando perfil:', profileError)
            } else {
              console.log('✅ Perfil creado automáticamente')
            }
          }
        } catch (error) {
          console.error('❌ Error verificando perfil:', error)
        }

        onAuthSuccess()
      }
    })

    return () => subscription.unsubscribe()
  }, [onAuthSuccess])

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) console.error('Error con Google:', error)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoadingGoogle(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDarkMode ? 'bg-[#0A0A0A]' : 'bg-[#F8F2E8]'
    }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full border transition-all ${
          isDarkMode
            ? 'bg-black/40 border-gold/30 text-gold hover:bg-black/60 hover:border-gold/50'
            : 'bg-white/40 border-amber-600/30 text-amber-700 hover:bg-white/60 hover:border-amber-600/50'
        }`}
        title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-[28px] border shadow-2xl flex items-center justify-center transition-all ${
            isDarkMode
              ? 'bg-black border-gold/30 shadow-gold/20'
              : 'bg-white border-amber-600/30 shadow-amber-600/10'
          }`}>
            <NLogo size={64} />
          </div>
          <h1 className={`font-serif text-4xl font-bold mb-2 ${
            isDarkMode ? 'text-gold' : 'text-amber-900'
          }`}>
            Círculo Noveli
          </h1>
          <p className={`font-sans text-lg ${
            isDarkMode ? 'text-gold/60' : 'text-amber-700/70'
          }`}>
            Tu biblioteca personal de lujo
          </p>
        </div>

        {/* Auth Form Container */}
        <div className={`rounded-lg border p-6 shadow-2xl transition-all ${
          isDarkMode
            ? 'bg-secondary border-gold/30 shadow-gold/20'
            : 'bg-amber-50/80 border-amber-600/20 shadow-amber-600/10'
        }`}>
          {authView === 'signin' && (
            <>
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle}
                className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed mb-4 ${
                  isDarkMode
                    ? 'border-gold/40 hover:border-gold/70 text-white hover:bg-gold/10'
                    : 'border-amber-600/40 hover:border-amber-600/70 text-amber-900 hover:bg-amber-600/10'
                }`}
              >
                <Chrome size={20} />
                {isLoadingGoogle ? 'Conectando...' : 'Entrar con Google'}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${
                    isDarkMode ? 'border-gold/30' : 'border-amber-600/20'
                  }`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${
                    isDarkMode
                      ? 'bg-secondary text-gold/60'
                      : 'bg-amber-50/80 text-amber-700/60'
                  }`}>o</span>
                </div>
              </div>

              {/* Sign In Form */}
              <AuthSignIn
                onSuccess={onAuthSuccess}
                onSwitchToSignUp={() => setAuthView('signup')}
                onForgotPassword={() => setAuthView('forgot')}
              />
            </>
          )}

          {authView === 'signup' && (
            <AuthSignUp
              onSuccess={onAuthSuccess}
              onSwitchToSignIn={() => setAuthView('signin')}
            />
          )}

          {authView === 'forgot' && (
            <AuthForgotPassword
              onBack={() => setAuthView('signin')}
            />
          )}
        </div>

        {/* Footer */}
        <p className={`text-center text-xs mt-6 ${
          isDarkMode ? 'text-gold/50' : 'text-amber-700/50'
        }`}>
          Al entrar aceptas nuestros términos y condiciones de privacidad
        </p>
      </div>
    </div>
  )
}
