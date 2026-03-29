'use client'
import { useEffect, useState } from 'react'
import { fetchDungeonStateAction, claimDailyDungeonBonusAction } from '@/app/actions/dungeonActions'
import Link from 'next/link'
import { Timer, Crosshair, Skull, CheckCircle2, Lock } from 'lucide-react'

export default function DungeonHub() {
  const [state, setState] = useState<{speed: boolean, accuracy: boolean, boss: boolean, claimed: boolean} | null>(null)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await fetchDungeonStateAction()
      setState(data)
    }
    load()
  }, [])

  const handleClaim = async () => {
    if (claiming) return
    setClaiming(true)
    const res = await claimDailyDungeonBonusAction()
    if (res.success) {
      setState(prev => prev ? { ...prev, claimed: true } : null)
      alert(res.message) // In production, route this to a unified toast notification
    }
    setClaiming(false)
  }

  if (!state) return <div className="w-full h-[120px] bg-[#111114] rounded-[32px] animate-pulse mb-8"></div>

  const allCleared = state.speed && state.accuracy && state.boss

  return (
    <div className="w-full bg-[#111114] rounded-[40px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.02)] mb-8 flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[rgba(232,43,43,0.02)] to-transparent group-hover:from-[rgba(232,43,43,0.05)] transition-all duration-700 pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 z-10">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8888A0] tracking-tight">Daily Dungeons</h2>
          <span className="text-xs text-[#8888A0] tracking-widest font-bold uppercase block mt-1">Midnight UTC Reset</span>
        </div>
        
        {allCleared && !state.claimed ? (
          <button 
            onClick={handleClaim} 
            disabled={claiming}
            className="px-6 py-3 bg-[#E82B2B] hover:bg-[#FF4444] text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-[0_10px_20px_rgba(232,43,43,0.4)] transition-all animate-bounce"
          >
            {claiming ? 'Extracting...' : 'Claim 5000XP / 1000🪙'}
          </button>
        ) : state.claimed ? (
          <div className="px-6 py-3 bg-[rgba(0,217,126,0.1)] text-[#00D97E] font-black rounded-2xl text-xs tracking-widest uppercase shadow-inner flex items-center gap-2">
            <CheckCircle2 size={16} /> Vault Claimed
          </div>
        ) : (
          <div className="px-6 py-3 bg-[#18181A] text-[#4A4A5A] font-bold rounded-2xl text-xs tracking-widest uppercase shadow-inner flex items-center gap-2">
            <Lock size={14} /> Clear 3 to Unlock
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
        
        {/* Speed Run */}
        <Link href={state.speed ? '#' : '/app/dungeon/speed'} className={`rounded-[24px] p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.01)] flex flex-col justify-between h-[160px] relative transition-all duration-300 ${state.speed ? 'bg-[#0A0A0C] opacity-50 cursor-not-allowed' : 'bg-[#18181C] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] cursor-pointer'}`}>
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-[16px] shadow-inner ${state.speed ? 'bg-[rgba(0,217,126,0.1)]' : 'bg-[rgba(96,200,255,0.05)]'}`}>
              {state.speed ? <CheckCircle2 className="text-[#00D97E]" size={24} /> : <Timer className="text-[#60C8FF]" size={24} />}
            </div>
          </div>
          <div>
            <span className={`text-xl font-black block tracking-tight ${state.speed ? 'text-[#8888A0]' : 'text-white'}`}>Speed Run</span>
            <span className="text-[10px] text-[#8888A0] uppercase font-bold tracking-widest mt-1 block">30 Equations • Timer</span>
          </div>
        </Link>

        {/* Accuracy Trial */}
        <Link href={state.accuracy ? '#' : '/app/dungeon/accuracy'} className={`rounded-[24px] p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.01)] flex flex-col justify-between h-[160px] relative transition-all duration-300 ${state.accuracy ? 'bg-[#0A0A0C] opacity-50 cursor-not-allowed' : 'bg-[#18181C] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] cursor-pointer'}`}>
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-[16px] shadow-inner ${state.accuracy ? 'bg-[rgba(0,217,126,0.1)]' : 'bg-[rgba(255,176,32,0.05)]'}`}>
              {state.accuracy ? <CheckCircle2 className="text-[#00D97E]" size={24} /> : <Crosshair className="text-[#FFB020]" size={24} />}
            </div>
          </div>
          <div>
            <span className={`text-xl font-black block tracking-tight ${state.accuracy ? 'text-[#8888A0]' : 'text-white'}`}>Accuracy Trial</span>
            <span className="text-[10px] text-[#8888A0] uppercase font-bold tracking-widest mt-1 block">20 Equations • 3 Lives</span>
          </div>
        </Link>

        {/* Boss Battle */}
        <Link href={state.boss ? '#' : '/app/dungeon/boss'} className={`rounded-[24px] p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.01)] flex flex-col justify-between h-[160px] relative transition-all duration-300 ${state.boss ? 'bg-[#0A0A0C] opacity-50 cursor-not-allowed' : 'bg-[#18181C] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] cursor-pointer'}`}>
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-[16px] shadow-[inset_0_2px_10px_rgba(232,43,43,0.3)] ${state.boss ? 'bg-[rgba(0,217,126,0.1)]' : 'bg-[rgba(232,43,43,0.1)]'}`}>
              {state.boss ? <CheckCircle2 className="text-[#00D97E]" size={24} /> : <Skull className="text-[#E82B2B]" size={24} />}
            </div>
          </div>
          <div>
            <span className={`text-xl font-black block tracking-tight ${state.boss ? 'text-[#8888A0]' : 'text-white'}`}>Boss Combat</span>
            <span className="text-[10px] text-[#8888A0] uppercase font-bold tracking-widest mt-1 block">10 Equations • +2 Rank Limit</span>
          </div>
        </Link>

      </div>
    </div>
  )
}
