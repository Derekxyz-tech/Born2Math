'use client'

import { useEffect, useState, useRef } from 'react'
import { getProblemAction, submitAnswerAction } from '@/app/actions/mathActions'
import { clearDungeonAction, fetchDungeonStateAction } from '@/app/actions/dungeonActions'
import { getUserStatsAction } from '@/app/actions/userActions'
import { getBossRank } from '@/utils/mathEngine'
import { useRouter } from 'next/navigation'
import { Skull, Timer, Crosshair, ArrowLeft, Heart } from 'lucide-react'
import RankUpCinematic from '@/components/ui/RankUpCinematic'

export default function DungeonArena({ params }: { params: { type: string } }) {
  const router = useRouter()
  const [problem, setProblem] = useState<any>(null)
  const [answerInput, setAnswerInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  
  const [cleared, setCleared] = useState(false)
  const [failed, setFailed] = useState(false)

  // Arena States
  const [userRank, setUserRank] = useState('E')
  const [solvedCount, setSolvedCount] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(60)
  const [rankUpData, setRankUpData] = useState<{newRank: string, coinReward: number} | null>(null)

  // Config mapping
  const config = {
    speed: { target: 30, useTimer: true, initialTimer: 120, label: 'Speed Run', icon: <Timer/>, color: '#60C8FF' },
    accuracy: { target: 20, useLives: true, initialLives: 3, label: 'Accuracy Trial', icon: <Crosshair/>, color: '#FFB020' },
    boss: { target: 10, isBoss: true, label: 'Boss Combat', icon: <Skull/>, color: '#E82B2B' }
  }[params.type] || { target: 999, label: 'Unknown Dungeon', icon: <Skull/>, color: '#FFF' }

  const startTime = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function init() {
      const data = await getUserStatsAction()
      if (data) setUserRank(data.rank)
      // Strict Anti-Exploit Check: Has this matrix already been neutralized today?
      const currentState = await fetchDungeonStateAction()
      if (currentState[params.type as keyof typeof currentState]) {
        setCleared(true)
        setStatus('MATRIX ALREADY NEUTRALIZED TODAY. AWAIT MIDNIGHT RESET.')
      }
    }
    init()
  }, [])

  // Timer Manager for Speed Run
  useEffect(() => {
    if (config.useTimer && problem && !cleared && !failed) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setFailed(true)
            setStatus("TIME EXPIRED. THE DUNGEON HAS COLLAPSED.")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout)
  }, [problem, cleared, failed])

  const generateNext = async () => {
    setLoading(true)
    try {
      const targetRank = config.isBoss ? getBossRank(userRank) : userRank
      const data = await getProblemAction(targetRank)
      setProblem(data)
      startTime.current = Date.now()
    } catch(e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleStart = () => {
    if (config.useTimer) setTimeLeft(config.initialTimer)
    if (config.useLives) setLives(config.initialLives)
    setSolvedCount(0)
    setStatus(null)
    setFailed(false)
    setCleared(false)
    generateNext()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!problem || !answerInput || cleared || failed) return
    
    setLoading(true)
    const timeSpentMs = Date.now() - startTime.current
    
    // We pass isTraining=true to avoid the Infinite Grinder xp/coins drip completely.
    // Dungeons ONLY reward their massive payload precisely when fully cleared.
    const res = await submitAnswerAction(
      problem.payload, 
      parseInt(answerInput, 10), 
      timeSpentMs, 
      problem.baseXp,
      problem.rank,
      true 
    )

    setAnswerInput('')

    if (res.success) {
      const newCount = solvedCount + 1
      setSolvedCount(newCount)

      if (newCount >= config.target) {
        setCleared(true)
        setStatus("ACCESSING MAINFRAME REWARDS...")
        const clearRes = await clearDungeonAction(params.type as 'speed'|'accuracy'|'boss')
        setStatus(clearRes.message)
        if (clearRes.rankUp && clearRes.newRank) {
          setRankUpData({ newRank: clearRes.newRank, coinReward: clearRes.coinReward || 0 })
        }
      } else {
        generateNext()
      }
    } else {
      if (config.useLives) {
        const newLives = lives - 1
        setLives(newLives)
        if (newLives <= 0) {
          setFailed(true)
          setStatus("CRITICAL INTEGRITY FAILURE. DUNGEON ABORTED.")
        } else {
          generateNext() // Let them keep trying their next life
        }
      } else if (config.useTimer || config.isBoss) {
        // Failing a problem in speed/boss does not fail the run unless we want it to.
        // Let's say Boss failing immediately wipes you.
        if (config.isBoss) {
          setFailed(true)
          setStatus("YOU WERE ANNIHILATED BY THE BOSS SEQUENCE.")
        } else {
          generateNext() // Speed mode just loses time!
        }
      }
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-500 pb-24 md:pb-0 h-screen flex flex-col justify-center items-center">
      
      {rankUpData && (
        <RankUpCinematic 
          newRank={rankUpData.newRank} 
          coinReward={rankUpData.coinReward} 
          onComplete={() => setRankUpData(null)}
        />
      )}

      <div className="w-full max-w-2xl">
        <button onClick={() => router.push('/app')} className="text-[#8888A0] hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={16}/> Abort Protocol
        </button>

        <div className="w-full bg-[#111114] rounded-[40px] p-8 lg:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.02)] min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl opacity-10 blur-3xl rounded-full" style={{ backgroundColor: config.color }}></div>

          <div className="flex items-center gap-4 mb-8 z-10">
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shadow-inner bg-[rgba(255,255,255,0.02)]" style={{ color: config.color }}>
              {config.icon}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none">{config.label}</h1>
              <span className="text-[10px] text-[#8888A0] font-bold tracking-widest uppercase">Target Sequence: {config.target} Nodes</span>
            </div>
          </div>

          {/* Core Arena Controller */}
          <div className="w-full h-full flex flex-col items-center justify-center z-10 w-full">
            
            {cleared || failed ? (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${cleared ? 'bg-[rgba(0,217,126,0.1)] text-[#00D97E]' : 'bg-[rgba(232,43,43,0.1)] text-[#E82B2B]'}`}>
                  {cleared ? <Timer size={48}/> : <Skull size={48}/>}
                </div>
                <h2 className={`text-2xl font-black uppercase tracking-tight mb-4 ${cleared ? 'text-[#00D97E]' : 'text-[#E82B2B]'}`}>
                  {cleared ? 'Matrix Conquered' : 'Mission Failed'}
                </h2>
                <p className="text-[#8888A0] text-sm text-center font-bold tracking-widest mb-8 uppercase max-w-sm">{status}</p>
                <button onClick={() => { router.push('/app'); router.refresh(); }} className="px-8 py-4 rounded-[20px] bg-white text-black font-black tracking-widest uppercase hover:bg-[#60C8FF] transition-colors shadow-lg">Return to Hub</button>
              </div>
            ) : !problem ? (
              <button 
                onClick={handleStart} 
                disabled={loading}
                className={`w-full py-8 text-2xl rounded-[24px] font-black uppercase tracking-widest transition-all shadow-inner disabled:opacity-50 text-white`}
                style={{ backgroundColor: `${config.color}20`, border: `1px solid ${config.color}40` }}
              >
                Engage Trial
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                
                {/* HUD */}
                <div className="w-full flex justify-between items-center mb-10 px-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#8888A0] font-bold uppercase tracking-widest">Progress</span>
                    <span className="text-3xl font-mono font-black text-white">{solvedCount} <span className="text-[#4A4A5A]">/ {config.target}</span></span>
                  </div>

                  {config.useTimer && (
                     <div className="flex flex-col items-end">
                      <span className="text-[10px] text-[#8888A0] font-bold uppercase tracking-widest">Integrity Drop</span>
                      <span className={`text-4xl font-mono font-black ${timeLeft < 15 ? 'text-[#E82B2B] animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
                    </div>
                  )}

                  {config.useLives && (
                     <div className="flex items-center gap-2">
                       {Array.from({length: 3}).map((_, i) => (
                         <Heart key={i} size={24} className={i < lives ? 'text-[#E82B2B]' : 'text-[#2A2A35]' } fill={i < lives ? '#E82B2B' : 'transparent'} />
                       ))}
                    </div>
                  )}
                </div>

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
                  className="w-full max-w-sm bg-[#14141A] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] border-none focus:ring-1 focus:ring-[#8888A0] rounded-[24px] p-6 text-white text-center text-4xl font-mono mb-6 outline-none transition-all placeholder:text-[#333]" 
                  placeholder="..."
                />
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
