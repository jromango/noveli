import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, BarChart3, Globe, MessageCircle } from 'lucide-react'

interface GlobalSidebarProps {
  isDarkMode: boolean
}

const ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: Home },
  { to: '/analytics', label: 'Estadísticas', icon: BarChart3 },
  { to: '/explore', label: 'Explorar', icon: Globe },
  { to: '/community', label: 'Comunidad', icon: MessageCircle },
]

export default function GlobalSidebar({ isDarkMode }: GlobalSidebarProps) {
  return (
    <aside className="fixed left-5 top-24 z-50 hidden md:block" aria-label="Navegacion principal lateral">
      <div
        className="rounded-[28px] border p-2.5 backdrop-blur-md"
        style={{
          borderColor: isDarkMode ? 'rgba(212,175,55,0.18)' : 'rgba(196,164,132,0.22)',
          background: isDarkMode ? 'rgba(8,8,8,0.42)' : 'rgba(255,255,255,0.66)',
          boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.36)' : '0 12px 28px rgba(120,90,35,0.15)',
        }}
      >
        <div className="flex flex-col gap-2">
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className="group relative"
              aria-label={item.label}
              title={item.label}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300',
                      isActive
                        ? 'border-[#D4AF37]/55 text-[#D4AF37]'
                        : isDarkMode
                        ? 'border-white/10 text-[#AAA091] hover:border-[#D4AF37]/35 hover:text-[#D4AF37]'
                        : 'border-[#C4A484]/25 text-[#7E6A54] hover:border-[#C4A484]/45 hover:text-[#C4A484]',
                    ].join(' ')}
                    style={
                      isActive
                        ? {
                            boxShadow: '0 0 12px rgba(212,175,55,0.22), inset 0 0 10px rgba(212,175,55,0.12)',
                            background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.03) 65%, transparent 100%)',
                          }
                        : undefined
                    }
                  >
                    <item.icon size={16} />
                  </span>

                  <span
                    className="pointer-events-none absolute left-[58px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-normal opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                    style={{
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                      background: isDarkMode ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.92)',
                      color: isDarkMode ? '#FFFFFF' : '#3B2F24',
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  )
}
