import React from 'react'
import NLogo from './NLogo'

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-primary flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
        <div className="rounded-[28px] bg-black p-6 shadow-2xl shadow-gold/20 border border-gold/30">
          <NLogo size={120} className="block" background />
        </div>
        <div>
          <p className="font-serif text-4xl text-gold tracking-[0.18em]">N</p>
          <p className="font-sans text-accent/80 mt-2">Círculo Noveli</p>
        </div>
      </div>
    </div>
  )
}
