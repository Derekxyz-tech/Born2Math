'use client'

import { useState, useRef, useEffect } from 'react'
import { getProblemAction, submitAnswerAction } from '@/app/actions/mathActions'
import { buyFreezeAction } from '@/app/actions/shopActions'
import { ensureUserExistsAction, getUserStatsAction } from '@/app/actions/userActions'
import { Flame, Snowflake, ChevronRight } from 'lucide-react'
import { XP_THRESHOLDS } from '@/utils/rankLogic'

import RankUpCinematic from '@/components/ui/RankUpCinematic'
import ResultsOverlay from '@/components/ui/ResultsOverlay'
import DungeonHub from '@/components/ui/DungeonHub'

export default function DashboardDesktop() {
  const [problem, setProblem] = useState<any>(null)
  const [answerInput, setAnswerInput] = useState('')
  const [status, setStatus] = useState<{msg: string, isError: boolean} | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [userStats, setUserStats] = useState({ xp: 0, coins: 0, internalRank: 'E', streak: 0, freezes: 1 })
  const startTime = useRef<number>(0)

  const [viewState, setViewState] = useState<'generator' | 'rankup' | 'results'>('generator')
  const [resultsStats, setResultsStats] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      await ensureUserExistsAction()
      const data = await getUserStatsAction()
      if (data) setUserStats({ xp: data.total_xp, coins: data.coins, internalRank: data.rank, streak: data.streak_current || 0, freezes: data.streak_freezes_available || 1 })
    }
    init()
  }, [])

  const handleStart = async () => {
    setLoading(true)
    setStatus(null)
    setAnswerInput('')
    try {
      const data = await getProblemAction(userStats.internalRank)
      if (data) {
        setProblem(data)
        startTime.current = Date.now()
        setViewState('generator')
      }
    } catch (e: any) {
      setStatus({ msg: (e as Error).message, isError: true })
    }
    setLoading(false)
  }

  const handleBuyFreeze = async () => {
    setLoading(true)
    const res = await buyFreezeAction()
    if (res.success) {
      setStatus({ msg: res.message || 'Freeze Purchased Successfully!', isError: false })
      setUserStats(prev => ({ ...prev, coins: prev.coins - 100, freezes: prev.freezes + 1 }))
    } else {
      setStatus({ msg: `❌ ${res.reason}`, isError: true })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!problem || !answerInput) return
    
    setLoading(true)
    const timeSpentMs = Date.now() - startTime.current
    
    const res = await submitAnswerAction(
      problem.payload, 
      parseInt(answerInput, 10), 
      timeSpentMs, 
      problem.baseXp,
      problem.rank
    )

    if (res.success) {
      setResultsStats({
        earnedXp: res.earnedXp || 0,
        earnedCoins: res.earnedCoins || 0,
        timeMs: timeSpentMs,
        baseXp: problem.baseXp,
        streakCurrent: (res.streakData as any)?.newStreak || userStats.streak,
        newRank: res.newRank || '',
        rankUp: res.rankUp || false,
        coinReward: res.earnedCoins || 0
      })
      
      setUserStats(prev => ({
        xp: prev.xp + (res.earnedXp || 0),
        coins: prev.coins + (res.earnedCoins || 0),
        internalRank: res.newRank || prev.internalRank,
        streak: (res.streakData as any)?.newStreak || prev.streak,
        freezes: (res.streakData as any)?.usedFreeze ? prev.freezes - 1 : prev.freezes
      }))

      if (res.rankUp) {
        setViewState('rankup')
      } else {
        setViewState('results')
      }
    } else {
      setStatus({ msg: `❌ ${res.reason}`, isError: true })
    }
    setLoading(false)
    setAnswerInput('')
  }

  // --- PROGRESS CALCULATIONS ---
  const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'NATIONAL_LEVEL']
  const currentRank = userStats.internalRank || 'E'
  const currentIdx = ranks.indexOf(currentRank)
  const isMax = currentRank === 'NATIONAL_LEVEL'
  
  const nextRank = isMax ? 'MAX' : ranks[currentIdx + 1]
  const currentThreshold = XP_THRESHOLDS[currentRank as keyof typeof XP_THRESHOLDS] || 0
  const nextThreshold = isMax ? currentThreshold : (XP_THRESHOLDS[nextRank as keyof typeof XP_THRESHOLDS] || 0)
  
  const xpInCurrentRank = userStats.xp - currentThreshold
  const xpNeededInCurrentRank = nextThreshold - currentThreshold
  const progressPercent = isMax ? 100 : Math.min(100, Math.max(0, (xpInCurrentRank / xpNeededInCurrentRank) * 100))
  const xpRemaining = isMax ? 0 : nextThreshold - userStats.xp


  return (
    <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-500 pb-24 md:pb-0">
      
      {/* 🎬 MODAL INJECTIONS 🎬 */}
      {viewState === 'rankup' && resultsStats && (
        <RankUpCinematic 
          newRank={resultsStats.newRank} 
          coinReward={resultsStats.coinReward} 
          onComplete={() => setViewState('results')}
        />
      )}
      {viewState === 'results' && resultsStats && (
        <ResultsOverlay 
          stats={resultsStats} 
          onClose={() => {
            setViewState('generator')
            setProblem(null)
            setResultsStats(null)
            setAnswerInput('')
          }}
        />
      )}

      {/* Grid Layout bridging Mobile Column -> Desktop Split Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">

        {/* ========================================================== */}
        {/* LEFT PANE | THE COMMAND ENGINE (Mapping to the Planner App)*/}
        {/* ========================================================== */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <DungeonHub />
          
          <div className="w-full bg-[#111114] rounded-[40px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.02)] min-h-[500px] lg:min-h-[700px] flex flex-col relative select-none">
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-[#8888A0] mb-8 tracking-tight">
              Command Sequence
            </h1>

            {/* The Floating Generator */}
            <div className="flex-grow flex flex-col justify-center">
              {!problem ? (
                <button 
                  onClick={handleStart} 
                  disabled={loading} 
                  className="w-full h-full min-h-[300px] bg-gradient-to-b from-[#18181A] to-[#111114] border border-[rgba(255,255,255,0.02)] rounded-[32px] font-bold tracking-widest text-lg md:text-xl text-[#8888A0] uppercase shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] hover:text-white hover:border-[rgba(232,43,43,0.5)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(232,43,43,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]"></div>
                  {loading ? 'Compiling Matrix...' : `Engage Div-${userStats.internalRank.replace('NATIONAL_LEVEL', 'NATIONAL')}`}
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="w-full h-full min-h-[300px] bg-[#0A0A0C] rounded-[32px] p-8 shadow-[inset_0_20px_40px_rgba(0,0,0,0.9)] border border-[rgba(255,255,255,0.01)] flex flex-col items-center justify-center">
                  <span className="text-[#E82B2B] text-xs uppercase tracking-widest font-bold mb-8 animate-pulse"><span className="w-2 h-2 rounded-full bg-[#E82B2B] inline-block mr-2"></span>Live Sequence</span>
                  
                  <div className="text-5xl md:text-7xl font-mono mb-12 tracking-tighter text-white text-center">
                    {problem.equation.split(' ').map((part:string, i:number) => (
                      <span key={i} className={['+','-','×','÷'].includes(part) ? 'text-[#3E3E4A] mx-4 md:mx-6' : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]'}>{part}</span>
                    ))}
                  </div>

                  <input 
                    type="number" 
                    autoFocus 
                    value={answerInput} 
                    onChange={e => setAnswerInput(e.target.value)} 
                    className="w-full max-w-sm bg-[#14141A] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] border-none focus:ring-1 focus:ring-[#E82B2B] rounded-[24px] p-6 text-white text-center text-3xl font-mono mb-6 outline-none transition-all placeholder:text-[#333]" 
                    placeholder="..."
                  />
                  
                  <button type="submit" disabled={loading} className="w-full max-w-sm bg-white text-black p-5 rounded-[20px] font-bold tracking-wide shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-[#E82B2B] hover:text-white hover:shadow-[0_15px_30px_rgba(232,43,43,0.4)] transition-all duration-300 uppercase">
                    Submit Solution
                  </button>
                </form>
              )}
            </div>

            {status && (
              <div className={`mt-6 w-full p-4 rounded-xl text-xs font-semibold text-center border shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] ${status.isError ? 'bg-[#E82B2B]/5 border-[#E82B2B]/20 text-[#E82B2B]' : 'bg-[#00D97E]/5 border-[#00D97E]/20 text-[#00D97E]'}`}>
                {status.msg}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT PANE | INTELLIGENCE (Mapping to the Todo/Schedule) */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Division Protocol */}
          <div className="w-full bg-[#111114] rounded-[40px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.01)] relative overflow-hidden group min-h-[280px] flex flex-col justify-between">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-[rgba(232,43,43,0.02)] rounded-full blur-3xl group-hover:bg-[rgba(232,43,43,0.04)] transition-all duration-1000"></div>
            
            <div>
              <h3 className="text-[#8888A0] text-xs font-bold tracking-widest uppercase mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E82B2B]"></span> Active Protocol
                </span>
                <span className="text-[10px] opacity-50 flex items-center gap-1">
                  Next: <span className="text-white">{nextRank.replace('NATIONAL_LEVEL','NAT')}</span>
                </span>
              </h3>
              
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl lg:text-6xl font-black text-white block tracking-tighter leading-none">{currentRank.replace('NATIONAL_LEVEL', 'NAT')}</span>
                {!isMax && (
                   <span className="text-xs text-[#4A4A5A] font-bold uppercase tracking-widest">
                     {xpRemaining.toLocaleString()} XP REMAINING
                   </span>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="w-full h-3 bg-[#0A0A0C] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden border border-[rgba(255,255,255,0.01)]">
                <div 
                  className="h-full bg-gradient-to-r from-[#E82B2B] to-[#FF4444] shadow-[0_0_15px_rgba(232,43,43,0.4)] transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-[10px] text-[#4A4A5A] font-black uppercase tracking-widest">
                  {userStats.xp.toLocaleString()} XP
                </span>
                <span className="text-[10px] text-[#8888A0] font-black uppercase tracking-widest">
                  {isMax ? 'ASCENDED' : `${Math.floor(progressPercent)}% COMPLETE`}
                </span>
              </div>
            </div>
          </div>

          {/* Economy Sector */}
          <div className="w-full bg-[#111114] rounded-[40px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.01)]">
            <h3 className="text-[#8888A0] text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Treasury
            </h3>
            <span className="text-4xl lg:text-5xl font-mono text-white block mb-8 font-semibold tracking-tighter">{userStats.coins.toLocaleString()}</span>
          </div>

          {/* Streak Integrity */}
          <div className="w-full bg-[#111114] rounded-[40px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.01)] h-full flex flex-col justify-between">
            <div>
              <h3 className="text-[#8888A0] text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E82B2B]"></span> Streak Integrity
              </h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center ${userStats.streak > 0 ? 'bg-[rgba(232,43,43,0.1)] text-[#E82B2B] shadow-[inset_0_0_20px_rgba(232,43,43,0.2)]' : 'bg-[#18181A] text-[#4A4A5A]'}`}>
                  <Flame size={24} />
                </div>
                <span className="font-mono text-3xl font-semibold text-white">{userStats.streak} <span className="text-xl text-[#8888A0]">Days</span></span>
              </div>
            </div>

            <div className="bg-[#18181C] rounded-[24px] p-4 flex items-center justify-between">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center">
                  <Snowflake size={14} className="text-[#8888A0]" />
                </div>
                <span className="font-mono font-bold text-white text-lg">{userStats.freezes}x</span>
              </div>
              <button 
                onClick={handleBuyFreeze} 
                disabled={loading || userStats.coins < 100} 
                className="px-3 py-2 rounded-[14px] bg-[rgba(255,255,255,0.05)] text-xs font-bold text-white uppercase tracking-widest hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-30 disabled:hover:bg-[rgba(255,255,255,0.05)]"
              >
                +1 (100)
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
