'use client'

import { motion } from 'framer-motion'
import { Trophy, Clock, Target, Flame } from 'lucide-react'

interface ResultsProps {
  stats: {
    earnedXp: number,
    earnedCoins: number,
    timeMs: number,
    baseXp: number,
    streakCurrent: number
  }
  onClose: () => void
}

const containerVars = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2, type: "spring" as const } }
}

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300 } }
}

export default function ResultsOverlay({ stats, onClose }: ResultsProps) {
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[rgba(18,18,26,0.8)] backdrop-blur-md"
    >
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="w-full max-w-md bg-[rgba(24,24,32,1)] border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        <motion.div variants={itemVars} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(0,217,126,0.1)] mb-4">
            <Target className="text-[#00D97E]" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Target Eliminated</h2>
          <p className="text-[#8888A0] font-mono text-xs uppercase tracking-widest mt-2">{stats.timeMs <= 5000 ? 'Blitz Speed' : 'Standard Clear'}</p>
        </motion.div>

        <div className="space-y-3 mb-8">
          {/* Reaction Time */}
          <motion.div variants={itemVars} className="flex justify-between items-center p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-3 text-[#8888A0]">
              <Clock size={16} />
              <span className="font-semibold text-sm">Reaction Time</span>
            </div>
            <span className="font-mono text-white text-lg">{(stats.timeMs / 1000).toFixed(2)}s</span>
          </motion.div>

          {/* XP Farmed */}
          <motion.div variants={itemVars} className="flex justify-between items-center p-4 rounded-xl bg-[rgba(96,200,255,0.05)] border border-[rgba(96,200,255,0.1)]">
            <div className="flex items-center gap-3 text-[#60C8FF]">
              <Trophy size={16} />
              <span className="font-semibold text-sm">Experience Gained</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#60C8FF] text-lg">+{stats.earnedXp}</span>
              <span className="text-[10px] text-[rgba(96,200,255,0.5)]">/ {stats.baseXp}</span>
            </div>
          </motion.div>

          {/* Coins Farmed */}
          <motion.div variants={itemVars} className="flex justify-between items-center p-4 rounded-xl bg-[rgba(255,176,32,0.05)] border border-[rgba(255,176,32,0.1)]">
            <div className="flex items-center gap-3 text-[#FFB020]">
              <div className="w-4 h-4 rounded-full bg-[#FFB020]"></div>
              <span className="font-semibold text-sm">Coins Mined</span>
            </div>
            <span className="font-mono font-bold text-[#FFB020] text-lg">+{stats.earnedCoins}</span>
          </motion.div>

          {/* Streak Update */}
          {stats.streakCurrent > 0 && (
            <motion.div variants={itemVars} className="flex justify-between items-center p-4 rounded-xl bg-[rgba(232,43,43,0.05)] border border-[rgba(232,43,43,0.1)]">
              <div className="flex items-center gap-3 text-[#E82B2B]">
                <Flame size={16} />
                <span className="font-semibold text-sm">Sovereign Streak</span>
              </div>
              <span className="font-mono font-bold text-[#E82B2B] text-lg">{stats.streakCurrent} Days</span>
            </motion.div>
          )}

        </div>

        <motion.button 
          variants={itemVars}
          onClick={onClose}
          className="w-full bg-white text-black font-bold p-4 rounded-xl uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          Continue Hunt
        </motion.button>
      </motion.div>

    </motion.div>
  )
}
