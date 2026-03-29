'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface PublicProfileData {
  userId: string
  username: string
  rank: string
  globalRank: number
  totalSolved: number
  accuracy: number
  avgTime: number
  activeCosmetic: string
}

export default function PublicProfileModal({
  isOpen,
  onClose,
  data,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  data: PublicProfileData | null
  loading: boolean
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  // Helper to extract initials
  const initials = data?.username.substring(0, 2).toUpperCase() || '??'
  
  // Format cosmetic title (e.g., 'plate_crimson' -> 'Crimson Plate')
  // We don't have the full map here, so we do a simple format
  const titleMap: Record<string, string> = {
    'default': 'Rookie',
    'plate_crimson': 'Crimson Vanguard',
    'plate_void': 'Void Walker',
    'plate_gold': 'Sovereign King'
  }
  const displayTitle = data ? (titleMap[data.activeCosmetic] || data.activeCosmetic) : 'Loading...'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#00000099] backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm bg-[#111114] border border-[#22222A] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#8888A0] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {loading || !data ? (
            <div className="p-12 text-center text-[#8888A0] font-mono tracking-widest text-sm uppercase">
              <div className="w-8 h-8 rounded-full border-2 border-t-[#E82B2B] border-white/10 animate-spin mx-auto mb-4" />
              Scanning Matrix...
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-5">
              
              {/* Profile Hero */}
              <div className="pt-8 pb-6 px-6 rounded-2xl bg-gradient-to-b from-[#E82B2B]/20 to-[#E82B2B]/5 border border-[#E82B2B]/20 text-center relative overflow-hidden shadow-inner">
                {/* Background glow orb */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#E82B2B]/30 rounded-full blur-[40px] pointer-events-none" />
                
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E82B2B]/30 to-purple-500/20 border-2 border-[#E82B2B]/40 flex items-center justify-center font-mono font-black text-3xl text-white shadow-[0_0_20px_rgba(232,43,43,0.3)]">
                    {initials}
                  </div>
                  <div className="absolute -bottom-2 -right-3 bg-[#E82B2B] text-white font-black text-[11px] px-2 py-1 rounded-lg border-2 border-[#111114] uppercase tracking-widest">
                    {data.rank}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-white tracking-tight mb-1">{data.username}</h3>
                <p className="font-serif italic text-[#8888A0] text-sm mb-4">{displayTitle}</p>
                
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#E82B2B] bg-[#E82B2B]/10 border border-[#E82B2B]/20 px-3 py-1.5 rounded-full">
                  <span>Global Rank</span>
                  <span className="font-mono text-white text-xs">#{data.globalRank}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center transition-colors">
                  <span className="font-mono text-2xl font-medium text-white block">
                    {data.totalSolved.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-[#8888A0] font-bold tracking-[0.1em] uppercase block mt-1">
                    Problems Solved
                  </span>
                </div>
                
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center transition-colors">
                  <span className="font-mono text-2xl font-medium block" style={{ color: data.accuracy >= 90 ? '#00D97E' : (data.accuracy >= 75 ? '#FFB020' : '#E82B2B') }}>
                    {data.accuracy}%
                  </span>
                  <span className="text-[9px] text-[#8888A0] font-bold tracking-[0.1em] uppercase block mt-1">
                    Overall Accuracy
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center transition-colors">
                  <span className="font-mono text-2xl font-medium text-white block">
                    {data.avgTime}s
                  </span>
                  <span className="text-[9px] text-[#8888A0] font-bold tracking-[0.1em] uppercase block mt-1">
                    Avg Response
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center transition-colors flex flex-col justify-center items-center">
                  <div className="flex -space-x-2">
                    {/* Simulated equipped cosmetic icons based on activeCosmetic */}
                    <div className="w-8 h-8 rounded-full border border-[#22222A] bg-[#1A1A22] flex items-center justify-center text-xs">👑</div>
                    <div className="w-8 h-8 rounded-full border border-[#22222A] bg-[#1A1A22] flex items-center justify-center text-xs opacity-50">🌑</div>
                  </div>
                  <span className="text-[9px] text-[#8888A0] font-bold tracking-[0.1em] uppercase block mt-3">
                    Equipped
                  </span>
                </div>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
