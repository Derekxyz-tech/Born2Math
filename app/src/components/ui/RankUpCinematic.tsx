'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function RankUpCinematic({ newRank, coinReward, onComplete }: { newRank: string, coinReward: number, onComplete: () => void }) {
  
  useEffect(() => {
    // 3.8s perfectly matches the visceral punchy COD animation
    const timer = setTimeout(() => {
      onComplete()
    }, 3800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden backdrop-blur-3xl">
      
      {/* Background radial blast */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 4, 3], opacity: [0, 1, 0.3] }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle,rgba(232,43,43,0.5)_0%,transparent_60%)] pointer-events-none"
      />

      {/* R A N K   U P  Text Crashing Down */}
      <motion.div 
        initial={{ y: -200, scale: 3, opacity: 0 }}
        animate={{ y: -80, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.2 }}
        className="absolute top-1/3 flex flex-col items-center drop-shadow-[0_0_30px_rgba(232,43,43,0.8)]"
      >
        <span className="text-[#8888A0] font-mono tracking-[0.5em] text-sm md:text-md uppercase mb-2">Promotion</span>
        <h1 className="text-white font-black text-6xl md:text-8xl tracking-tighter uppercase italic">RANK UP</h1>
      </motion.div>

      {/* The Actual New Rank blasting out WITH REALISTIC FIRE */}
      <motion.div
        initial={{ scale: 0, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 1.2 }}
        className="absolute top-1/2 flex flex-col items-center mt-12"
      >
        <div className="text-[#60C8FF] text-xs font-mono font-bold uppercase tracking-[0.3em] mb-4">
          New Class Unlocked
        </div>
        
        {/* CSS Realistic Fire Effect Container */}
        <div className="relative px-16 py-6 bg-[rgba(20,0,0,0.8)] border-2 border-[#E82B2B] rounded-xl shadow-[0_0_60px_rgba(232,43,43,0.8)] overflow-visible">
          
          {/* Internal Fire Glow radiating outwards */}
          <motion.div 
             animate={{ opacity: [0.6, 1, 0.6], filter: ['blur(15px)', 'blur(25px)', 'blur(15px)'] }}
             transition={{ repeat: Infinity, duration: 0.15 }}
             className="absolute inset-0 bg-[#E82B2B] mix-blend-screen opacity-70 z-0 rounded-xl"
          />

          <span 
            className="relative z-10 font-black text-6xl md:text-7xl block tracking-tighter"
            style={{
              color: '#fff',
              textShadow: '0 -2px 6px #fff, 0 -8px 15px #FFD700, 0 -18px 25px #ff8000, 0 -30px 50px #E82B2B',
              animation: 'fire-flicker 0.08s infinite alternate'
            }}
          >
            {newRank}
          </span>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fire-flicker {
              0% { text-shadow: 0 -2px 6px #fff, 0 -8px 15px #FFD700, 0 -18px 25px #ff8000, 0 -30px 50px #E82B2B; transform: translateY(0px) scale(1); }
              50% { text-shadow: 0 -3px 8px #fff, 0 -10px 18px #FFD700, 0 -20px 30px #ff8000, 0 -35px 55px #E82B2B; transform: translateY(-1px) scale(1.02); }
              100% { text-shadow: 0 -2px 7px #fff, 0 -9px 16px #FFD700, 0 -17px 27px #ff8000, 0 -32px 52px #E82B2B; transform: translateY(1px) scale(0.99); }
            }
          `}} />
        </div>

        {/* Coin Drop Notification */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          className="mt-16 font-mono text-[#FFB020] text-4xl font-black flex items-center gap-3 drop-shadow-[0_0_20px_rgba(255,176,32,0.8)] bg-[#FFB020]/10 px-6 py-2 border border-[#FFB020]/20 rounded-xl backdrop-blur-sm"
        >
          <span>+{coinReward.toLocaleString()}</span>
          <span>COINS</span>
        </motion.div>
      </motion.div>

      {/* Flashbang Flash over the screen */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.3, times: [0, 0.2, 1], ease: "easeOut" }}
        className="absolute inset-0 bg-white pointer-events-none"
      />

    </div>
  )
}
